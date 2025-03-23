import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const ChatRoom = () => {
    const URL = import.meta.env.VITE_SERVER_URL;
    const { roomId } = useParams();
    const userId = useSelector((state) => state.user.user.userId); // Sender
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null); // En alta kaydırmak için referans

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${URL}/message/${roomId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setMessages(data);
            } else {
                console.error("Mesajlar getirilemedi.");
            }
        } catch (error) {
            console.error("Mesajlar getirilemedi:", error);
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            console.log(roomId, userId, newMessage);
            try {
                const response = await fetch(`${URL}/message`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        conversationId: roomId,
                        sender: userId,
                        content: newMessage,
                    }),
                });

                const data = await response.json();
                console.log("Mesaj gönderildi:", data);
                setMessages((prev) => [...prev, data]);
                if (response.ok) {
                    console.log("Mesaj başarıyla gönderildi.");
                    setNewMessage("");
                    console.log("Mesaj gönderildi:", newMessage);
                } else {
                    console.error("Mesaj gönderme hatası.");
                }
            } catch (error) {
                console.error("Mesaj gönderme hatası:", error);
            }
        }
    };

    // En alta kaydırma fonksiyonu
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Mesajlar yüklendiğinde veya güncellendiğinde en alta kaydır
    useEffect(() => {
        fetchMessages();
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-[#F0F2F5]">
            {/* Sohbet başlığı */}
            <div className="p-4 bg-white border-b border-gray-200">
                <h2 className="text-lg font-medium text-[#111B21]">{roomId} ID'li sohbet odası</h2>
            </div>

            {/* Mesaj alanı */}
            <div className="flex-1 p-4 overflow-y-auto">
                {messages &&
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`mb-4 flex ${msg.sender._id === userId ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`flex items-start max-w-lg p-3 rounded-lg shadow-sm ${msg.sender._id === userId ? "bg-[#DCF8C6] text-[#111B21]" : "bg-white text-[#111B21]"
                                    }`}
                            >
                                {msg.sender._id !== userId && (
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 border border-gray-300">
                                        avatar
                                    </div>
                                )}
                                <div>
                                    <div className="font-medium">{msg.sender._id !== userId && msg.sender?.email}</div>
                                    <div>{msg.content}</div>
                                    <div className="text-xs text-[#667781] mt-1">
                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                {/* En alta kaydırmak için boş bir div */}
                <div ref={messagesEndRef} />
            </div>

            {/* Mesaj gönderme alanı */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesaj yaz..."
                        className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-2 bg-sky-500 text-white rounded-r-lg hover:bg-sky-600 cursor-pointer"
                    >
                        Gönder
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;