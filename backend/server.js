import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import connection from "./database/connectMongoDB.js";
import authRouter from "./router/auth.router.js";
import userRouter from "./router/user.router.js";
import conversationRouter from "./router/conversation.router.js";
import messageRouter from "./router/message.router.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/message", messageRouter);

connection();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})