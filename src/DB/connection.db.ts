import {connect} from "mongoose"

const connectDB = async () => {
    try {
        await connect(process.env.DB_URI as string, {serverSelectionTimeoutMS: 5000})
        console.log(`DB Connected Successfully`)
    } catch (error) {
        console.error("Error connecting to MongoDB:", error)
    }
}

export default connectDB