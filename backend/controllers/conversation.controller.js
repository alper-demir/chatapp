import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io } from "../socket/index.js";
import { generateInvitationToken } from "../utils/JWT.js";

export const createConversation = async (req, res) => {
    const { participants, isGroup, userId, groupName } = req.body;

    if (!isGroup) {
        // Bireysel sohbet: Aynı katılımcılar arasında mevcut bir sohbet var mı?
        const existingIndividual = await Conversation.findOne({
            participants: { $all: participants, $size: participants.length },
            isGroup: false
        });

        if (existingIndividual) {
            // Mevcut bireysel sohbeti döndür
            return res.status(200).json(existingIndividual);
        }
    }

    // Grup sohbeti veya bireysel sohbet yoksa: Yeni sohbet oluştur
    const newConversation = await Conversation.create({
        participants,
        isGroup: isGroup || false,
        admins: [userId] || [],
        groupName: groupName || "",
        createdBy: userId || null
    });

    participants.map(participant => { // Oluşturulan conversation bilgisini katılımcılara ilet.
        io.to(participant).emit("receiveConversation", newConversation);
    })

    return res.status(201).json(newConversation);
};

export const getConversations = async (req, res) => {
    // Get all conversations of a user
    const { userId } = req.params;
    try {
        const conversations = await Conversation.find({ participants: userId }).populate([{ path: "lastMessage", populate: { path: "sender", select: "username" } }, { path: "participants", select: "username" }]).sort({ updatedAt: -1 });
        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error!", error });
    }
}

export const getConversationById = async (req, res) => {
    // Get a conversation by conversationId
    const { conversationId } = req.params;

    try {
        const conversation = await Conversation.findById(conversationId).populate([
            { path: "lastMessage", select: "username" },
            { path: "participants", select: "username" },
            { path: "createdBy", select: "username" }
        ]);
        return res.status(200).json(conversation);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error!", error });
    }
}

export const addParticipant = async (req, res) => {
    const { conversationId, userId, performer } = req.body;
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Sohbet bulunamadı" });
        if (!conversation.isGroup) return res.status(400).json({ message: "Bu bir grup sohbeti değil" });
        if (conversation.participants.includes(userId)) {
            return res.status(400).json({ message: "Kullanıcı zaten grupta" });
        }

        conversation.participants.push(userId);
        await conversation.save();

        const updatedConversation = await Conversation.findById(conversationId)
            .populate("participants", "username email avatar")
            .populate("lastMessage");

        // Tüm grup katılımcılarına güncellemeyi gönder
        updatedConversation.participants.forEach((participant) => {
            io.to(participant._id.toString()).emit("receiveConversation", updatedConversation);
        });

        const newSystemMessage = await Message.create({ conversationId, sender: performer, type: "system", systemMessageType: "user_added", performedUser: userId })

        io.to(conversationId).emit("receiveMessage", newSystemMessage);

        res.status(200).json(updatedConversation);
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};

export const removeParticipant = async (req, res) => {
    const { conversationId, userId, performer } = req.body;

    console.log(req.body);


    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Sohbet bulunamadı" });
        if (!conversation.isGroup) return res.status(400).json({ message: "Bu bir grup sohbeti değil" });
        if (!conversation.participants.includes(userId)) return res.status(400).json({ message: "Kullanıcı zaten grupta değil" });

        // Kullanıcıyı participants dizisinden çıkar
        conversation.participants = conversation.participants.filter((p) => p.toString() !== userId);
        conversation.admins = conversation.admins.filter((a) => a.toString() !== userId); // Kullanıcı yöneticisiyse listeden çıkar
        await conversation.save();

        const updatedConversation = await Conversation.findById(conversationId)
            .populate("participants", "username email avatar")
            .populate("lastMessage");

        // Çıkarılan kullanıcıya sohbetin kaldırıldığını bildir
        io.to(userId).emit("removeConversation", { conversationId });

        // Kalan grup katılımcılarına güncellemeyi gönder
        updatedConversation.participants.forEach((participant) => {
            io.to(participant.toString()).emit("receiveConversation", updatedConversation);
        });

        // performer bilgisi varsa bir yönetici tarafından gruptan çıkarılmıştır. 

        if (!performer) {
            // Kullanıcı kendisi ayrılmıştır.
            const newSystemMessage = await Message.create({ conversationId, sender: userId, type: "system", systemMessageType: "user_left", performedUser: userId })
            io.to(conversationId).emit("receiveMessage", newSystemMessage);
        } else {
            const newSystemMessage = await Message.create({ conversationId, sender: performer, type: "system", systemMessageType: "user_kicked", performedUser: userId })
            io.to(conversationId).emit("receiveMessage", newSystemMessage);
        }

        res.status(200).json(updatedConversation);
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};

