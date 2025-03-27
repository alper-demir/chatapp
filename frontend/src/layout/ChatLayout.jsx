import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import socket from "../socket/init";

const URL = import.meta.env.VITE_SERVER_URL;

const ChatLayout = () => {

    const navigate = useNavigate();
    const userId = useSelector((state) => state.user.user.userId);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [conversations, setConversations] = useState([]); // Dinamik sohbetler için state

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
        <div className="flex h-screen bg-[#F0F2F5] font-['Roboto',sans-serif]">
            {/* Sohbet listesi */}
            <div className="hidden md:block w-full md:w-1/4 bg-white border-r border-gray-200">
                <div className="p-4 h-full flex flex-col">
                    {/* Arama çubuğu */}
                    <div className="mb-4">
                        <input
                            type="email"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="E-posta ile ara..."
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007BFF] placeholder-gray-400 text-sm"
                        />
                        {/* Arama sonucu */}
                        {searchResult && (
                            <div className="mt-2 p-3 bg-[#E8F0FE] rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 border border-gray-300">
                                        {searchResult.avatar ? searchResult.avatar : "👤"}
                                    </div>
                                    <div>
                                        <div className="font-medium text-[#111B21]">
                                            {searchResult.email.split("@")[0]}
                                        </div>
                                        <div className="text-sm text-[#667781]">{searchResult.email}</div>
                                        <div className="text-xs text-[#667781]">
                                            {searchResult.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => startChat(searchResult)}
                                        className="ml-auto p-1.5 bg-[#007BFF] text-white rounded-lg hover:bg-[#0056b3] text-sm"
                                    >
                                        Sohbet Başlat
                                    </button>
                                </div>
                            </div>
                        )}
                        {searchQuery && !searchResult && (
                            <div className="mt-2 p-3 text-sm text-[#667781]">Kullanıcı bulunamadı</div>
                        )}
                    </div>

                    {/* Sohbet listesi başlığı */}
                    <h2 className="text-lg font-medium mb-4 text-[#111B21]">Sohbetler</h2>
                    <button className="p-2 bg-blue-500 text-white rounded-lg mb-4 hover:bg-blue-600 text-sm cursor-pointer" onClick={handleCreateGroup}>Grup oluştur</button>
                    <ul className="flex-1 overflow-y-auto">
                        {conversations.map((conv) => (
                            <li key={conv._id} className="mb-2">
                                <Link
                                    to={`/chat/${conv._id}`}
                                    className={`flex items-center p-3 rounded-lg hover:bg-gray-100 ${selectedRoom === conv._id ? "bg-[#E8F0FE]" : ""
                                        }`}
                                    onClick={() => setSelectedRoom(conv._id)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 border border-gray-300">
                                        {conv.isGroup ? "👥" : "👤"} {/* Grupsa 👥, değilse 👤 */}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-[#111B21]">
                                            {
                                                conv._id
                                            }
                                        </div>
                                        <div className="text-sm text-[#667781] truncate">
                                            {conv.lastMessage?.content || "Mesaj yok"}
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Mesaj ekranı */}
            <div className="flex-1 md:w-3/4">
                <Outlet />
            </div>
        </div>
    );
};

export default ChatLayout;