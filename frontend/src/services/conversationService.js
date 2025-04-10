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

export const getConversationsWithUserId = async (userId) => {
    try {
        const response = await fetch(`${URL}/conversation/get/${userId}`, { method: "GET" });
        if (!response.ok) throw new Error("Sohbetler alınırken hata oluştu");
        return await response.json();
    } catch (error) {
        console.log("Conversation alırken hata: " + error);
    }
}

export const getConversationWithConversationId = async (conversationId) => {
    try {
        const response = await fetch(`${URL}/conversation/get/id/${conversationId}`, {
            method: "GET",
        });
        if (!response.ok) throw new Error("Grup bilgileri alınamadı");
        return await response.json();
    } catch (error) {
        console.error("Grup bilgileri alınırken hata oluştu:", error);
    }
}

export const addParticipantToGroup = async (conversationId, newParticipant, userId) => {
    try {
        const response = await fetch(`${URL}/conversation/add-participant`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                conversationId,
                userId: newParticipant, // Eklenecek kişi
                performer: userId, // Ekleyen kullanıcı
            }),
        });
        if (!response.ok) throw new Error("Kullanıcı eklenirken hata oluştu");
        return await response.json();
    } catch (error) {
        console.error("Kullanıcı eklenirken hata oluştu:", error);
    }
}

export const removeParticipantFromGroup = async (conversationId, userIdToRemove, userId) => {
    try {
        const response = await fetch(`${URL}/conversation/remove-participant`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                conversationId,
                userId: userIdToRemove, // Çıkarılacak kişi
                performer: userId, // Çıkaran kullanıcı 
            }),
        });
        if (!response.ok) throw new Error("Kullanıcı çıkartılırken hata oluştu");
        return await response.json();
    } catch (error) {
        console.error("Kullanıcı çıkartılırken hata oluştu:", error);
    }
}

export const updateGroupInformations = async (conversationId, groupName, description, userId) => {
    try {
        const response = await fetch(`${URL}/conversation/update-group-info`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                conversationId,
                groupName,
                description,
                userId
            }),
        });


        if (!response.ok) {
            throw new Error("Grup bilgileri güncellenemedi");
        }

        return await response.json();
    } catch (error) {
        console.error("Grup bilgileri güncellenirken hata oluştu:", error);
    }
}

export const leaveConversation = async (conversationId, userId) => {
    try {
        const response = await fetch(`${URL}/conversation/remove-participant`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                conversationId,
                userId, // Mevcut kullanıcı gruptan kendisi ayrılıyor
            }),
        });

        if (!response.ok) throw new Error("Gruptan çıkılamadı");

        return await response.json();

    } catch (error) {
        console.error("Gruptan çıkma hatası:", error);
    }
}

export const createInvitationLink = async (conversationId, userId) => {
    try {
        const response = await fetch(`${URL}/conversation/create/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId, userId }),
        });
        return await response.json();
    } catch (error) {
        console.error("Davet linki oluşturulamadı:", error);
    }
}

export const joinGroupConversationWithInvitationLink = async (conversationId, userId) => {
    try {
        const response = await fetch(`${URL}/conversation/join-group`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId, userId }),
        })
        if (!response.ok) throw new Error("Link ile gruba katılırken hata oluştu");
        return await response.json();
    } catch (error) {
        console.error("Davet linki oluşturulamadı:", error);
    }
}

export const grantUserAdmin = async (conversationId, userIdToGrant, performer) => {
    try {
        const response = await fetch(`${URL}/conversation/grant-admin`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationId,
                userIdToGrant,
                performer
            })
        })
        if (!response.ok) throw new Error("Kullanıcıyı yönetici yaparken hata oluştu");
        return await response.json();
    } catch (error) {
        console.error("Kullanıcıyı yönetici yaparken hata " + error)
    }
}