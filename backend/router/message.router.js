import express from "express";
import { createMessage, getMessages } from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.post("/", createMessage);
messageRouter.get("/:conversationId", getMessages);

export default messageRouter;