import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config";

class RedisService {
    private readonly client: RedisClientType
    constructor() {
        this.client = createClient({url: REDIS_URI})
        this.handleEvent()
    }

    private handleEvent () {
        this.client.on('error', (error) => {
            console.log(`Couldn't connect to redis, ${error}`)
        })
    }

    public async connectRedis() {

        try {
            await this.client.connect()
            console.log(`Connected to redis successfully`)
        } catch (error) {
            console.error('Something went wrong with redis connection')
        }
    }

}

export const redisService = new RedisService()