import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  APPLICATION_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config/config";
import { randomUUID } from "crypto";
import { BadRequestException } from "../exceptions";
import { MulterEnum } from "../enums";
import { createReadStream } from "fs";

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
    ContentType?: string;
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
}

export const s3service = new S3Service();
