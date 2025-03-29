import Conversation from "../models/conversation.model.js";

export const createConversation = async (req, res) => {
    const { participants, isGroup, admins, groupName } = req.body;

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
        admins: admins || [],
        groupName: groupName || ""
    });

    return res.status(201).json(newConversation);
};

export const getConversations = async (req, res) => {
    // Get all conversations of a user
    const { userId } = req.params;
    try {
        const conversations = await Conversation.find({ participants: userId }).populate("lastMessage").sort({ updatedAt: -1 });
        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error!", error });
    }
}

export const getConversationById = async (req, res) => {
    // Get a conversation by conversationId
    const { conversationId } = req.params;

    try {
        const conversation = await Conversation.findById(conversationId).populate("lastMessage");
        return res.status(200).json(conversation);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error!", error });
    }
}