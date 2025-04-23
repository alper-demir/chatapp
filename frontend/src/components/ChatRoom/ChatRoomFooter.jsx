import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowAltCircleUp, FaMicrophone, FaTrash } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import { PiRecord } from "react-icons/pi";
import { RxCross1 } from "react-icons/rx";
import EmojiPicker from "emoji-picker-react";
import autoAnimate from "@formkit/auto-animate";
import AudioView from "../AudioView";
import Content from "../Message/Content";

const ChatRoomFooter = ({
    userId,
    roomId,
    userSettings,
    newMessage,
    setNewMessage,
    replyMessage,
    setReplyMessage,
    handleSendMessage,
    socket,
}) => {
    const { t } = useTranslation();
    const recordRef = useRef(null);
    const footerRef = useRef(null);
    const inputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const timeIntervalRef = useRef(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState("");
    const [disableSendAudioButton, setDisableSendAudioButton] = useState(false);

    useEffect(() => {
        inputRef?.current?.focus();
    }, [replyMessage]);

    useEffect(() => {
        recordRef.current && autoAnimate(recordRef.current);
    }, [recordRef]);

    useEffect(() => {
        footerRef.current && autoAnimate(footerRef.current);
    }, [footerRef]);

    const handleEmojiClick = (emojiObject) => {
        setNewMessage((prev) => prev + emojiObject.emoji);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            clearTimeout(timerRef.current);
            clearInterval(timeIntervalRef.current);
        }
    };

    const deleteRecording = () => {
        setAudioURL("");
        setRecording(false);
        clearTimeout(timerRef.current);
        clearInterval(timeIntervalRef.current);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        mediaRecorderRef.current = null;
        chunksRef.current = [];
    };

    const handleRecording = async () => {
        setRecording((prev) => !prev);
        if (recording) {
            console.log("Ses kaydı durduruldu.");
            stopRecording();
        } else {
            console.log("Ses kaydı başlatıldı.");
            try {
                let time = 15; // Maksimum 15 saniye
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
                    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
                };

                mediaRecorder.start();
            } catch (err) {
                console.error("Microphone access error:", err);
                setRecording(false);
                clearInterval(timeIntervalRef.current);
            } finally {
                setDisableSendAudioButton(false);
            }
        }
    };

    const sendAudioMessage = async () => {
        if (!audioURL || disableSendAudioButton) return;
        setDisableSendAudioButton(true);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioFile = new File([blob], `audio_${Date.now()}.webm`, {
            type: "audio/webm",
        });

        const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        const formData = new FormData();
        formData.append("file", audioFile);
        formData.append("upload_preset", upload_preset);
        formData.append("cloud_name", cloud_name);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloud_name}/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

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

    return (
        <footer
            className="p-4 border-t border-border dark:border-dark-border relative transition-all"
            ref={footerRef}
        >
            {replyMessage && (
                <div className="border-b border-border dark:border-dark-border mb-2 pb-4">
                    {JSON.stringify(replyMessage) && (
                        <div
                            className={`flex justify-between items-center p-3 pr-5 rounded-xl my-1 group ${replyMessage.sender._id === userId
                                    ? "bg-message-sender dark:bg-dark-message-sender"
                                    : "bg-message-other dark:bg-dark-message-other shadow-sm"
                                }`}
                        >
                            <div className="flex justify-between max-w-xl">
                                <div>
                                    <div className="text-sm font-semibold mb-1">
                                        {replyMessage.sender._id !== userId ? (
                                            <>{replyMessage.sender?.username}</>
                                        ) : (
                                            <>{t("chatroom.you", "Siz")}</>
                                        )}
                                    </div>
                                    <Content message={replyMessage} />
                                </div>
                            </div>
                            <div>
                                <RxCross1
                                    className="text-lg cursor-pointer hover:scale-105 transition-all duration-200"
                                    onClick={() => setReplyMessage(null)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
            {audioURL ? (
                <div className="flex justify-end items-center gap-x-4">
                    <button
                        title={t("chatroom.deleteAuidoRecordTitle", "Sil")}
                        onClick={deleteRecording}
                        className="cursor-pointer"
                    >
                        <FaTrash />
                    </button>
                    <div className="w-lg">
                        <AudioView audioUrl={audioURL} />
                    </div>
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-75"
                        onClick={sendAudioMessage}
                        disabled={disableSendAudioButton}
                    >
                        <FaArrowAltCircleUp className="text-2xl" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="p-2 rounded-full hover:bg-sidebar-hover dark:hover:bg-dark-sidebar-selected transition-all duration-200 transform hover:scale-105 cursor-pointer"
                        aria-label="Emoji seç"
                    >
                        <BsEmojiSmile className="h-5 w-5" />
                    </button>
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
                        ref={inputRef}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={recording}
                        placeholder={t("chatroom.messagePlaceholder", "Mesajınızı yazın...")}
                        className="flex-1 px-4 py-2.5 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <div
                        title={
                            recording
                                ? t("chatroom.stopAudioTitle", "Kaydı durdur")
                                : t("chatroom.recordAudioTitle", "Ses kaydet")
                        }
                        ref={recordRef}
                        className="border border-border hover:bg-sidebar-hover dark:border-dark-border hover:dark:bg-dark-sidebar-selected rounded-full p-1 w-9 h-9 flex items-center justify-center transition-all duration-200 cursor-pointer"
                        onClick={handleRecording}
                    >
                        {recording ? (
                            <PiRecord className="text-lg animate-ping" />
                        ) : (
                            <FaMicrophone className="text-lg" />
                        )}
                    </div>
                    <button
                        onClick={handleSendMessage}
                        className="px-4 py-2.5 bg-chatbutton dark:bg-dark-chatbutton text-white rounded-lg hover:bg-chatbutton-hover dark:hover:bg-dark-chatbutton-hover transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                    >
                        <FaArrowAltCircleUp className="text-lg" />
                    </button>
                </div>
            )}
        </footer>
    );
};

export default ChatRoomFooter;