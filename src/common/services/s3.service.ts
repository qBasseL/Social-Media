import {
  CompleteMultipartUploadCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  APPLICATION_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_EXPIRES_IN,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config/config";
import { randomUUID } from "crypto";
import { BadRequestException } from "../exceptions";
import { MulterEnum } from "../enums";
import { createReadStream } from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
  private client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  public async uploadAsset({
    storageApproach = MulterEnum.Memory,
    Bucket = AWS_BUCKET_NAME,
    Path = "general",
    ACL = ObjectCannedACL.private,
    ContentType,
    File,
  }: {
    storageApproach?: MulterEnum;
    Bucket?: string;
    Path?: string;
    ACL?: ObjectCannedACL;
    ContentType?: string | undefined;
    File: Express.Multer.File;
  }) {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${APPLICATION_NAME}/${Path}/${randomUUID()}__${File.originalname}`,
      ACL,
      ContentType: File.mimetype,
      Body:
        storageApproach === MulterEnum.Memory
          ? File.buffer
          : createReadStream(File.path),
    });

    if (!command.input.Key) {
      throw new BadRequestException("Failed to upload this asset");
    }

    await this.client.send(command);

    return command.input?.Key;
  }

  public async uploadLargeAsset({
    storageApproach = MulterEnum.Disk,
    Bucket = AWS_BUCKET_NAME,
    Path = "general",
    ACL = ObjectCannedACL.private,
    ContentType,
    File,
    partSize = 5,
  }: {
    storageApproach?: MulterEnum;
    Bucket?: string;
    Path?: string;
    ACL?: ObjectCannedACL;
    ContentType?: string;
    File: Express.Multer.File;
    partSize?: number;
  }): Promise<CompleteMultipartUploadCommandOutput> {
    const fileUpload = new Upload({
      client: this.client,
      params: {
        Bucket: AWS_BUCKET_NAME,
        Key: `${APPLICATION_NAME}/${Path}/${randomUUID()}__${File.originalname}`,
        ACL: ObjectCannedACL.private,
        Body:
          storageApproach === MulterEnum.Memory
            ? File.buffer
            : createReadStream(File.path),
        ContentType: File.mimetype,
      },
      partSize: partSize * 1024 * 1024,
    });

    return fileUpload.done();
  }

  public async uploadAssets({
    storageApproach = MulterEnum.Memory,
    Bucket = AWS_BUCKET_NAME,
    Path = "general",
    ACL = ObjectCannedACL.private,
    ContentType,
    Files,
  }: {
    storageApproach?: MulterEnum;
    Bucket?: string;
    Path?: string;
    ACL?: ObjectCannedACL;
    ContentType?: string;
    Files: Express.Multer.File[];
  }): Promise<string[]> {
    const urls = Promise.all(
      Files.map((File) => {
        return this.uploadAsset({
          storageApproach,
          Bucket,
          File,
          ACL,
          Path,
          ContentType,
        });
      }),
    );

    return urls;
  }

  public async generatePreSignedLink({
    Bucket = AWS_BUCKET_NAME,
    Path = "general",
    ContentType,
    originalName,
    expiresIn = AWS_EXPIRES_IN,
  }: {
    Bucket?: string;
    Path?: string;
    ContentType: string;
    originalName: string;
    expiresIn?: number;
  }) {

    const command = new PutObjectCommand({
      Bucket,
      Key: `${APPLICATION_NAME}/${Path}/${randomUUID()}__${originalName}`,
      ContentType,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });

    return { url, key: command.input.Key };
  }

  public async generateFetchPreSignedLink({
    Bucket = AWS_BUCKET_NAME,
    Key = "general",
    expiresIn = AWS_EXPIRES_IN,
    fileName,
    download,
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    fileName?: string;
    download?: string;
  }): Promise<String> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition:
        download === "true"
          ? `attachment; filename="${fileName || Key.split("/").pop()}"`
          : undefined,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });

    return url;
  }

  public async getAsset({
    Bucket = AWS_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key?: string;
  }): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });

    return await this.client.send(command);
  }
}

export const s3service = new S3Service();
