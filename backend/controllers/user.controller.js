import User from "../models/user.model.js";

export const findUserByEmail = async (req, res) => {
    const { email } = req.params;
    console.log(email);

    if (!email) {
        return res.status(400).json({ message: "Email is required!" });
    }

    try {
        const user = await User.findOne({ email }, {password: 0});
        console.log(user);
        
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        return res.status(200).json(user);
    }
    catch (err) {
        return res.status(500).json({ message: "Internal server error!", error: err });
    }
}