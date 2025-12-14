import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in Vercel env vars");
        }
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        }).then((mongoose) => {
            console.log("✅ MongoDB connected");
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

export default connectDB;