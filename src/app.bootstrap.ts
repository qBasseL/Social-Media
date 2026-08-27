import express from "express";
import { authRouter, userRouter } from "./modules";
import { GlobalErrorHandler } from "./middlewares";
import { PORT } from "./config/config";
import connectDB from "./DB/connection.db";
import { redisService, s3service, successResponse } from "./common";
import { promisify } from "node:util";
import { pipeline } from "node:stream";

const s3WriteStream = promisify(pipeline);

const bootstrap = async () => {
  const app: express.Express = express();

  app.use(express.json());

  await connectDB();
  await redisService.connectRedis();

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use(
    "/uploads/*path",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const { download, fileName } = req.query as {
        download: string;
        fileName: string;
      };
      const { path } = req.params as { path: string[] };
      const Key = path.join("/");
      const { Body, ContentType } = await s3service.getAsset({ Key });
      res.setHeader("Content-Type", ContentType || "application/octet-stream");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
      if (download === "true") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName || Key.split("/").pop()}"`,
        );
      }
      return await s3WriteStream(Body as NodeJS.ReadableStream, res);
    },
  );
  app.use(
    "/pre-signed/*path",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const { download, fileName } = req.query as {
        download: string;
        fileName: string;
      };
      const { path } = req.params as { path: string[] };
      const Key = path.join("/");
      const url = await s3service.generateFetchPreSignedLink({
        Key,
        download,
        fileName,
      });
      return successResponse({ res, data: { url } });
    },
  );
  app.use(
    "{/*dummy}",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      res.status(404).json({ message: "Not Found" });
    },
  );

  app.use(GlobalErrorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default bootstrap;
