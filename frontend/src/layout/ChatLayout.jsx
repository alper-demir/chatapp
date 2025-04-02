import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import socket from "../socket/init";
import autoAnimate from '@formkit/auto-animate'
import { formatConversationTime } from "../utils/date";
import { IoMdMore, IoIosSettings, IoIosLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const URL = import.meta.env.VITE_SERVER_URL;

const ChatLayout = () => {

    const navigate = useNavigate();
    const userId = useSelector((state) => state.user.user.userId);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [conversations, setConversations] = useState([]); // Dinamik sohbetler için state

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
                navigate("/chat");
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
            console.log(data);

            setConversations(data);
        } catch (error) {
            console.error("Sohbetler alınırken hata oluştu: ", error);
            setConversations([]);
        }
    };

    useEffect(() => {
        socket.emit("joinUser", userId);

        socket.on("receiveConversation", (updatedConversation) => {
            console.log("Güncellenen conversation:", updatedConversation);
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
                    updatedConversation.lastMessage?.sender !== userId // Mesajı sen göndermediyse
                ) {
                    otherScreenSound.play().catch((err) => console.error("Ses çalma hatası:", err));
                }

                return sortedConversations;
            });
        });

        return () => {
            socket.off("receiveConversation");
        };
    }, [userId, selectedRoom]);


    // Sayfa refresh edildiğinde seçili sohbet bilgisi görünmüyordu.
    const handleSelectedConversation = () => {
        if (window.location.pathname.split("/").length === 3) { // Bir sohbet odasında demektir. /chat/:conversationId döner. (yani 3 elemanlı bir dizi olacak splitten sonra)
            setSelectedRoom(window.location.pathname.split("/")[2])
        }
    }

    const theme = () => {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
            document.querySelector("html").classList.add("dark");
        } else {
            document.querySelector("html").classList.remove("dark");
        }
    }

    // İlk yüklemede sohbetleri çek
    useEffect(() => {
        theme();
        fetchConversations();
        handleSelectedConversation();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 font-inter antialiased">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-[320px] bg-white border-r border-gray-200 shadow-sm flex-col">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between dark:bg-red-200">
                    <h1 className="text-xl font-semibold text-gray-800">Sohbetler</h1>
                    <div className="flex items-center gap-x-2">
                        <Menu as="div" className="relative inline-flex">
                            <MenuButton className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 focus:outline-none transition-colors duration-200 data-[hover]:bg-gray-200 data-[open]:bg-gray-200 cursor-pointer">
                                <IoMdMore className="text-xl" />
                            </MenuButton>

                            <MenuItems
                                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                anchor="right start"
                            >
                                <div className="py-1">
                                    <MenuItem>
                                        {({ active }) => (
                                            <Link to="/chat/group-conversation"
                                                className={`cursor-pointer ${active ? 'bg-green-50 text-green-700' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                            // onClick={handleCreateGroup}
                                            >
                                                <HiOutlineUserGroup className="h-4 w-4 mr-3" />
                                                Yeni Grup
                                            </Link>
                                        )}
                                    </MenuItem>
                                    <MenuItem>
                                        {({ active }) => (
                                            <button
                                                className={`cursor-pointer ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                            >
                                                <CgProfile className="h-4 w-4 mr-3" />
                                                Profil
                                            </button>
                                        )}
                                    </MenuItem>
                                    <MenuItem>
                                        {({ active }) => (
                                            <Link to="/settings" onClick={() => setSelectedRoom(null)}
                                                className={`cursor-pointer ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                            >
                                                <IoIosSettings className="h-4 w-4 mr-3" />
                                                Ayarlar
                                            </Link>
                                        )}
                                    </MenuItem>

                                    <div className="my-1 h-px bg-gray-200" />

                                    <MenuItem>
                                        {({ active }) => (
                                            <button
                                                className={`cursor-pointer ${active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                            >
                                                <IoIosLogOut className="h-4 w-4 mr-3" />
                                                Çıkış yap
                                            </button>
                                        )}
                                    </MenuItem>
                                </div>
                            </MenuItems>
                        </Menu>


                    </div>

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
                                    <span className="truncate mr-2" title={conv.lastMessage?.content}>{conv.lastMessage?.content || "Yeni sohbet"}</span>
                                    <span className="text-xs text-gray-400">{formatConversationTime(conv.updatedAt)}</span>
                                </div>
                            </div>
                            <span className="p-1 rounded-full bg-red-400 text-white text-xs">
                                {
                                    conv?.lastMessage?.readBy?.includes(userId) || conv?.lastMessage?.sender === userId ? "✓" : "Okunmamış mesaj"
                                }
                            </span>

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