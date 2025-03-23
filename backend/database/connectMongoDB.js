import mongoose from "mongoose";

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas database..");
    }
    catch (err) {
        console.log("MongoDB Atlas connection error!");
    }
}

export default connection;