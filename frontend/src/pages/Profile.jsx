import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { startConversation } from "../services/conversationService";

const Profile = () => {

    const { username } = useParams();
    const navigate = useNavigate();
    const userId = useSelector((state) => state.user.user.userId);

    const URL = import.meta.env.VITE_SERVER_URL;

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${URL}/user/profile/${username}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
            } else if (response.status === 404) {
                setError("Kullanıcı bulunamadı.");
            } else {
                setError("Profil yüklenirken bir hata oluştu.");
            }
        } catch (err) {
            setError("Bir hata oluştu: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const createConversation = async () => {
        try {
            console.log(userId, profileData._id);

            const data = await startConversation(userId, profileData._id);
            navigate(`/chat/${data._id}`);
            console.log(data);
        } catch (error) {
            console.error("Sohbet başlatma hatası: ", error);
        }
    }

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const isOwnProfile = userId === profileData?._id;

    // Yükleme durumu
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-main-bg dark:bg-dark-main-bg">
                <p className="text-lg text-gray-500 dark:text-dark-text">Yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-main-bg dark:bg-dark-main-bg">
                <div className="text-center">
                    <p className="text-lg text-red-500 dark:text-red-400">{error}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-4 px-4 py-2 bg-chatbutton dark:bg-dark-chatbutton text-white rounded-lg hover:bg-chatbutton-hover dark:hover:bg-dark-chatbutton-hover transition-colors"
                    >
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="font-inter p-6 mt-20">
            <div className="max-w-4xl mx-auto rounded-lg shadow-lg p-6">
                {/* Profil Başlığı */}
                <div className="flex items-center space-x-4 border-b border-border dark:border-dark-border pb-4">
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
                        {profileData?.avatar || "👤"}
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {profileData?.username}
                        </h1>
                        <p className="text-sm">
                            {profileData?.email}
                        </p>
                        {isOwnProfile && (
                            <button
                                onClick={() => navigate("/profile/edit")}
                                className="mt-2 px-3 py-1 bg-chatbutton dark:bg-dark-chatbutton text-white rounded-lg hover:bg-chatbutton-hover dark:hover:bg-dark-chatbutton-hover transition-colors text-sm"
                            >
                                Profili Düzenle
                            </button>
                        )}
                    </div>
                </div>

                {/* Profil Detayları */}
                <div className="mt-6 space-y-4">
                    <div>
                        <h2 className="text-lg font-medium">
                            Hakkında
                        </h2>
                        <p className="text-sm">
                            {profileData?.bio || "Bu kullanıcı hakkında bilgi yok."}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-lg font-medium">
                            Katılım Tarihi
                        </h2>
                        <p className="text-sm">
                            {new Date(profileData?.createdAt).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>

                {!isOwnProfile && (
                    <div className="mt-6 flex space-x-4">
                        <button
                            onClick={createConversation}
                            className="px-4 py-2 bg-chatbutton dark:bg-dark-chatbutton text-white rounded-lg hover:bg-chatbutton-hover dark:hover:bg-dark-chatbutton-hover transition-colors"
                        >
                            Mesaj Gönder
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;