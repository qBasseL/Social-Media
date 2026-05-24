import { CreateOptions, HydratedDocument, Model,  PopulateOptions, ProjectionType, QueryFilter, QueryOptions } from "mongoose";


export abstract class DatabaseRepository<T> {
    constructor(protected readonly model: Model<T>) { }

    async create({ data }: {
        data: Partial<T>,
    }
    ): Promise<HydratedDocument<T>>

    async create({ data, options }: {
        data: Partial<T>[],
        options?: CreateOptions | undefined
    }
    ): Promise<HydratedDocument<T>[]>

    async create({ data, options }: {
        data: Partial<T>[] | Partial<T>,
        options?: CreateOptions | undefined
    }
    ): Promise<HydratedDocument<T>[] | HydratedDocument<T>> {
        return await this.model.create(data as any, options)
    }

    async createOne({ data, options }: { data: Partial<T>, options?: CreateOptions | undefined }): Promise<HydratedDocument<T>> {
        const [doc] = await this.create({ data: [data], options }) || []
        return doc as HydratedDocument<T>
    }

    //Finds

async findOne({ filter, projection, options, populate }: {
    filter?: QueryFilter<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
    populate?: PopulateOptions | PopulateOptions[]
}) {
    const query = this.model.findOne(filter, projection, options)

    if (populate) {
        query.populate(populate)
    }

    return await query
}
}