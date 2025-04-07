const URL = import.meta.env.VITE_SERVER_URL; // host/api

export const startConversation = async (userId, otherUserId) => {
    const response = await fetch(`${URL}/conversation/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            participants: [userId, otherUserId], // Mevcut kullanıcı ve aranan kullanıcı
        }),
    });

    if (!response.ok) {
        throw new Error("Sohbet başlatılamadı");
    }

    return await response.json();
};