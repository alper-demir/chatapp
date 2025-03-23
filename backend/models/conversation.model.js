import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Only for group conversations
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

export default mongoose.model("Conversation", ConversationSchema);