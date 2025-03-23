import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, unique: true, sparse: true }, // Google Auth için
    email: { type: String, unique: true, required: true },
    password: { type: String, required: function () { return !this.firebaseUid; } }, // Firebase auth kullananlar için zorunlu değil
    firstName: { type: String },
    lastName: { type: String },
    avatar: { type: String },
    isOnline: { type: Boolean, default: false }
}, { timestamps: true })


export default mongoose.model("User", userSchema);