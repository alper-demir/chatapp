import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'system'],
        default: 'text'
    },
    systemMessageType: {
        type: String,
        enum: ['user_joined', 'user_left', 'user_kicked', 'user_added', 'group_info_updated', 'user_joined_with_invitation_link', 'user_granted_admin'],
        default: null
    },
    performer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Eylemi gerçekleştiren kullanıcı (gruba ekleme/çıkarma)
    performedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Eyleme maruz kalan kullanıcı (gruba eklenen/çıkarılan)
    content: { type: String }, // Metin mesajları için
    mediaUrl: { type: String }, // Görsel, video, ses gibi dosyalar için
    mediaType: { type: String, enum: ['image', 'video', 'audio'], required: function () { return !!this.mediaUrl; } }, // Media varsa zorunlu
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Kimler okudu?
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' } // Yanıtlanan mesaj
}, { timestamps: true });

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model("Message", MessageSchema);