import express from "express";
import { createConversation, getConversations, getConversationById } from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

conversationRouter.post("/create", createConversation);
conversationRouter.get("/get/:userId", getConversations);
conversationRouter.get("/get/id/:conversationId", getConversationById);

export default conversationRouter;