import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/JWT.js"

export const register = async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ email, password: hashedPassword, username });
        return res.status(201).json(user);
    }
    catch (err) {
        return res.status(500).json({ message: "Internal server error!", error: err });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        const validatePassword = await bcrypt.compare(password, user.password);

        if (!validatePassword) {
            return res.status(400).json({ message: "Invalid password!" });
        }

        // Generate token
        const token = generateToken(user._id);
        return res.status(200).json({ message: "Login successful!", token });

    } catch (error) {

    }
}