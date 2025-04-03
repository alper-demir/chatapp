import User from "../models/user.model.js";

export const findUserByEmail = async (req, res) => {
    const { email } = req.params;
    console.log(email);

    if (!email) {
        return res.status(400).json({ message: "Email is required!" });
    }

    try {
        const user = await User.findOne({ email }, { password: 0 });
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

export const getUserSettings = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }
        // Ayarları döndür
        res.status(200).json({
            avatar: user.avatar || "👤",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            about: user.about || "",
            username: user.username || "",
            notifications: {
                enableNotifications: user.notifications?.enableNotifications ?? true, // Bildirim ayarları
            },
            privacy: {
                showOnlineStatus: user.privacy?.showOnlineStatus ?? true, // Gizlilik ayarları
            },
            theme: user.theme || "light", // Tema ayarı
            isOnline: user.isOnline || false, // Çevrimiçi durumu
        });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};

export const updateUserSettings = async (req, res) => {
    const { userId } = req.params;
    const { username } = req.body;

    try {
        const user = await User.findById(userId, { password: 0 });

        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        if (username) {
            // Kullanıcı adını güncellemeden önce kontrol et
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({ message: "Bu kullanıcı adı zaten alınmış" });
            }
            user.username = username;
        }

        await user.updateOne(req.body); // Body'den gelen bilgiler güncellenecek.

        const updatedUser = await User.findById(userId, { password: 0 });

        res.status(200).json({ message: "Ayarlar güncellendi", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};

export const checkUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Bu kullanıcı adı zaten alınmış" });
        }
        res.status(200).json({ message: "Bu kullanıcı adı kullanılabilir" });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};