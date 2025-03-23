import express from 'express';
import { findUserByEmail } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get('/findByEmail/:email', findUserByEmail);

export default userRouter;