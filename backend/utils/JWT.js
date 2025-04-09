import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

export const generateInvitationToken = (conversationId) => { // 24 saat geçerli grup davet tokeni
    if (!conversationId) throw new Error("conversationId is required");
    return jwt.sign({ conversationId }, process.env.JWT_SECRET, { expiresIn: "1d" });
}