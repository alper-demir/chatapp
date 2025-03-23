import express from "express";
import { createConversation, getConversations } from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

conversationRouter.post("/create", createConversation);
conversationRouter.get("/get/:userId", getConversations);


export default conversationRouter;