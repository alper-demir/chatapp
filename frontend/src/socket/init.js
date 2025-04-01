import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const socket = io(BASE_URL, {
    autoConnect: true, // Otomatik bağlanmayı aç
    reconnection: true, // Yeniden bağlanma aktif
    reconnectionAttempts: Infinity, // Sonsuz yeniden bağlanma denemesi
    reconnectionDelay: 1000, // 1 saniye aralıkla yeniden bağlanmayı dene
    reconnectionDelayMax: 5000, // Maksimum 5 saniye bekleme
});

socket.on("connect", () => {
    console.log("Socket bağlandı:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("Socket bağlantısı kesildi:", reason);
});

socket.on("reconnect", (attempt) => {
    console.log("Socket yeniden bağlandı, deneme sayısı:", attempt);
});

export default socket;