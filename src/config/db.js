import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('CONNECTED TO THE DATABASE')
  } catch (error) {
    console.error("FAILED TO CONNECT WITH DB", error.message)
  }
}

export default connectDB