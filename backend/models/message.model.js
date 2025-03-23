import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'audio'],
        default: 'text'
    },
    content: { type: String }, // Metin mesajları için
    mediaUrl: { type: String }, // Görsel, video, ses gibi dosyalar için
    mediaType: { type: String, enum: ['image', 'video', 'audio'], required: function () { return !!this.mediaUrl; } }, // Media varsa zorunlu
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Kimler okudu?
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' } // Yanıtlanan mesaj
}, { timestamps: true });

export default mongoose.model("Message", MessageSchema);