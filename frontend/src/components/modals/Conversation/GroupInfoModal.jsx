import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import { FaUserPlus, FaUserMinus } from "react-icons/fa";
import { searchUserWithEmail } from "../../../services/userService";
import { addParticipantToGroup, createInvitationLink, getConversationWithConversationId, grantUserAdmin, removeParticipantFromGroup, updateGroupInformations } from "../../../services/conversationService";
import { formatDate } from "../../../utils/date";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GroupInfoModal = ({ isOpen, close, modalData }) => {
    const userId = useSelector((state) => state.user.user.userId);
    const { t, i18n } = useTranslation();

    const [participants, setParticipants] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState("");

    // Grup bilgilerini çek
    const fetchConversationInfo = async () => {
        const data = await getConversationWithConversationId(modalData?.conversationId);
        setParticipants(data.participants);
        setGroupName(data.groupName);
        setDescription(data.description || "");
        setConversation(data);
        console.log("Grup bilgileri:", data);
    };

    // Kullanıcı arama
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query) {
            setSearchResults([]);
            return;
        }

        const data = await searchUserWithEmail(query);
        const filteredResults = Array.isArray(data)
            ? data.filter((user) => !participants.some((p) => p._id === user._id))
            : !participants.some((p) => p._id === data._id)
                ? [data]
                : [];
        setSearchResults(filteredResults);
    };

    // Gruba kullanıcı ekleme
    const addUserToGroup = async (user) => {
        const updatedConversation = await addParticipantToGroup(modalData?.conversationId, user._id, userId);
        setParticipants(updatedConversation.participants);
        setConversation(updatedConversation);
        setSearchQuery("");
        setSearchResults([]);
    };

    // Gruptan kullanıcı çıkarma
    const removeUserFromGroup = async (userIdToRemove) => {
        const updatedConversation = await removeParticipantFromGroup(modalData?.conversationId, userIdToRemove, userId);
        setParticipants(updatedConversation.participants);
        setConversation(updatedConversation);
        console.log("kullanıcı çıkarıdlı" + JSON.stringify(updatedConversation));

    };

    // Kullanıcıyı yönetici yapma
    const grantUserAsAdmin = async (userIdToGrant) => {
        await grantUserAdmin(modalData?.conversationId, userIdToGrant, userId);
        fetchConversationInfo();
    }

    // Grup bilgilerini güncelleme
    const updateGroupInfo = async () => {
        setIsLoading(true);
        await updateGroupInformations(modalData?.conversationId, groupName, description, userId);
        fetchConversationInfo(); // Güncellenmiş bilgileri tekrar çek
        setIsLoading(false);
    };

    const handleCreateInviteLink = async () => {
        try {
            const data = await createInvitationLink(modalData?.conversationId, userId);
            if (data.link) {
                setInviteLink(data.link);
            } else {
                console.error("Davet linki alınamadı:", data.message);
            }
        } catch (error) {
            console.error("Davet linki oluşturulamadı:", error);
        }
    };

    // Linki kopyalama
    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        alert("Davet linki kopyalandı!");
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
                    <div className="flex justify-between items-center border-b border-border dark:border-dark-border pb-3 mb-3">
                        <DialogTitle as="h3" className="text-lg font-semibold">
                            {t("groupInfoModal.title", "Grup Bilgisi")}
                        </DialogTitle>
                        <button
                            onClick={close}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                        >
                            <IoClose className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Grup Bilgileri */}
                    <div className="space-y-4 mb-6">
                        <div className="border-b border-border dark:border-dark-border pb-2">
                            <span className="text-xs block mb-1">
                                {conversation?.createdBy && (
                                    <Link
                                        onClick={close}
                                        className="font-medium"
                                        to={`/profile/${conversation.createdBy.username}`}
                                    >
                                        {conversation.createdBy.username}
                                    </Link>
                                )}{" "}
                                {t("groupInfoModal.createdBy", {
                                    date: formatDate(conversation?.createdAt),
                                })}
                            </span>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">
                                {t("groupInfoModal.groupNameLabel", "Grup Adı")}
                            </label>
                            {isAdmin ? (
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200 bg-main-bg dark:bg-dark-main-bg"
                                    placeholder={t("groupInfoModal.groupNamePlaceholder", "Grup adını girin")}
                                />
                            ) : (
                                <p className="text-sm">
                                    {groupName ||
                                        t("groupInfoModal.groupNameEmpty", "Grup adı belirtilmemiş")}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">
                                {t("groupInfoModal.descriptionLabel", "Grup Açıklaması")}
                            </label>
                            {isAdmin ? (
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200 bg-main-bg dark:bg-dark-main-bg resize-none"
                                    placeholder={t("groupInfoModal.descriptionPlaceholder", "Grup açıklamasını girin")}
                                    rows={3}
                                />
                            ) : (
                                <p className="text-sm">
                                    {description ||
                                        t("groupInfoModal.descriptionEmpty", "Açıklama yok")}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Admin ise güncelleme butonunu göster */}
                    {isAdmin && (
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={updateGroupInfo}
                                disabled={isLoading || (!groupName && !description)}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer"
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
                                        <span>{t("groupInfoModal.savingButton", "Kaydediliyor...")}</span>
                                    </>
                                ) : (
                                    <span>{t("groupInfoModal.saveButton", "Kaydet")}</span>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Katılımcılar Listesi */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold mb-2">
                            {t("groupInfoModal.participantsTitle", "Katılımcılar")} (
                            {participants.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto space-y-3">
                            {participants.map((p) => (
                                <div
                                    key={p._id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-sidebar dark:bg-dark-sidebar hover:bg-sidebar-selected dark:hover:bg-dark-sidebar-selected transition-colors"
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm">
                                            {p.avatar || "👤"}
                                        </div>
                                        <span className="text-sm">
                                            {p.username}{" "}
                                            {p._id === userId && (
                                                <span className="text-xs text-gray-500">
                                                    {t("groupInfoModal.you", "(Sen)")}
                                                </span>
                                            )}
                                            {conversation?.admins?.includes(p._id) && (
                                                <span className="text-xs text-indigo-500">
                                                    {" "}
                                                    {t("groupInfoModal.admin", "(Yönetici)")}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    {isAdmin &&
                                        !conversation?.admins?.includes(p._id) &&
                                        p._id !== userId && (
                                            <div className="flex gap-x-3">
                                                <button
                                                    onClick={() => grantUserAsAdmin(p._id)}
                                                    className="text-blue-500 hover:text-blue-600 flex items-center space-x-1 text-sm cursor-pointer font-semibold"
                                                >
                                                    <FaUserPlus />
                                                    <span>
                                                        {t("groupInfoModal.makeAdmin", "Yönetici yap")}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => removeUserFromGroup(p._id)}
                                                    className="text-rose-500 hover:text-rose-600 flex items-center space-x-1 text-sm cursor-pointer font-semibold"
                                                >
                                                    <FaUserMinus />
                                                    <span>
                                                        {t("groupInfoModal.removeUser", "Çıkar")}
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gruba Kullanıcı Ekleme */}
                    {isAdmin && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold mb-2">
                                {t("groupInfoModal.addUserTitle", "Gruba Kullanıcı Ekle")}
                            </h4>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder={t(
                                        "groupInfoModal.addUserPlaceholder",
                                        "Kullanıcı ara (e-posta ile)"
                                    )}
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
                                            className="flex items-center justify-between p-2 rounded-lg bg-sidebar dark:bg-dark-sidebar hover:bg-sidebar-selected dark:hover:bg-dark-sidebar-selected transition-colors"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm">
                                                    {user.avatar || "👤"}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        {user.email.split("@")[0]}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addUserToGroup(user)}
                                                className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 text-sm cursor-pointer"
                                            >
                                                <FaUserPlus />
                                                <span>{t("groupInfoModal.addUserButton", "Ekle")}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Davet Linki Oluşturma */}
                    {isAdmin && (
                        <div className="mb-6">
                            <button
                                className="text-sm font-semibold mb-2 cursor-pointer"
                                onClick={handleCreateInviteLink}
                            >
                                {t("groupInfoModal.createInviteLink", "Davet Linki Oluştur")}
                            </button>
                            {inviteLink && (
                                <div className="mt-2 flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={inviteLink}
                                        readOnly
                                        className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg text-sm bg-gray-100 dark:bg-dark-sidebar"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="px-2 text-sm transition-colors cursor-pointer"
                                    >
                                        {t("groupInfoModal.copyLink", "Kopyala")}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Kapat Butonu */}
                    <div className="flex justify-end">
                        <button
                            onClick={close}
                            className="px-4 py-2 bg-sidebar dark:bg-dark-sidebar text-gray-700 dark:text-dark-text rounded-lg hover:bg-sidebar-selected dark:hover:bg-dark-sidebar-selected transition-colors cursor-pointer"
                        >
                            {t("groupInfoModal.closeButton", "Kapat")}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default GroupInfoModal;