import { useState } from "react";
import { useSelector } from "react-redux";
import { IoIosArrowBack, IoIosSave } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { MdOutlineDarkMode, MdLightMode } from "react-icons/md";

const Settings = () => {
    const navigate = useNavigate();
    const userId = useSelector((state) => state.user.user.userId);

    // Durum yönetimi için state'ler
    const [profile, setProfile] = useState({
        avatar: "👤",
        name: "Kullanıcı Adı",
        status: "Çevrimiçi",
    });
    const [notifications, setNotifications] = useState({
        enableNotifications: true,
        enableSound: true,
    });
    const [theme, setTheme] = useState(localStorage.getItem("theme")); // "light" veya "dark"
    const [privacy, setPrivacy] = useState({
        showOnlineStatus: true,
        showMessagePreviews: true,
    });

    // Profil kaydetme fonksiyonu
    const handleSaveProfile = () => {
        // API çağrısı burada yapılabilir
        console.log("Profil güncellendi:", profile);
    };

    // Bildirim ayarlarını kaydetme fonksiyonu
    const handleSaveNotifications = () => {
        // API çağrısı burada yapılabilir
        console.log("Bildirim ayarları güncellendi:", notifications);
    };

    // Tema değiştirme fonksiyonu
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        if (newTheme === "dark") {
            document.querySelector("html").classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.querySelector("html").classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    // Gizlilik ayarlarını kaydetme fonksiyonu
    const handleSavePrivacy = () => {
        // API çağrısı burada yapılabilir
        console.log("Gizlilik ayarları güncellendi:", privacy);
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
                <div className=" rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
                    <h2 className="text-lg font-medium text-title dark:text-dark-title mb-4">Profil Ayarları</h2>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                            {profile.avatar}
                        </div>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="flex-1 px-4 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200"
                            placeholder="Adınızı girin"
                        />
                    </div>
                    <textarea
                        value={profile.status}
                        onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                        className="w-full px-4 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-none duration-200 resize-none"
                        placeholder="Durumunuzu girin"
                        rows="3"
                    />
                    <button
                        onClick={handleSaveProfile}
                        className="mt-4 px-4 py-2 bg-button hover:bg-button-hover dark:bg-dark-button dark:hover:bg-dark-button-hover text-white rounded-lg transition-colors duration-200 flex items-center text-sm"
                    >
                        <IoIosSave className="mr-2" /> Kaydet
                    </button>
                </div>

                {/* Bildirim Ayarları */}
                <div className=" rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
                    <h2 className="text-lg font-medium text-title dark:text-dark-title mb-4">Bildirim Ayarları</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className=" text-sm">Bildirimleri Etkinleştir</span>
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
                        <div className="flex items-center justify-between">
                            <span className=" text-sm">Sesli Bildirimler</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.enableSound}
                                    onChange={(e) =>
                                        setNotifications({
                                            ...notifications,
                                            enableSound: e.target.checked,
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
                <div className=" rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
                    <h2 className="text-lg font-medium text-title dark:text-dark-title mb-4">Tema Ayarları</h2>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleThemeChange("light")}
                            className={`px-4 py-2 rounded-lg text-xl cursor-pointer ${theme === "light" ? "bg-button dark:bg-dark-button text-white" : "bg-gray-200 dark:bg-dark-sidebar-selected"
                                } hover:bg-button-hover dark:hover:bg-dark-button-hover hover:text-white transition-colors duration-200`}
                        >
                            <MdLightMode />
                        </button>
                        <button
                            onClick={() => handleThemeChange("dark")}
                            className={`px-4 py-2 rounded-lg text-xl cursor-pointer ${theme === "dark" ? "bg-button dark:bg-dark-button text-white" : "bg-gray-200 dark:bg-dark-sidebar-selected"
                                } hover:bg-button-hover dark:hover:bg-dark-button-hover hover:text-white transition-colors duration-200`}
                        >
                            <MdOutlineDarkMode />
                        </button>
                    </div>
                </div>

                {/* Gizlilik Ayarları */}
                <div className=" rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
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
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Mesaj Önizlemelerini Göster</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={privacy.showMessagePreviews}
                                    onChange={(e) =>
                                        setPrivacy({
                                            ...privacy,
                                            showMessagePreviews: e.target.checked,
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
                <div className=" rounded-lg shadow-sm p-5 border border-border dark:border-dark-border">
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
            </div >
        </div >
    );
};

export default Settings;