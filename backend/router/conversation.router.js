import express from "express";
import { createConversation, getConversations, getConversationById, addParticipant, removeParticipant, updateGroupInfo, createConversationGroupInvitve, joinConversationWithInvitationLink } from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

conversationRouter.post("/create", createConversation);
conversationRouter.get("/get/:userId", getConversations);
conversationRouter.get("/get/id/:conversationId", getConversationById);
conversationRouter.put("/add-participant", addParticipant);
conversationRouter.put("/remove-participant", removeParticipant);
conversationRouter.put("/update-group-info", updateGroupInfo);
conversationRouter.post("/create/invite", createConversationGroupInvitve);
conversationRouter.post("/join-group", joinConversationWithInvitationLink);

export default conversationRouter;