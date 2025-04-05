import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';

export const createMessage = async (req, res) => {
    const { conversationId, sender, content } = req.body;
    console.log(req.body);

    try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Sohbet bulunamadı." });
        }

        const message = await Message.create({
            conversationId,
            sender,
            content,
        });

        await message.populate("sender", { password: 0 });
        await conversation.updateOne({ lastMessage: message._id });

        res.status(201).json(message);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getMessages = async (req, res) => {
    const { conversationId } = req.params;

    try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Sohbet bulunamadı." });
        }

        const messages = await Message.find({ conversationId }).populate([{ path: "sender", select: { password: 0 } }, { path: performedUser, select: "username" }]);

        res.status(200).json(messages);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}