export const updateGroupInfo = async (req, res) => {
    const { conversationId, groupName, description, userId } = req.body;

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Sohbet bulunamadı" });
        if (!conversation.isGroup) return res.status(400).json({ message: "Bu bir grup sohbeti değil" });

        if (!conversation.admins.includes(userId)) {
            return res.status(403).json({ message: "Bu işlemi yapmak için yönetici yetkisine sahip olmalısınız." });
        }

        conversation.groupName = groupName || conversation.groupName;
        conversation.description = description || conversation.description;
        await conversation.save();

        const systemMessage = await Message.create({
            conversationId,
            sender: userId,
            type: "system",
            systemMessageType: "group_info_updated",
            performer: userId,
        });

        const updatedConversation = await Conversation.findById(conversationId)
            .populate("participants", "username email avatar")
            .populate("lastMessage");

        updatedConversation.participants.forEach((participant) => {
            io.to(participant.toString()).emit("receiveConversation", updatedConversation);
        });

        io.to(conversationId).emit("receiveMessage", systemMessage);

        res.status(200).json(conversation);
    } catch (error) {
        console.error("updateGroupInfo hatası:", error);
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};

export const createConversationGroupInvitve = async (req, res) => {
    const { conversationId, userId } = req.body;
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Sohbet bulunamadı" });
        if (!conversation.isGroup) return res.status(400).json({ message: "Bu bir grup sohbeti değil" });
        if (!conversation.admins.includes(userId)) return res.status(403).json({ message: "Bu işlemi yapmak için yönetici yetkisine sahip olmalısınız." });

        const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
        const token = generateInvitationToken(conversationId);

        const link = `${CLIENT_URL}/join-group/${token}`;

        return res.status(200).json({ link })
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası : " + error });
    }
}

export const joinConversationWithInvitationLink = async (req, res) => {
    const { userId, conversationId } = req.body;
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Sohbet bulunamadı" });
        if (!conversation.isGroup) return res.status(400).json({ message: "Bu bir grup sohbeti değil" });
        if (conversation.participants.includes(userId)) return res.status(400).json({ message: "Kullanıcı zaten grupta" });
        conversation.participants.push(userId);
        await conversation.save();
        // Katılımcılara güncellemeyi gönder 

        // Sistem mesajı oluştur
        const systemMessage = await Message.create({ conversationId, sender: userId, type: "system", systemMessageType: "user_joined_with_invitation_link", performedUser: userId });

        io.to(conversationId).emit("receiveMessage", systemMessage);

        return res.status(200).json({ message: "Gruba katılım başarılı", conversation });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası :" + error })
    }
}

export const grantUserAdmin = async (req, res) => {
    const { conversationId, userIdToGrant, performer } = req.body;
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Sohbet bulunamadı" });
        if (!conversation.isGroup) return res.status(400).json({ message: "Bu bir grup sohbeti değil" });
        if (!conversation.admins.includes(performer)) return res.status(403).json({ message: "Bu işlemi yapmak için yönetici yetkisine sahip olmalısınız." });

        if (conversation.admins.includes(userIdToGrant)) {
            return res.status(400).json({ message: "Kullanıcı zaten yönetici" });
        }

        conversation.admins.push(userIdToGrant);
        await conversation.save();

        const systemMessage = await Message.create({
            conversationId,
            sender: performer,
            type: "system",
            systemMessageType: "user_granted_admin",
            performedUser: userIdToGrant,
        });

        io.to(conversationId).emit("receiveMessage", systemMessage);

        const updatedConversation = await Conversation.findById(conversationId)
            .populate("participants", "username email avatar")
            .populate("lastMessage");

        return res.status(200).json({ message: "Kullanıcıya yönetici yetkisi verildi", updatedConversation });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası " + error });
    }
}