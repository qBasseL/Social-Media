import { CreateOptions, HydratedDocument, Model } from "mongoose";

export class DatabaseRepository<T> {
    constructor(protected readonly model: Model<T>) { }

    async create({ data, options }: { data: Partial<T>[], options?: CreateOptions | undefined }): Promise<HydratedDocument<T>[]> {
        return this.model.create(data as any, options)
    }
}