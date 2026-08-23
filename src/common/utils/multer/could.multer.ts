import multer from "multer";
import { MulterEnum } from "../../enums";
import { Request } from "express";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

export const cloudFileUpload = ({
  storageApproach = MulterEnum.Memory,
}: {
  storageApproach?: MulterEnum;
}) => {
  const storage =
    storageApproach === MulterEnum.Memory
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: function (
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void,
          ) {
            callback(null, tmpdir());
          },
          filename: function (
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void,
          ) {
            callback(null, `${randomUUID()}__${file.originalname}`);
          },
        });
  return multer({ storage });
};
