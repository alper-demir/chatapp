import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socket from "../../socket/init";
import autoAnimate from '@formkit/auto-animate'
import More from './More';
import Conversation from './Conversation';
import { getConversationsWithUserId, startConversation } from '../../services/conversationService';
import { searchUserWithEmail } from '../../services/userService';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {

    const navigate = useNavigate();
    const userId = useSelector((state) => state.user.user.userId);
    const userSettings = useSelector(state => state.user.userSettings);
    const { t } = useTranslation();

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [conversations, setConversations] = useState([]);

    const conversationListRef = useRef(null);

    const otherScreenSound = new Audio("/notification-other-screen.mp3"); // public/notification-other-screen.mp3

    // AutoAnimate initialize
    useEffect(() => {
        conversationListRef.current && autoAnimate(conversationListRef.current);
    }, [conversationListRef]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setSelectedRoom(null);
                navigate("/");
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [navigate]);

    // Arama işlemi (API'den kullanıcı bulma)
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query) {
            setSearchResult(null);
            return;
        }

        try {
            const data = await searchUserWithEmail(query);
            setSearchResult(data);
        } catch (error) {
            console.error("Arama hatası: ", error);
            setSearchResult(null);
        }
    };

    // Sohbet başlatma
    const createConversation = async (user) => {
        try {
            const data = await startConversation(userId, user._id);
            setSelectedRoom(data._id);
            setSearchQuery("");
            setSearchResult(null);
            navigate(`/chat/${data._id}`); // Yeni oluşturulan sohbetin ID'sine yönlendirme
            fetchConversations(); // Sohbet listesini güncelle
        } catch (error) {
            console.error("Sohbet başlatma hatası: ", error);
        }
    };

    // Sohbetleri API'den çekme
    const fetchConversations = async () => {
        try {
            const data = await getConversationsWithUserId(userId);
            setConversations(data);
        } catch (error) {
            console.error("Sohbetler alınırken hata oluştu: ", error);
            setConversations([]);
        }
    };

    useEffect(() => {
        socket.emit("joinUser", userId);
    }, [userId]);

    useEffect(() => {
        const handleReceiveConversation = (updatedConversation) => {
            console.log("Güncellenen conversation:", updatedConversation);
            handleSelectedConversation();
            setConversations((prevConversations) => {
                const existingConversation = prevConversations.find(
                    (conv) => conv._id === updatedConversation._id
                );

                // Yeni mesaj mı, yoksa sadece okundu güncellemesi mi?
                const isNewMessage =
                    !existingConversation || // Yeni bir sohbetse
                    (existingConversation.lastMessage &&
                        updatedConversation.lastMessage &&
                        existingConversation.lastMessage._id !== updatedConversation.lastMessage._id); // lastMessage değiştiyse

                const filteredConversations = prevConversations.filter(
                    (conv) => conv._id !== updatedConversation._id
                );
                const newConversations = [...filteredConversations, updatedConversation];
                const sortedConversations = newConversations.sort((a, b) =>
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );

                // Ses çalma koşulları
                if (
                    isNewMessage && // Yeni mesaj geldiyse
                    updatedConversation._id !== selectedRoom && // Aktif oda değilse
                    updatedConversation.lastMessage?.sender !== userId && // Mesajı sen göndermediyse
                    userSettings?.notifications?.enableNotifications // Bildirim ayarları etkinse
                ) {
                    otherScreenSound.play().catch((err) => console.error("Ses çalma hatası:", err));
                }

                return sortedConversations;
            });
        };

        socket.on("receiveConversation", handleReceiveConversation);

        return () => {
            socket.off("receiveConversation", handleReceiveConversation);
        };
    }, [userId, selectedRoom, userSettings]);

    useEffect(() => {
        const handleRemoveConversation = ({ conversationId }) => {
            setConversations((prevConversations) =>
                prevConversations.filter((conv) => conv._id !== conversationId)
            );
            if (selectedRoom === conversationId) {
                setSelectedRoom(null);
                navigate("/");
            }
        };

        socket.on("removeConversation", handleRemoveConversation);

        return () => {
            socket.off("removeConversation", handleRemoveConversation);
        };
    }, [userId, selectedRoom]);


    // Sayfa refresh edildiğinde seçili sohbet bilgisi görünmüyordu.
    const handleSelectedConversation = () => {
        if (window.location.pathname.split("/").length === 3) { // Bir sohbet odasında demektir. /chat/:conversationId döner. (yani 3 elemanlı bir dizi olacak splitten sonra)
            setSelectedRoom(window.location.pathname.split("/")[2])
        }
    }

    useEffect(() => {
        fetchConversations();
        handleSelectedConversation();
    }, []);

    return (
        <div className="hidden md:flex md:w-[320px] bg-sidebar dark:bg-dark-sidebar border-r border-border dark:border-dark-border shadow-sm flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border dark:border-dark-border flex items-center justify-between">
                <h1 className="text-xl font-semibold">{t("sidebar.conversations")}</h1>
                <More setSelectedRoom={setSelectedRoom} />
            </div>

            {/* Arama Alanı */}
            <div className="px-5 py-4 border-b border-border dark:border-dark-border">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Kullanıcı ara..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-dark-border text-sm transition-all duration-200 placeholder-gray-400"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Arama Sonucu */}
                {searchResult && (
                    <div className="mt-3 bg-indigo-50 rounded-lg p-3 flex items-center space-x-3 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            {searchResult.avatar || "👤"}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">{searchResult.email.split("@")[0]}</div>
                            <div className="text-sm text-gray-500">{searchResult.email}</div>
                        </div>
                        <button
                            onClick={() => createConversation(searchResult)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors duration-200"
                        >
                            {t("sidebar.chat")}
                        </button>
                    </div>
                )}
            </div>

            {/* Sohbet Listesi */}
            <nav className="flex-1 overflow-y-auto py-2" ref={conversationListRef}>
                {conversations.map((conv) => (
                    <Conversation
                        key={conv._id}
                        conv={conv}
                        selectedRoom={selectedRoom}
                        setSelectedRoom={setSelectedRoom}
                    />
                ))}
            </nav>
        </div>
    )
}

export default Sidebar