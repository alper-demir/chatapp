import express from "express";
import { createConversation, getConversations, getConversationById, addParticipant, removeParticipant } from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

conversationRouter.post("/create", createConversation);
conversationRouter.get("/get/:userId", getConversations);
conversationRouter.get("/get/id/:conversationId", getConversationById);
conversationRouter.put("/add-participant", addParticipant);
conversationRouter.put("/remove-participant", removeParticipant);

export default conversationRouter;