import { Server } from "socket.io";
import Message from "../models/message.model.js"
import Conversation from "../models/conversation.model.js"

let io;

const onlineUsers = new Map(); // Kullanıcıların online durumunu takip et

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("New user connected: ", socket.id);

        // Kullanıcı online olduğunda
        socket.on("online", (userId) => {
            onlineUsers.set(userId, socket.id); // Kullanıcıyı kaydet
            socket.userId = userId; // Soket objesine userId ata
            io.emit("onlineUsers", Array.from(onlineUsers.keys())); // Güncellenmiş online listeyi yay
        });

        // Kullanıcı bağlantıyı kopardığında offline yap
        socket.on("disconnect", () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId); // Kullanıcıyı sil
                console.log(`User ${socket.userId} disconnected`);
                io.emit("onlineUsers", Array.from(onlineUsers.keys())); // Güncellenmiş online listeyi yay
            }
        });

        // Odaya katılma event'i
        socket.on("joinRoom", (roomId, userId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room: ${roomId} id: ${userId}`);
        });

        socket.on("joinUser", (userId) => {
            socket.join(userId);
            console.log(`User ${socket.id} joined room: ${userId}`);
        })

        // Odadan ayrılma event'i (opsiyonel)
        socket.on("leaveRoom", (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.id} left room: ${roomId}`);
        });

        socket.on("markAsRead", async (data) => {
            console.log(`${data.conversationId} conversation için okundu alanına ${data.userId} ekleniyor`);

            try {
                // Gönderici olmayan ve henüz kullanıcı tarafından okunmamış mesajları güncelle
                await Message.updateMany(
                    {
                        conversationId: data.conversationId,
                        sender: { $ne: data.userId }, // Kendi mesajlarını okundu olarak işaretleme
                        readBy: { $nin: [data.userId] } // Henüz okunmamış mesajlar
                    },
                    { $addToSet: { readBy: data.userId } } // Kullanıcıyı readBy'a ekle, addToSet aynı değeri 2 kez eklemez. Yani userId tekrar tekrar diziye eklenmeyecek
                );

                // Güncellenmiş mesajları al (frontend'e göndermek için)
                const updatedMessages = await Message.find({
                    conversationId: data.conversationId
                }).populate([{ path: "sender", select: { password: 0 } }, { path: "performedUser", select: "username" }, { path: "replyTo", populate: { path: "sender", select: "username" } }]);

                // Odaya güncellenmiş mesajları gönder
                io.to(data.conversationId).emit("receiveMarkAsRead", updatedMessages);

                const updatedConversation = await Conversation.findById(data.conversationId).populate([{ path: "lastMessage", populate: { path: "sender", select: "username" } }, { path: "participants", select: "username" }]);

                updatedConversation.participants.forEach(participant => {
                    io.to(participant._id.toString()).emit("receiveConversation", updatedConversation);
                });

            } catch (error) {
                console.error("markAsRead hatası: ", error);
                // Hata durumunda frontend'e bilgi ver (opsiyonel)
                io.to(data.conversationId).emit("markAsReadError", { message: "Mesajlar okundu olarak işaretlenemedi." });
            }
        });

        socket.on("sendMessage", async (message) => {
            try {
                const newMessage = await Message.create({
                    conversationId: message.conversationId,
                    sender: message.sender,
                    content: message.content,
                    mediaUrl: message.mediaUrl,
                    mediaType: message.type,
                    type: message.type,
                    replyTo: message.replyTo
                });

                // Gönderici bilgileri doldurulmuş mesaj
                const populatedMessage = await Message.findById(newMessage._id)
                    .populate("sender", { password: 0 });

                // Sadece ilgili conversation odasındaki kullanıcılara yeni mesajı gönder
                io.to(message.conversationId).emit("receiveMessage", populatedMessage);

                // Conversation'ın son mesajı güncelleniyor (new:true ile güncel hali alınıyor)
                const updatedConversation = await Conversation.findByIdAndUpdate(
                    message.conversationId,
                    { lastMessage: newMessage._id, updatedAt: Date.now() },
                    { new: true }
                ).populate([{ path: "lastMessage", populate: { path: "sender", select: "username" } }, { path: "participants", select: "username" }]);

                // Conversation güncellemesini, katılımcıların user odalarına gönder
                updatedConversation.participants.forEach(participant => {
                    io.to(participant._id.toString()).emit("receiveConversation", updatedConversation);
                });
            } catch (error) {
                console.error("sendMessage hatası: ", error);
            }
        });

    });
};

export { initializeSocket, io };
