import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import socket from "../socket/init";
import { formatMessageTime } from "../utils/date";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import More from "../components/ChatRoom/More";
import { useTranslation } from "react-i18next";
import { FaArrowAltCircleUp, FaMicrophone, FaTrash } from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from "react-icons/bs";
import { PiRecord } from "react-icons/pi";
import autoAnimate from "@formkit/auto-animate";
import AudioView from "../components/AudioView";
import CurrentParticipantMessageMore from "../components/Message/CurrentParticipantMessageMore";
import OtherParticipantMessageMore from "../components/Message/OtherParticipantMessageMore";
import { RxCross1 } from "react-icons/rx";

const ChatRoom = () => {

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const navigate = useNavigate();
    const { t } = useTranslation();
    const recordRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const footerRef = useRef(null);
    const timeIntervalRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { roomId } = useParams();

    const userId = useSelector((state) => state.user.user.userId); // Sender
    const userSettings = useSelector(state => state.user.userSettings);
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isOnline, setIsOnline] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const [disableSendAudioButton, setDisableSendAudioButton] = useState(false);

    const socketMessageSound = new Audio("/notification-socket.mp3"); // public/notification-socket.mp3
    const otherScreenMessageSound = new Audio("/notification-other-screen.mp3"); // public/notification-other-screen.mp3

    useEffect(() => {
        recordRef.current && autoAnimate(recordRef.current);
    }, [recordRef]);

    useEffect(() => {
        footerRef.current && autoAnimate(footerRef.current);
    }, [footerRef]);

    const fetchMessages = async () => {
        setMessages([])
        try {
            const response = await fetch(`${SERVER_URL}/message/${roomId}`, { method: "GET" });
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

    const fetchConversation = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/conversation/get/id/${roomId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setConversation(data);
                console.log("Conversation: " + JSON.stringify(data.participants));
                console.log(!data.participants.some(p => p._id === userId));
                // Eğer kullanıcı bu odanın katılımcısı değilse anasayfaya yönlendir
                if (!data.participants.some(p => p._id === userId)) {
                    navigate("/");
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
        if (audioURL) {
            await sendAudioMessage();
            return;
        }
        if (newMessage.trim()) {
            console.log(roomId, userId, newMessage);

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

    const handleEmojiClick = (emojiObject) => {
        setNewMessage((prev) => prev + emojiObject.emoji);
    };

    // En alta kaydırma fonksiyonu
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        socket.emit("joinRoom", roomId, userId);
        socket.emit("markAsRead", { conversationId: roomId, userId });

        const handleReceiveMessage = (message) => {
            // Gelen mesajın conversationId'sinin aktif oda ile aynı olduğundan emin ol            
            if (message.conversationId === roomId) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
                socket.emit("markAsRead", { conversationId: roomId, userId }); // Mevcut kullanıcı soketteyse anlık olarak mesajı okumuş demektir.

                if (message.sender._id !== userId && userSettings?.notifications?.enableNotifications) { // Kendi mesajlarımızda ses çalma, bildirim etkinse çal
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
            // Mevcut kullanıcıyı çıkar
            const filteredParticipants = participants.filter(participant => participant._id !== userId);
            // Online olan katılımcıları kontrol et
            const isOnline = filteredParticipants.some(participant => users.includes(participant._id));
            console.log(users);
            console.log(filteredParticipants);
            console.log(isOnline ? "Online" : "Offline");
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
                console.log("Güncellenmiş mesajlar:", updatedMessages);
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
                console.log("ChatRoom güncellenen conversation: ", updatedConversation);
                setConversation(updatedConversation);
            }
        };
        // Conversation güncellendiğinde tetiklenir (örneğin grup bilgileri değiştiğinde)
        socket.on("receiveConversation", handleReceiveConversation);

        return () => {
            socket.off("receiveConversation", handleReceiveConversation);
        };
    }, [roomId]);

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

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            clearTimeout(timerRef.current);
            clearInterval(timeIntervalRef.current); // Süreyi durdur
        }
    };

    const deleteRecording = () => {
        setAudioURL("");
        setRecording(false);
        clearTimeout(timerRef.current);
        clearInterval(timeIntervalRef.current); // Süreyi durdur
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        mediaRecorderRef.current = null;
        chunksRef.current = [];
    }

    const handleRecording = async () => {
        setRecording((prev) => !prev);
        if (recording) {
            console.log("Ses kaydı durduruldu.");
            stopRecording();
        } else {
            console.log("Ses kaydı başlatıldı.");
            try {
                let time = 15; // Şu an tek bir ses kaydı maksimum 15 saniye olarak ayarlandı
                timeIntervalRef.current = setInterval(() => {
                    console.log("saniye: " + time);
                    time--;
                    if (time === 0) {
                        stopRecording();
                        setRecording(false);
                    }
                }, 1000);

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                chunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                    const url = URL.createObjectURL(blob);
                    setAudioURL(url);
                    mediaRecorder.stream.getTracks().forEach((track) => track.stop()); // Stream içeriklerinin hepsini durdur
                };

                mediaRecorder.start();
            } catch (err) {
                console.error("Microphone access error:", err);
                setRecording(false);
                clearInterval(timeIntervalRef.current);
            }
            finally {
                setDisableSendAudioButton(false);
            }
        }
    };

    const sendAudioMessage = async () => {
        if (!audioURL || disableSendAudioButton) return;
        setDisableSendAudioButton(true);
        // Blob'u oluştur
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        // Blob'dan bir File nesnesi oluştur
        const audioFile = new File([blob], `audio_${Date.now()}.webm`, {
            type: "audio/webm",
        });

        const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        // FormData nesnesi oluştur ve parametreleri ekle
        const formData = new FormData();
        formData.append("file", audioFile);
        formData.append("upload_preset", upload_preset);
        formData.append("cloud_name", cloud_name);

        try {
            // Cloudinary'e dosyayı yükle
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/upload`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (data.secure_url) {
                socket.emit("sendMessage", {
                    conversationId: roomId,
                    sender: userId,
                    mediaUrl: data.secure_url,
                    type: "audio",
                    replyTo: replyMessage ? replyMessage._id : null,
                });
                setRecording(false);
                setAudioURL("");
            } else {
                console.error("Yükleme hatası:", data);
            }
        } catch (error) {
            console.error("Yükleme sırasında hata oluştu:", error);
        } finally {
            setDisableSendAudioButton(false);
            setAudioURL("");
            setNewMessage("");
            setRecording(false);
            setReplyMessage(null);
            clearTimeout(timerRef.current);
            clearInterval(timeIntervalRef.current);
        }
    };

    const [replyMessage, setReplyMessage] = useState(null);

    return (
        <div className="flex flex-col h-full bg-main-bg dark:bg-dark-main-bg font-inter">
            {/* Chat Header */}
            <header className="px-6 py-4 border-b border-border dark:border-dark-border shadow-sm flex items-center justify-between">
                <div className="mb-1">
                    {conversation?.isGroup ? (
                        <h2 className="text-xl font-semibold">{conversation.groupName}</h2>
                    ) : (
                        <div>
                            <h2 className="text-xl font-semibold">
                                {conversation?.participants?.map(
                                    (p) => p._id !== userId && <>{p.username}</>
                                ) || t("chatroom.defaultUser", "Kullanıcı")}
                            </h2>
                            {isOnline && (
                                <span className="text-sm text-green-600 font-medium">
                                    {t("chatroom.online", "Çevrimiçi")}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    {conversation?.isGroup && (
                        <More conversationId={roomId} groupName={conversation?.groupName} />
                    )}
                </div>
            </header>

            {/* Mesaj Alanı */}
            <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-main-bg dark:bg-dark-main-bg">
                {Object.keys(groupedMessages).map((date) => (
                    <div key={date}>
                        {/* Tarih başlığı - ortalanmış */}
                        <div className="text-center text-sm my-4">
                            {date === today ? t("chatroom.today", "Bugün") : date}
                        </div>
                        {/* O tarihteki mesajlar */}
                        {groupedMessages[date].map((msg) => (
                            <div key={msg._id} className={`flex ${msg.type === "system" ? "justify-center" : msg.sender._id === userId ? "justify-end" : "justify-start"}`} id={msg._id} >
                                {msg.type === "system" && (
                                    <div className="text-sm italic text-center p-2 bg-system-message dark:bg-dark-system-message rounded-lg text-dark-text my-2">
                                        {msg.systemMessageType === "user_added" ? (
                                            <span>
                                                {t("chatroom.systemMessages.user_added", {
                                                    performedUser: msg.performedUser.username,
                                                    sender: msg.sender.username,
                                                })}
                                            </span>
                                        ) : msg.systemMessageType === "user_kicked" ? (
                                            <span>
                                                {t("chatroom.systemMessages.user_kicked", {
                                                    performedUser: msg.performedUser.username,
                                                    sender: msg.sender.username,
                                                })}
                                            </span>
                                        ) : msg.systemMessageType === "user_joined" ? (
                                            <span>
                                                {t("chatroom.systemMessages.user_joined", {
                                                    performedUser: msg.performedUser.username,
                                                })}
                                            </span>
                                        ) : msg.systemMessageType === "user_left" ? (
                                            <span>
                                                {t("chatroom.systemMessages.user_left", {
                                                    performedUser: msg.performedUser.username,
                                                })}
                                            </span>
                                        ) : msg.systemMessageType === "group_info_updated" ? (
                                            <span>
                                                {t("chatroom.systemMessages.group_info_updated", {
                                                    sender: msg.sender.username,
                                                })}
                                            </span>
                                        ) : msg.systemMessageType === "user_joined_with_invitation_link" ? (
                                            <span>
                                                {t("chatroom.systemMessages.user_joined_with_invitation_link", {
                                                    performedUser: msg.performedUser.username,
                                                })}
                                            </span>
                                        ) : (
                                            msg.systemMessageType === "user_granted_admin" && (
                                                <span>
                                                    {t("chatroom.systemMessages.user_granted_admin", {
                                                        performedUser: msg.performedUser.username,
                                                        sender: msg.sender.username,
                                                    })}
                                                </span>
                                            )
                                        )}
                                    </div>
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
                                                <div>
                                                    {msg.replyTo && (
                                                        <div className="text-sm font-semibold bg-gray-500 rounded-lg p-2 mb-2 cursor-pointer" onClick={() => { document.getElementById(msg.replyTo?._id)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
                                                            <div>{msg.replyTo?.sender?._id !== userId ? (<>{msg.replyTo?.sender?.username}</>) : (<>Siz</>)}</div>
                                                            {
                                                                msg.replyTo.mediaType ? (
                                                                    msg.replyTo.mediaType === "audio" ? (
                                                                        <div className="w-60"><AudioView reply={true} audioUrl={msg.replyTo.mediaUrl} /></div>
                                                                    ) : msg.replyTo.mediaType === "image" ? (
                                                                        <>img</>
                                                                    ) : (
                                                                        <>video</>
                                                                    )
                                                                ) : (
                                                                    <div className="text-sm">{msg.replyTo.type === "text" && msg.replyTo.content}</div>
                                                                )
                                                            }
                                                        </div>
                                                    )}
                                                    {msg.sender._id !== userId && conversation?.isGroup && (
                                                        <div className="text-sm font-semibold mb-1">
                                                            {msg.sender?.username}
                                                        </div>
                                                    )}
                                                    {
                                                        msg.mediaType ? (
                                                            msg.mediaType === "audio" ? (
                                                                <div className="w-60"><AudioView audioUrl={msg.mediaUrl} /></div>
                                                            ) : msg.mediaType === "image" ? (
                                                                <>img</>
                                                            ) : (
                                                                <>video</>
                                                            )
                                                        ) : (
                                                            <div className="text-sm">{msg.type === "text" && msg.content}</div>
                                                        )
                                                    }
                                                </div>
                                                <div className="ml-4">
                                                    {
                                                        msg.sender._id !== userId ? (
                                                            <div className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"><OtherParticipantMessageMore message={msg} messageId={msg._id} setReplyMessage={setReplyMessage} /></div>
                                                        ) : (
                                                            <div className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"><CurrentParticipantMessageMore messageId={msg._id} /></div>
                                                        )
                                                    }
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
            < footer footer className="p-4 border-t border-border dark:border-dark-border relative transition-all" ref={footerRef} >
                {
                    replyMessage && (
                        <div className="border-b border-border dark:border-dark-border mb-2 pb-4">
                            {
                                JSON.stringify(replyMessage) && (
                                    <div className={`flex justify-between items-center p-3 pr-5 rounded-xl my-1 group ${replyMessage.sender._id === userId
                                        ? "bg-message-sender dark:bg-dark-message-sender"
                                        : "bg-message-other dark:bg-dark-message-other shadow-sm"
                                        }`}
                                    >
                                        <div className="flex justify-between max-w-xl">
                                            <div>
                                                {replyMessage.sender._id !== userId && conversation?.isGroup && (
                                                    <div className="text-sm font-semibold mb-1">
                                                        {replyMessage.sender?.username}
                                                    </div>
                                                )}
                                                {
                                                    replyMessage.mediaType ? (
                                                        replyMessage.mediaType === "audio" ? (
                                                            <div className="w-60"><AudioView audioUrl={replyMessage.mediaUrl} /></div>
                                                        ) : replyMessage.mediaType === "image" ? (
                                                            <>img</>
                                                        ) : (
                                                            <>video</>
                                                        )
                                                    ) : (
                                                        <div className="text-sm">{replyMessage.type === "text" && replyMessage.content}</div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div><RxCross1 className="text-lg cursor-pointer" onClick={() => setReplyMessage(null)} /></div>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                {
                    audioURL ? (
                        <div className="flex justify-end items-center gap-x-4" >
                            <button title={t("chatroom.deleteAuidoRecordTitle", "Sil")} onClick={deleteRecording} className="cursor-pointer"><FaTrash /></button>
                            <div className="w-lg"><AudioView audioUrl={audioURL} /></div>
                            <button className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-75" onClick={handleSendMessage}><FaArrowAltCircleUp className="text-2xl" disabled={disableSendAudioButton} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            {/* Emoji Butonu */}
                            <button
                                onClick={() => setShowEmojiPicker((prev) => !prev)}
                                className="p-2 rounded-full hover:bg-sidebar-hover dark:hover:bg-dark-sidebar-selected transition-all duration-200 transform hover:scale-105 cursor-pointer"
                                aria-label="Emoji seç"
                            >
                                <BsEmojiSmile className="h-5 w-5" />
                            </button>
                            {/* Emoji Seçici */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-16 left-4 z-10 overflow-hidden w-full max-w-xs sm:max-w-sm">
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        theme={userSettings?.theme === "dark" ? "dark" : "light"}
                                        autoFocusSearch={true}
                                    />
                                </div>
                            )}
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={recording}
                                placeholder={t("chatroom.messagePlaceholder", "Mesajınızı yazın...")}
                                className="flex-1 px-4 py-2.5 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <div ref={recordRef} className="border border-border hover:bg-sidebar-hover dark:border-dark-border hover:dark:bg-dark-sidebar-selected rounded-full p-1 w-9 h-9 flex items-center justify-center transition-all duration-200 cursor-pointer" onClick={handleRecording}>
                                {
                                    recording ? (
                                        <PiRecord className="text-lg animate-ping" />
                                    ) : (
                                        <FaMicrophone className="text-lg" />
                                    )
                                }
                            </div>
                            <button
                                onClick={handleSendMessage}
                                className="px-4 py-2.5 bg-chatbutton dark:bg-dark-chatbutton text-white rounded-lg hover:bg-chatbutton-hover dark:hover:bg-dark-chatbutton-hover transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                            >
                                <FaArrowAltCircleUp className="text-lg" />
                            </button>
                        </div>
                    )
                }

            </footer >
        </div >
    );
};

export default ChatRoom;