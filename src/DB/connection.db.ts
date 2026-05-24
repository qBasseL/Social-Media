import { connect } from "mongoose"
import { DB_URI } from "../config/config"

const connectDB = async () => {
    try {
        await connect(DB_URI, { serverSelectionTimeoutMS: 5000, minPoolSize: 2, maxPoolSize: 10 })
        console.log(`DB Connected Successfully`)
    } catch (error) {
        console.error("Error connecting to MongoDB:", error)
    }
}

export default connectDB