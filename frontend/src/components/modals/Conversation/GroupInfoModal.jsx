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
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Grup bilgilerini çek
    const fetchConversationInfo = async () => {
        try {
            const response = await fetch(`${URL}/conversation/get/id/${modalData?.conversationId}`, {
                method: "GET",
            });
            if (!response.ok) throw new Error("Grup bilgileri alınamadı");
            const data = await response.json();
            setParticipants(data.participants);
            setGroupName(data.groupName);
            setDescription(data.description || "");
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
                    performer: userId,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Kullanıcı gruba eklenemedi");
            }
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
                    performer: userId,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Kullanıcı gruptan çıkarılamadı");
            }
            const updatedConversation = await response.json();
            setParticipants(updatedConversation.participants);
            setConversation(updatedConversation);
        } catch (error) {
            console.error("Kullanıcı gruptan çıkarılırken hata oluştu:", error);
        }
    };

    // Grup bilgilerini güncelleme
    const updateGroupInfo = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${URL}/conversation/update-group-info`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversationId: modalData?.conversationId,
                    groupName,
                    description,
                    userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Grup bilgileri güncellenemedi");
            }

            fetchConversationInfo(); // Güncellenmiş bilgileri tekrar çek
        } catch (error) {
            console.error("Grup bilgileri güncellenirken hata oluştu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && modalData?.conversationId) {
            fetchConversationInfo();
        }
    }, [isOpen, modalData]);

    // Kullanıcının admin olup olmadığını kontrol et
    const isAdmin = conversation?.admins?.includes(userId);

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
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-sm font-medium block mb-1">Grup Adı</label>
                            {isAdmin ? (
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200 bg-main-bg dark:bg-dark-main-bg"
                                    placeholder="Grup adını girin"
                                />
                            ) : (
                                <p className="text-sm">{groupName || "Grup adı belirtilmemiş"}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Grup Açıklaması</label>
                            {isAdmin ? (
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200 bg-main-bg dark:bg-dark-main-bg resize-none"
                                    placeholder="Grup açıklamasını girin"
                                    rows={3}
                                />
                            ) : (
                                <p className="text-sm">{description || "Açıklama yok"}</p>
                            )}
                        </div>
                    </div>

                    {/* Admin ise güncelleme butonunu göster */}
                    {isAdmin && (
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={updateGroupInfo}
                                disabled={isLoading || (!groupName && !description)}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        <span>Kaydediliyor...</span>
                                    </>
                                ) : (
                                    <span>Kaydet</span>
                                )}
                            </button>
                        </div>
                    )}

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
                                            {p.username}{" "}
                                            {p._id === userId && <span className="text-xs text-gray-500">(Sen)</span>}
                                            {conversation?.admins?.includes(p._id) && (
                                                <span className="text-xs text-indigo-500"> (Yönetici)</span>
                                            )}
                                        </span>
                                    </div>
                                    {isAdmin && !conversation?.admins?.includes(p._id) && p._id !== userId && (
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
                    {isAdmin && (
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
                    )}

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