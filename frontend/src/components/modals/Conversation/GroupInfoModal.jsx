import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import { FaUserPlus, FaUserMinus } from "react-icons/fa";

const GroupInfoModal = ({ isOpen, close, modalData }) => {
    const URL = import.meta.env.VITE_SERVER_URL;
    const userId = useSelector((state) => state.user.user.userId);

    const [participants, setParticipants] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    // Grup bilgilerini çek
    const fetchConversationInfo = async () => {
        try {
            const response = await fetch(`${URL}/conversation/get/id/${modalData?.conversationId}`, {
                method: "GET",
            });
            if (!response.ok) throw new Error("Grup bilgileri alınamadı");
            const data = await response.json();
            setParticipants(data.participants);
            setConversation(data);
            console.log("Grup bilgileri:", data);
        } catch (error) {
            console.error("Grup bilgileri alınırken hata oluştu:", error);
        }
    };

    // Kullanıcı arama
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`${URL}/user/findByEmail/${query}`, {
                method: "GET",
            });
            if (!response.ok) throw new Error("Kullanıcı bulunamadı");
            const data = await response.json();
            // Zaten grupta olan kullanıcıları filtrele
            const filteredResults = Array.isArray(data)
                ? data.filter((user) => !participants.some((p) => p._id === user._id))
                : !participants.some((p) => p._id === data._id)
                    ? [data]
                    : [];
            setSearchResults(filteredResults);
        } catch (error) {
            console.error("Kullanıcı arama hatası:", error);
            setSearchResults([]);
        }
    };

    // Gruba kullanıcı ekleme
    const addUserToGroup = async (user) => {
        try {
            const response = await fetch(`${URL}/conversation/add-participant`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversationId: modalData?.conversationId,
                    userId: user._id,
                }),
            });
            if (!response.ok) throw new Error("Kullanıcı gruba eklenemedi");
            const updatedConversation = await response.json();
            setParticipants(updatedConversation.participants);
            setConversation(updatedConversation);
            setSearchQuery("");
            setSearchResults([]);
        } catch (error) {
            console.error("Kullanıcı gruba eklenirken hata oluştu:", error);
        }
    };

    // Gruptan kullanıcı çıkarma
    const removeUserFromGroup = async (userIdToRemove) => {
        try {
            const response = await fetch(`${URL}/conversation/remove-participant`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversationId: modalData?.conversationId,
                    userId: userIdToRemove,
                }),
            });
            if (!response.ok) throw new Error("Kullanıcı gruptan çıkarılamadı");
            const updatedConversation = await response.json();
            setParticipants(updatedConversation.participants);
            setConversation(updatedConversation);
        } catch (error) {
            console.error("Kullanıcı gruptan çıkarılırken hata oluştu:", error);
        }
    };

    useEffect(() => {
        if (isOpen && modalData?.conversationId) {
            fetchConversationInfo();
        }
    }, [isOpen, modalData]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-50" onClose={close}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 text-text dark:text-dark-text">
                <DialogPanel
                    transition
                    className="w-full max-w-md rounded-2xl bg-main-bg dark:bg-dark-main-bg p-6 shadow-xl ring-1 ring-white/10 transform transition-all duration-300 ease-out scale-100 opacity-100"
                >
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <DialogTitle as="h3" className="text-lg font-semibold">
                            Grup Bilgisi
                        </DialogTitle>
                        <button onClick={close} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <IoClose className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Grup Bilgileri */}
                    <div className="space-y-2 mb-6">
                        <p className="text-sm font-medium">
                            Grup Adı: <span className="font-normal">{conversation?.groupName || "Belirtilmemiş"}</span>
                        </p>
                        <p className="text-sm font-medium">
                            Grup Açıklaması: <span className="font-normal">{conversation?.description || "Açıklama yok"}</span>
                        </p>
                    </div>

                    {/* Katılımcılar Listesi */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold mb-2">Katılımcılar ({participants.length})</h4>
                        <div className="max-h-40 overflow-y-auto space-y-3">
                            {participants.map((p) => (
                                <div
                                    key={p._id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-dark-sidebar hover:bg-gray-200 dark:hover:bg-dark-sidebar-hover transition-colors"
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm">
                                            {p.avatar || "👤"}
                                        </div>
                                        <span className="text-sm">
                                            {p.username} {p._id === userId && <span className="text-xs text-gray-500">(Sen)</span>}
                                            {conversation?.admins?.includes(p._id) && (
                                                <span className="text-xs text-indigo-500"> (Yönetici)</span>
                                            )}
                                        </span>
                                    </div>
                                    {conversation?.admins?.includes(userId) && !conversation?.admins?.includes(p._id) && p._id !== userId && (
                                        <button
                                            onClick={() => removeUserFromGroup(p._id)}
                                            className="text-red-500 hover:text-red-700 flex items-center space-x-1 text-sm"
                                        >
                                            <FaUserMinus />
                                            <span>Çıkar</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gruba Kullanıcı Ekleme */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold mb-2">Gruba Kullanıcı Ekle</h4>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Kullanıcı ara (e-posta ile)"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border dark:border-dark-border text-sm transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        {/* Arama Sonuçları */}
                        {searchResults.length > 0 && (
                            <div className="mt-2 max-h-40 overflow-y-auto space-y-2">
                                {searchResults.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 dark:bg-dark-sidebar hover:bg-indigo-100 dark:hover:bg-dark-sidebar-hover transition-colors"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm">
                                                {user.avatar || "👤"}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{user.email.split("@")[0]}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addUserToGroup(user)}
                                            className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 text-sm"
                                        >
                                            <FaUserPlus />
                                            <span>Ekle</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Kapat Butonu */}
                    <div className="flex justify-end">
                        <button
                            onClick={close}
                            className="px-4 py-2 bg-gray-200 dark:bg-dark-sidebar text-gray-700 dark:text-dark-text rounded-lg hover:bg-gray-300 dark:hover:bg-dark-sidebar-hover transition-colors"
                        >
                            Kapat
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default GroupInfoModal;