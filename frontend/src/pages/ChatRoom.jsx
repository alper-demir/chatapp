import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import socket from "../socket/init";
import { formatMessageTime } from "../utils/date";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import MessageMore from "../components/Message/MessageMore";
import Content from "../components/Message/Content";
import ChatRoomFooter from "../components/ChatRoom/ChatRoomFooter";
import SystemMessages from "../components/ChatRoom/SystemMessages";
import Header from "../components/ChatRoom/Header";
import { getConversationWithConversationId } from "../services/conversationService";

const ChatRoom = () => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const navigate = useNavigate();
    const { t } = useTranslation();
    const messagesEndRef = useRef(null);
    const { roomId } = useParams();

    const userId = useSelector((state) => state.user.user.userId);
    const userSettings = useSelector((state) => state.user.userSettings);
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isOnline, setIsOnline] = useState(false);
    const [replyMessage, setReplyMessage] = useState(null);

    const socketMessageSound = new Audio("/notification-socket.mp3");
    const otherScreenMessageSound = new Audio("/notification-other-screen.mp3");

    const fetchMessages = async () => {
        setMessages([]);
        try {
            const response = await fetch(`${SERVER_URL}/message/${roomId}`, {
                method: "GET",
            });
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
        const data = await getConversationWithConversationId(roomId)
        setConversation(data);
        if (!data.participants.some((p) => p._id === userId)) {
            navigate("/");
        }
        setParticipants(data.participants);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            socket.emit("sendMessage", {
                conversationId: roomId,
                sender: userId,
                content: newMessage,
                replyTo: replyMessage ? replyMessage._id : null,
            });
            setNewMessage("");
            setReplyMessage(null);
            console.log("Mesaj gönderildi:", newMessage);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        socket.emit("joinRoom", roomId, userId);
        socket.emit("markAsRead", { conversationId: roomId, userId });

        const handleReceiveMessage = (message) => {
            if (message.conversationId === roomId) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
                socket.emit("markAsRead", { conversationId: roomId, userId });

                if (
                    message.sender._id !== userId &&
                    userSettings?.notifications?.enableNotifications
                ) {
                    const isTabActive = document.visibilityState === "visible";
                    if (isTabActive) {
                        socketMessageSound.play().catch((err) => console.error("Ses çalma hatası:", err));
                    } else {
                        otherScreenMessageSound.play().catch((err) => console.error("Ses çalma hatası:", err));
                    }
                }
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [roomId, userId, userSettings]);

    useEffect(() => {
        socket.emit("online", userId);

        const handleOnlineUsers = (users) => {
            const filteredParticipants = participants.filter(
                (participant) => participant._id !== userId
            );
            const isOnline = filteredParticipants.some((participant) =>
                users.includes(participant._id)
            );
            setIsOnline(isOnline);
        };

        socket.on("onlineUsers", handleOnlineUsers);

        return () => {
            socket.off("onlineUsers", handleOnlineUsers);
        };
    }, [participants, userId]);

    useEffect(() => {
        const handleReceiveMarkAsRead = (updatedMessages) => {
            if (updatedMessages[0]?.conversationId === roomId) {
                setMessages(updatedMessages);
                scrollToBottom();
            }
        };

        socket.on("receiveMarkAsRead", handleReceiveMarkAsRead);

        return () => {
            socket.off("receiveMarkAsRead", handleReceiveMarkAsRead);
        };
    }, [roomId]);

    useEffect(() => {
        const handleReceiveConversation = (updatedConversation) => {
            if (updatedConversation._id === roomId) {
                setConversation(updatedConversation);
            }
        };
        socket.on("receiveConversation", handleReceiveConversation);

        return () => {
            socket.off("receiveConversation", handleReceiveConversation);
        };
    }, [roomId]);

    const [groupedMessages, setGroupedMessages] = useState({})
    const fetchGroupMessages = () => {
        const x = messages.reduce((acc, msg) => {
            console.log("test");

            const date = new Date(msg.createdAt).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(msg);
            return acc;
        }, {});
        setGroupedMessages(x)
    }

    useEffect(() => {
        fetchConversation();
        fetchMessages();
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
        fetchGroupMessages();
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-main-bg dark:bg-dark-main-bg font-inter">
            {/* Chat Header */}
            <Header conversation={conversation} userId={userId} isOnline={isOnline} roomId={roomId} />

            {/* Mesaj Alanı */}
            <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-main-bg dark:bg-dark-main-bg">
                {Object.keys(groupedMessages).map((date) => (
                    <div key={date}>
                        {/* Tarih başlığı - ortalanmış */}
                        <div className="text-center text-sm my-4">
                            {date === new Date().toLocaleDateString() ? t("chatroom.today", "Bugün") : date}
                        </div>
                        {/* O tarihteki mesajlar */}
                        {groupedMessages[date].map((msg) => (
                            <div key={msg._id} className={`flex ${msg.type === "system" ? "justify-center" : msg.sender._id === userId ? "justify-end" : "justify-start"}`} id={msg._id} >
                                {msg.type === "system" && (
                                    <SystemMessages msg={msg} />
                                )}
                                {msg.type !== "system" && (
                                    <div className={`flex items-start max-w-lg p-3 rounded-xl my-1 group ${msg.sender._id === userId
                                        ? "bg-message-sender dark:bg-dark-message-sender"
                                        : "bg-message-other dark:bg-dark-message-other shadow-sm"
                                        }`} >
                                        {
                                            msg.sender._id !== userId && conversation?.isGroup && (
                                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                                    {msg.sender?.avatar || "👤"}
                                                </div>
                                            )
                                        }
                                        <div>
                                            <div className="flex justify-between">
                                                <div> {/* Cevap verilen mesajın içeriği */}
                                                    {msg.replyTo && (
                                                        <div className="text-sm font-semibold bg-reply-bg dark:bg-dark-reply-bg rounded-lg p-2 mb-2 cursor-pointer" onClick={() => { document.getElementById(msg.replyTo?._id)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
                                                            <div>{msg.replyTo?.sender?._id !== userId ? (<>{msg.replyTo?.sender?.username}</>) : (<>{t("chatroom.you", "Siz")}</>)}</div>
                                                            <Content message={msg.replyTo} reply={true} />
                                                        </div>
                                                    )}
                                                    {msg.sender._id !== userId && conversation?.isGroup && (
                                                        <div className="text-sm font-semibold mb-1">
                                                            {msg.sender?.username}
                                                        </div>
                                                    )}
                                                    <Content message={msg} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"><MessageMore message={msg} setReplyMessage={setReplyMessage} userId={userId} /></div>
                                                </div>
                                            </div>

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
                                )}
                            </div>
                        ))}
                    </div>
                ))
                }
                <div ref={messagesEndRef} />
            </main >

            {/* Mesaj Gönderme Alanı */}
            <ChatRoomFooter
                userId={userId}
                roomId={roomId}
                userSettings={userSettings}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                replyMessage={replyMessage}
                setReplyMessage={setReplyMessage}
                handleSendMessage={handleSendMessage}
                socket={socket}
            />
        </div>
    );
};

export default ChatRoom;