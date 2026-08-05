import express from "express";
import { authRouter } from "./modules";
import { GlobalErrorHandler } from "./middlewares";
import { PORT } from "./config/config";
import connectDB from "./DB/connection.db";
import { redisService } from "./common";
import { UserModel } from "./DB/models/user.model";

const bootstrap = async () => {
  const app: express.Express = express();

  app.use(express.json());

  await connectDB();
  await redisService.connectRedis();

  app.use("/auth", authRouter);

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

  const user = await new UserModel({
    username: "Bassel Alaa",
    email: `${Date.now()}@gmail.com`,
    password: "564643453",
  }).save();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default bootstrap;
