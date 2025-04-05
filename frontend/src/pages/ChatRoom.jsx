import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import socket from "../socket/init";
import { formatMessageTime } from "../utils/date";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import More from "../components/ChatRoom/More";

const ChatRoom = () => {

    const URL = import.meta.env.VITE_SERVER_URL;

    const navigate = useNavigate();

    const { roomId } = useParams();
    const userId = useSelector((state) => state.user.user.userId); // Sender
    const userSettings = useSelector(state => state.user.userSettings);
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null); // En alta kaydırmak için referans
    const [conversation, setConversation] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isOnline, setIsOnline] = useState(false);

    const socketMessageSound = new Audio("/notification-socket.mp3"); // public/notification-socket.mp3
    const otherScreenMessageSound = new Audio("/notification-other-screen.mp3"); // public/notification-other-screen.mp3

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${URL}/message/${roomId}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            } else {
                console.error("Mesajlar getirilemedi.");
            }
        } catch (error) {
            console.error("Mesajlar getirilemedi:", error);
        }
    };

    const fetchConversation = async () => {
        try {
            const response = await fetch(`${URL}/conversation/get/id/${roomId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setConversation(data);
                console.log("Conversation: " + JSON.stringify(data.participants));

                if (!data?.participants.map(p => p._id === userId)) {
                    navigate("/chat")
                }
                setParticipants(data.participants);
            } else {
                console.error("Sohbet getirilemedi.");
            }
        }
        catch (error) {
            console.error("Sohbet getirilemedi:", error);
        }
    }

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            console.log(roomId, userId, newMessage);

            socket.emit("sendMessage", {
                conversationId: roomId,
                sender: userId,
                content: newMessage,
            });
            setNewMessage("");
            console.log("Mesaj gönderildi:", newMessage);
        }
    };

    // En alta kaydırma fonksiyonu
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        socket.emit("joinRoom", roomId, userId);

        socket.on("receiveMessage", (message) => {
            // Gelen mesajın conversationId'sinin aktif oda ile aynı olduğundan emin ol
            if (message.conversationId === roomId) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
                socket.emit("markAsRead", { conversationId: roomId, userId }) // Mevcut kullanıcı soketteyse anlık olarak mesajı okumuş demektir.

                if (message.sender._id !== userId && userSettings?.notifications?.enableNotifications) { // Kendi mesajlarımızda ses çalma, bildirim etkinse çal
                    const isTabActive = document.visibilityState === "visible";
                    if (isTabActive) {
                        socketMessageSound.play().catch((err) => console.error("Ses çalma hatası:", err));
                    } else {
                        otherScreenMessageSound.play().catch((err) => console.error("Ses çalma hatası:", err));
                    }
                }

            }
        });

        socket.emit("online", userId);

        socket.on("onlineUsers", (users) => {
            // Mevcut kullanıcıyı çıkar
            const filteredParticipants = participants.filter(participant => participant !== userId);

            // Online olan katılımcıları kontrol et
            const isOnline = filteredParticipants.some(participant => users.includes(participant));

            console.log(users);
            console.log(filteredParticipants);
            console.log(isOnline ? "Online" : "Offline");
            setIsOnline(isOnline);
        });

        socket.emit("markAsRead", { conversationId: roomId, userId })

        socket.on("receiveMarkAsRead", (updatedMessages) => {
            console.log("Güncellenmiş mesajlar:", updatedMessages);
            if (updatedMessages[0]?.conversationId === roomId) {
                setMessages(updatedMessages);
                scrollToBottom();
            }
        });

        return () => {
            // Temizleme: event listener'ı kaldır
            socket.off("onlineUsers");
            socket.off("online");
            socket.off("receiveMessage");
            socket.off("receiveMarkAsRead");
        };

    }, [roomId, userId, participants, userSettings]);

    // Mesajları tarihe göre gruplama
    const groupedMessages = messages.reduce((acc, msg) => {
        const date = new Date(msg.createdAt).toLocaleDateString(); // Mesajın tarihini al (örneğin: "02.04.2025")
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(msg);
        return acc;
    }, {});

    // Bugünün tarihini al
    const today = new Date().toLocaleDateString();

    // Mesajlar yüklendiğinde veya güncellendiğinde en alta kaydır
    useEffect(() => {
        fetchConversation();
        fetchMessages();
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-main-bg dark:bg-dark-main-bg font-inter">
            {/* Chat Header */}
            <header className="px-6 py-4 border-b border-border dark:border-dark-border shadow-sm flex items-center justify-between ">
                <div>
                    {conversation?.isGroup ? (
                        <h2 className="text-xl font-semibold">
                            {conversation.groupName}
                        </h2>
                    ) : (
                        <div>
                            <h2 className="text-xl font-semibold">
                                {conversation?.participants?.map(p => p._id !== userId && <>{p.username}</>) || 'Kullanıcı'}
                            </h2>
                            {isOnline && (
                                <span className="text-sm text-green-600 font-medium">
                                    Çevrimiçi
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    {conversation?.isGroup && <More />}
                </div>
            </header>

            {/* Mesaj Alanı */}
            <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-main-bg dark:bg-dark-main-bg">
                {Object.keys(groupedMessages).map((date) => (
                    <div key={date}>
                        {/* Tarih başlığı - ortalanmış */}
                        <div className="text-center text-sm my-4">
                            {date === today ? "Bugün" : date}
                        </div>
                        {/* O tarihteki mesajlar */}
                        {groupedMessages[date].map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.sender._id === userId ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`
                            flex items-start max-w-lg p-3 rounded-xl my-1
                            ${msg.sender._id === userId
                                            ? "bg-message-sender dark:bg-dark-message-sender"
                                            : "bg-message-other dark:bg-dark-message-other shadow-sm"}
                        `}
                                >
                                    {msg.sender._id !== userId && conversation?.isGroup && (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                            {msg.sender?.avatar || "👤"}
                                        </div>
                                    )}
                                    <div>
                                        {msg.sender._id !== userId && conversation?.isGroup && (
                                            <div className="text-sm font-semibold mb-1">
                                                {msg.sender?.email?.split("@")[0]}
                                            </div>
                                        )}
                                        <div className="text-sm">{msg.content}</div>
                                        <div className="text-sidebar-text dark:text-dark-sidebar-text mt-1.5 text-right flex items-center gap-x-1">
                                            <span className="text-xs">{formatMessageTime(msg.createdAt)}</span>
                                            <div className="flex text-sm">
                                                {msg.sender._id === userId && (
                                                    conversation?.isGroup ? (
                                                        msg.readBy?.length === conversation.participants.length - 1 ? (
                                                            <IoCheckmarkDoneSharp className="text-doublecheckmark dark:text-dark-doublecheckmark" />
                                                        ) : (
                                                            <IoCheckmarkSharp className="text-checkmark dark:text-dark-checkmark" />
                                                        )
                                                    ) : (
                                                        msg.readBy?.length === 1 ? (
                                                            <IoCheckmarkDoneSharp className="text-doublecheckmark dark:text-dark-doublecheckmark" />
                                                        ) : (
                                                            <IoCheckmarkSharp className="text-checkmark dark:text-dark-checkmark" />
                                                        )
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Mesaj Gönderme Alanı */}
            <footer className="p-4 border-t border-border dark:border-dark-border">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 px-4 py-2.5 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200"
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button
                        onClick={handleSendMessage}
                        className="px-4 py-2.5 bg-chatbutton dark:bg-dark-chatbutton text-white rounded-lg hover:bg-chatbutton-hover dark:hover:bg-dark-chatbutton-hover transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Gönder</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ChatRoom;