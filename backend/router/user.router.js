import express from 'express';
import { findUserByEmail, getUserSettings, updateUserSettings, checkUsername } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get('/findByEmail/:email', findUserByEmail);
userRouter.get('/settings/:userId', getUserSettings);
userRouter.put('/settings/:userId', updateUserSettings);
userRouter.get('/check-username/:username', checkUsername);

export default userRouter;