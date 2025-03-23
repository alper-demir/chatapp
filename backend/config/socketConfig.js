import { Server } from "socket.io";
import Message from "../models/message.model.js";

let io;

export const createSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Yeni bir kullanıcı bağlandı: " + socket.id);

        // Kullanıcı bir odaya katıldığında
        socket.on("joinRoom", async (conversationId, userId) => {
            console.log(`${userId} kullanıcı ID'si, ${conversationId} sohbet odasına katıldı.`);

            socket.join(conversationId); // Kullanıcıyı odaya dahil et

            // Odaya katıldığında tüm mesajları okundu olarak işaretle
            await markMessagesAsRead(conversationId, userId);

            // Odaya katılan kullanıcılara mesajları anlık olarak gönder
            io.to(conversationId).emit("roomJoined", { userId, conversationId });

            // Kullanıcının katıldığı odada mesaj okundu durumu
            socket.on("readMessage", async (messageId) => {
                await markMessageAsRead(messageId, userId);
                io.to(conversationId).emit("messageRead", { messageId, userId });
            });
        });

        // Kullanıcı ayrıldığında
        socket.on("disconnect", () => {
            console.log("Bir kullanıcı ayrıldı: " + socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO server has not been initialized.");
    }
    return io;
};

const markMessagesAsRead = async (conversationId, userId) => {
    try {
        // Sohbet odasındaki tüm mesajları güncelle
        await Message.updateMany(
            { conversationId },
            { $addToSet: { readBy: userId } } // Okundu alanına userId'yi ekle
        );
    } catch (error) {
        console.error("Mesajlar okundu olarak işaretlenemedi", error);
    }
};

// Tek bir mesajı okundu olarak işaretleyen fonksiyon
const markMessageAsRead = async (messageId, userId) => {
    try {
        // Belirli bir mesajı okundu olarak işaretle
        await Message.findByIdAndUpdate(
            messageId,
            { $addToSet: { readBy: userId } } // Okundu alanına userId'yi ekle
        );
    } catch (error) {
        console.error("Mesaj okundu olarak işaretlenemedi", error);
    }
};