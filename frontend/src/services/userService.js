const URL = import.meta.env.VITE_SERVER_URL; // host/api

export const getProfileWithUsername = async (username) => {
    try {
        const response = await fetch(`${URL}/user/profile/${username}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Kullanıcı bilgileri alınamadı");
        }

        return await response.json();

    } catch (error) {
        console.log("Bir hata oluştu: " + error);
    }
}

export const searchUserWithEmail = async (email) => {
    try {
        const response = await fetch(`${URL}/user/findByEmail/${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Kullanıcı bilgileri alınamadı");
        }

        return await response.json();

    } catch (error) {
        console.log("Bir hata oluştu: " + error);
    }
}

export const deleteUserAccount = async (userId) => {
    try {
        const response = await fetch(`${URL}/user/account/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Kullanıcı kaydı silerken hata oluştu");
        }

        return await response.json();

    } catch (error) {
        console.log("Bir hata oluştu: " + error);
    }
}