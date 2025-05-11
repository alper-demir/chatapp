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
    const { cursor, limit = 20 } = req.query;

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Sohbet bulunamadı." });
        }

        const query = { conversationId };
        if (cursor) {
            query._id = { $lt: cursor };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .populate([
                { path: "sender", select: "username" },
                { path: "performedUser", select: "username" },
                { path: "replyTo", populate: { path: "sender", select: "username" } },
            ]);

        const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;
        const totalMessages = await Message.countDocuments({ conversationId });

        res.status(200).json({
            messages,
            nextCursor,
            totalMessages,
            hasMore: messages.length === Number(limit),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};