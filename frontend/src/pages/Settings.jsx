import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowBack, IoIosSave, IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { MdOutlineDarkMode, MdLightMode } from "react-icons/md";
import { setUserSettings } from "../store/userSlice";

const Settings = () => {
    const URL = import.meta.env.VITE_SERVER_URL;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userId = useSelector((state) => state.user.user.userId);

    const [profile, setProfile] = useState({
        avatar: "👤",
        firstName: "",
        lastName: "",
        about: "",
        username: "",
    });

    const [notifications, setNotifications] = useState({
        enableNotifications: true,
    });

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const [privacy, setPrivacy] = useState({
        showOnlineStatus: true,
    });

    const [newUsername, setNewUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [isUsernameValid, setIsUsernameValid] = useState(false);

    // Ayarları çekme fonksiyonu
    const fetchSettings = async () => {
        try {
            const response = await fetch(`${URL}/user/settings/${userId}`);
            if (!response.ok) throw new Error("Ayarlar alınamadı");
            const data = await response.json();
            console.log(data);

            setProfile({
                avatar: data.avatar || "👤",
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                about: data.about || "",
                username: data.username || "",
            });
            setNewUsername(data.username || "");
            setNotifications({
                enableNotifications: data.notifications?.enableNotifications ?? true,
            });
            setPrivacy({
                showOnlineStatus: data.privacy?.showOnlineStatus ?? true,
            });
            setTheme(data.theme || "light");

            if (data.theme === "dark") {
                document.querySelector("html").classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.querySelector("html").classList.remove("dark");
                localStorage.setItem("theme", "light");
            }
        } catch (error) {
            console.error("Hata:", error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [userId]);

    const handleCheckUsername = async () => {
        if (!newUsername) {
            setUsernameMessage("Kullanıcı adı boş olamaz");
            setIsUsernameValid(false);
            return;
        }
        try {
            const response = await fetch(`${URL}/user/check-username/${newUsername}`);
            const data = await response.json();
            if (response.ok) {
                setUsernameMessage(data.message);
                setIsUsernameValid(true);
            } else {
                setUsernameMessage(data.message);
                setIsUsernameValid(false);
            }
        } catch (error) {
            setUsernameMessage("Bir hata oluştu");
            setIsUsernameValid(false);
            console.error("Hata:", error);
        }
    };

    const handleSaveProfile = async () => {
        const { username, ...profileData } = profile; // username hariç diğer alanları gönder
        try {
            const response = await fetch(`${URL}/user/settings/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData),
            });
            if (!response.ok) throw new Error("Güncelleme başarısız");
            console.log("Profil güncellendi:", profileData);
        } catch (error) {
            console.error("Hata:", error);
        }
    };

    const handleSaveUsername = async () => {
        if (!isUsernameValid) {
            setUsernameMessage("Önce kullanıcı adını kontrol edin ve geçerli olduğundan emin olun");
            return;
        }
        try {
            const response = await fetch(`${URL}/user/settings/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: newUsername }),
            });
            if (!response.ok) throw new Error("Güncelleme başarısız");
            setProfile({ ...profile, username: newUsername });
            setUsernameMessage("Kullanıcı adı başarıyla güncellendi");
            console.log("Kullanıcı adı güncellendi:", newUsername);
        } catch (error) {
            setUsernameMessage("Güncelleme başarısız");
            console.error("Hata:", error);
        }
    };

    const handleSaveNotifications = async () => {
        try {
            const response = await fetch(`${URL}/user/settings/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notifications }),
            });
            if (!response.ok) throw new Error("Güncelleme başarısız");
            console.log("Bildirim ayarları güncellendi:", notifications);

            const data = await response.json();

            dispatch(setUserSettings({
                notifications: data.user.notifications, // Mevcut state’i kullan
                privacy: data.user.privacy, // Eski privacy’yi koru
                theme: data.user.theme,     // Eski theme’i koru
            }));

        } catch (error) {
            console.error("Hata:", error);
        }
    };

    const handleThemeChange = async (newTheme) => {
        setTheme(newTheme);
        if (newTheme === "dark") {
            document.querySelector("html").classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.querySelector("html").classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
        try {
            const response = await fetch(`${URL}/user/settings/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ theme: newTheme }),
            });
            if (!response.ok) throw new Error("Güncelleme başarısız");
            console.log("Tema güncellendi:", newTheme);

            const data = await response.json();
            console.log(data.user);

            dispatch(setUserSettings({
                notifications: data.user.notifications,
                privacy: data.user.privacy,
                theme: data.user.theme,
            }));

        } catch (error) {
            console.error("Hata:", error);
        }
    };

    const handleSavePrivacy = async () => {
        try {
            const response = await fetch(`${URL}/user/settings/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privacy }),
            });
            if (!response.ok) throw new Error("Güncelleme başarısız");
            console.log("Gizlilik ayarları güncellendi:", privacy);

            const data = await response.json();
            console.log(data.user);

            dispatch(setUserSettings({
                notifications: data.user.notifications,
                privacy: data.user.privacy,
                theme: data.user.theme,
            }));

        } catch (error) {
            console.error("Hata:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen p-6 font-inter antialiased">
            {/* Üst Başlık ve Geri Butonu */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-title dark:text-dark-title">Ayarlar</h1>
                <button
                    onClick={() => navigate("/chat")}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                >
                    <IoIosArrowBack className="mr-1" /> Geri
                </button>
            </div>

            {/* Ayarlar İçeriği */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Profil Ayarları */}
                <div className="rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
                    <h2 className="text-lg font-medium text-title dark:text-dark-title mb-4">Profil Ayarları</h2>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                            {profile.avatar}
                        </div>
                        <input
                            type="text"
                            value={profile.firstName}
                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                            className="flex-1 capitalize px-4 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200"
                            placeholder="Adınızı girin"
                        />
                        <input
                            type="text"
                            value={profile.lastName}
                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                            className="flex-1 capitalize px-4 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200"
                            placeholder="Soyadınızı girin"
                        />
                    </div>
                    <textarea
                        value={profile.about}
                        onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                        className="w-full px-4 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200 resize-none"
                        placeholder="Hakkınızda bir şeyler yazın"
                        rows="3"
                    />
                    <button
                        onClick={handleSaveProfile}
                        className="mt-4 px-4 py-2 bg-button hover:bg-button-hover dark:bg-dark-button dark:hover:bg-dark-button-hover text-white rounded-lg transition-colors duration-200 flex items-center text-sm"
                    >
                        <IoIosSave className="mr-2" /> Kaydet
                    </button>
                </div>

                {/* Kullanıcı Adı Ayarları */}
                <div className="rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
                    <h2 className="text-lg font-medium text-title dark:text-dark-title mb-4">Kullanıcı Adı Ayarları</h2>
                    <div className="flex items-center space-x-4 mb-4">
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => {
                                setNewUsername(e.target.value);
                                setUsernameMessage(""); // Yeni bir değer girildiğinde mesajı sıfırla
                                setIsUsernameValid(false); // Kontrol edilene kadar geçersiz
                            }}
                            className="flex-1 px-4 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200"
                            placeholder="Yeni kullanıcı adınızı girin"
                        />
                        <button
                            onClick={handleCheckUsername}
                            className="px-4 py-2 bg-button hover:bg-button-hover dark:bg-dark-button dark:hover:bg-dark-button-hover text-white rounded-lg transition-colors duration-200 flex items-center text-sm cursor-pointer"
                        >
                            <IoIosCheckmarkCircleOutline className="mr-2" /> Kontrol Et
                        </button>
                    </div>
                    {usernameMessage && (
                        <p
                            className={`text-sm mb-4 ${isUsernameValid ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {usernameMessage}
                        </p>
                    )}
                    <button
                        onClick={handleSaveUsername}
                        className="px-4 py-2 bg-button hover:bg-button-hover dark:bg-dark-button dark:hover:bg-dark-button-hover text-white rounded-lg transition-colors duration-200 flex items-center text-sm"
                        disabled={!isUsernameValid}
                    >
                        <IoIosSave className="mr-2" /> Kaydet
                    </button>
                </div>

                {/* Bildirim Ayarları */}
                <div className="rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
                    <h2 className="text-lg font-medium text-title dark:text-dark-title mb-4">Bildirim Ayarları</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Bildirimleri Etkinleştir</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.enableNotifications}
                                    onChange={(e) =>
                                        setNotifications({
                                            ...notifications,
                                            enableNotifications: e.target.checked,
                                        })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 dark:bg-dark-sidebar-selected rounded-full peer-checked:bg-button dark:peer-checked:bg-dark-button transition-colors duration-200"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 peer-checked:translate-x-5 bg-white"></div>
                            </label>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveNotifications}
                        className="mt-4 px-4 py-2 bg-button hover:bg-button-hover dark:bg-dark-button dark:hover:bg-dark-button-hover text-white rounded-lg transition-colors duration-200 flex items-center text-sm"
                    >
                        <IoIosSave className="mr-2" /> Kaydet
                    </button>
                </div>

                {/* Tema Ayarları */}
                <div className="rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
                    <h2 className="text-lg font-medium text-title dark:text-dark-title mb-4">Tema Ayarları</h2>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleThemeChange("light")}
                            className={`px-4 py-2 rounded-lg text-xl cursor-pointer ${theme === "light"
                                ? "bg-button dark:bg-dark-button text-white"
                                : "bg-gray-200 dark:bg-dark-sidebar-selected"
                                } hover:bg-button-hover dark:hover:bg-dark-button-hover hover:text-white transition-colors duration-200`}
                        >
                            <MdLightMode />
                        </button>
                        <button
                            onClick={() => handleThemeChange("dark")}
                            className={`px-4 py-2 rounded-lg text-xl cursor-pointer ${theme === "dark"
                                ? "bg-button dark:bg-dark-button text-white"
                                : "bg-gray-200 dark:bg-dark-sidebar-selected"
                                } hover:bg-button-hover dark:hover:bg-dark-button-hover hover:text-white transition-colors duration-200`}
                        >
                            <MdOutlineDarkMode />
                        </button>
                    </div>
                </div>

                {/* Gizlilik Ayarları */}
                <div className="rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
                    <h2 className="text-lg font-medium text-title dark:text-dark-title mb-4">Gizlilik Ayarları</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Çevrimiçi Durumu Göster</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={privacy.showOnlineStatus}
                                    onChange={(e) =>
                                        setPrivacy({
                                            ...privacy,
                                            showOnlineStatus: e.target.checked,
                                        })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 dark:bg-dark-sidebar-selected rounded-full peer-checked:bg-button dark:peer-checked:bg-dark-button transition-colors duration-200"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 peer-checked:translate-x-5 bg-white"></div>
                            </label>
                        </div>
                    </div>
                    <button
                        onClick={handleSavePrivacy}
                        className="mt-4 px-4 py-2 bg-button hover:bg-button-hover dark:bg-dark-button dark:hover:bg-dark-button-hover text-white rounded-lg transition-colors duration-200 flex items-center text-sm"
                    >
                        <IoIosSave className="mr-2" /> Kaydet
                    </button>
                </div>

                {/* Hesap Ayarları */}
                <div className="rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
                    <h2 className="text-lg font-medium text-title dark:text-dark-title mb-4">Hesap Ayarları</h2>
                    <div className="space-y-4">
                        <button className="w-full cursor-pointer px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors duration-200 text-sm">
                            Şifre Değiştir
                        </button>
                        <button className="w-full cursor-pointer px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors duration-200 text-sm">
                            Hesabı Sil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;