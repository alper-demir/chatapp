import express from 'express';
import { findUserByEmail, getUserSettings, updateUserSettings, checkUsername, findUserByUsername, deleteAccount } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get('/findByEmail/:email', findUserByEmail);
userRouter.get('/settings/:userId', getUserSettings);
userRouter.put('/settings/:userId', updateUserSettings);
userRouter.get('/check-username/:username', checkUsername);
userRouter.get('/profile/:username', findUserByUsername);
userRouter.delete("/account/:userId", deleteAccount);

export default userRouter;