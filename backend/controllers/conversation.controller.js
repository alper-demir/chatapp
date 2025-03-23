import Conversation from "../models/conversation.model.js";

export const createConversation = async (req, res) => {

    const { participants } = req.body;
    console.log("participants" + participants);

    const conversation = await Conversation.findOne({ participants: { $all: participants } });

    if (conversation?.length === 0 || !conversation) { // Create Conversation
        const newConversation = await Conversation.create({ participants });
        return res.status(201).json(newConversation);
    }

    // Return conversation
    return res.status(200).json(conversation);

}

export const getConversations = async (req, res) => {
    // Get all conversations of a user
    const { userId } = req.params;
    try {
        const conversations = await Conversation.find({ participants: userId }).populate("lastMessage");
        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error!", error });
    }
}