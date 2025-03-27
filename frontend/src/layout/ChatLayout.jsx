import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import socket from "../socket/init";
import autoAnimate from '@formkit/auto-animate'
import { timeAgo } from "../utils/date";

const URL = import.meta.env.VITE_SERVER_URL;

const ChatLayout = () => {

    const navigate = useNavigate();
    const userId = useSelector((state) => state.user.user.userId);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [conversations, setConversations] = useState([]); // Dinamik sohbetler için state

    const conversationListRef = useRef(null);

    // AutoAnimate initialize
    useEffect(() => {
        conversationListRef.current && autoAnimate(conversationListRef.current);
    }, [conversationListRef]);

    // Arama işlemi (API'den kullanıcı bulma)
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query) {
            setSearchResult(null);
            return;
        }

        try {
            const response = await fetch(`${URL}/user/findByEmail/${query}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("Kullanıcı bulunamadı");
            }

            const data = await response.json();
            setSearchResult(data);
            console.log("API'den dönen veri: ", JSON.stringify(data));
        } catch (error) {
            console.error("Arama hatası: ", error);
            setSearchResult(null);
        }
    };

    // Sohbet başlatma
    const startChat = async (user) => {
        try {
            const response = await fetch(`${URL}/conversation/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    participants: [userId, user._id], // Mevcut kullanıcı ve aranan kullanıcı
                }),
            });

            if (!response.ok) {
                throw new Error("Sohbet başlatılamadı");
            }

            const data = await response.json();
            console.log("Sohbet başlatıldı: ", JSON.stringify(data));
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
            const response = await fetch(`${URL}/conversation/get/${userId}`, { method: "GET" });
            if (!response.ok) throw new Error("Sohbetler alınırken hata oluştu");
            const data = await response.json();
            setConversations(data);
        } catch (error) {
            console.error("Sohbetler alınırken hata oluştu: ", error);
            setConversations([]);
        }
    };

    const handleCreateGroup = async () => {
        try {

            const response = await fetch(`${URL}/conversation/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    participants: ["67dc1ac0fff366f30708cebf", "67dc1ac7fff366f30708cec3", "67dec4f5dab4c3699feb4816"],
                    isGroup: true,
                    groupName: "Yeni Grup",
                    admins: [userId]
                }),
            })

            if (!response.ok) {
                throw new Error("Grup oluşturulamadı");
            }

            const data = await response.json();

            console.log("Grup oluşturuldu: ", JSON.stringify(data));

        } catch (error) {
            console.error("Grup oluşturma hatası: ", error);
        }
    }

    useEffect(() => {
        // Kullanıcıyı kendi userId odasına kat
        socket.emit("joinUser", userId);

        // Conversation güncellemelerini dinle (sadece kendi user odasındaki güncellemeleri alır)
        socket.on("receiveConversation", (updatedConversation) => {
            console.log("Güncellenen conversation:", updatedConversation);
            setConversations((prevConversations) => {
                const filteredConversations = prevConversations.filter(
                    (conv) => conv._id !== updatedConversation._id
                );
                // En üste ekle (en güncel conversation)
                return [updatedConversation, ...filteredConversations];
            });
        });

        return () => {
            socket.off("receiveConversation");
        };
    }, [userId]);

    // İlk yüklemede sohbetleri çek
    useEffect(() => {
        fetchConversations();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 font-inter antialiased">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-[320px] bg-white border-r border-gray-200 shadow-sm flex-col">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-800">Mesajlar</h1>
                    <button
                        onClick={handleCreateGroup}
                        className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 rounded-lg px-3 py-1.5 flex items-center space-x-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Yeni Sohbet</span>
                    </button>
                </div>

                {/* Arama Alanı */}
                <div className="px-5 py-4 border-b border-gray-100">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Kullanıcı ara..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm transition-all duration-200"
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
                                <div className="font-medium text-gray-800">{searchResult.email.split("@")[0]}</div>
                                <div className="text-sm text-gray-500">{searchResult.email}</div>
                            </div>
                            <button
                                onClick={() => startChat(searchResult)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors duration-200"
                            >
                                Sohbet Et
                            </button>
                        </div>
                    )}
                </div>

                {/* Sohbet Listesi */}
                <nav className="flex-1 overflow-y-auto py-2" ref={conversationListRef}>
                    {conversations.map((conv) => (
                        <Link
                            key={conv._id}
                            to={`/chat/${conv._id}`}
                            className={`px-5 py-3 flex items-center hover:bg-gray-100 transition-colors duration-150 ${selectedRoom === conv._id ? "bg-indigo-50 border-l-4 border-indigo-600" : ""
                                }`}
                            onClick={() => setSelectedRoom(conv._id)}
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                                {conv.isGroup ? "👥" : "👤"}
                            </div>
                            <div className="flex-1 truncate">
                                <div className="font-medium text-gray-800 truncate">{conv._id}</div>
                                <div className="text-sm text-gray-500 flex justify-between">
                                    <span className="truncate mr-2">{conv.lastMessage?.content || "Yeni sohbet"}</span>
                                    <span className="text-xs text-gray-400">{timeAgo(conv.updatedAt)}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Ana İçerik Alanı */}
            <div className="flex-1 md:w-3/4">
                <Outlet />
            </div>
        </div>
    );
};

export default ChatLayout;