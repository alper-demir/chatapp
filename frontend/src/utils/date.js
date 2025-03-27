export const timeAgo = (timestamp) => {
    const postDate = new Date(timestamp);
    const now = new Date();

    // Günlük Türkçe isimleri
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    // Zaman farkını hesapla
    const diffInMilliseconds = now - postDate;
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    // 1 günden az ise saati göster
    if (diffInHours < 24) {
        return postDate.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Dün kontrolü
    const yesterdayCheck = new Date(now);
    yesterdayCheck.setDate(now.getDate() - 1);
    if (postDate.toDateString() === yesterdayCheck.toDateString()) {
        return 'Dün';
    }

    // Bir hafta içinde ise gün ismini göster
    if (diffInDays < 7) {
        return days[postDate.getDay()];
    }

    // Diğer durumlarda gün/ay/yıl formatında göster
    const day = String(postDate.getDate()).padStart(2, '0');
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const year = postDate.getFullYear();
    return `${day}.${month}.${year}`;
};