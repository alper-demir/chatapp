import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const GroupConversation = () => {

    const userId = useSelector((state) => state.user.user.userId);

    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const URL = import.meta.env.VITE_SERVER_URL;

    // Kullanıcı arama fonksiyonu
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`${URL}/user/findByEmail/${query}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const data = await response.json();
            setSearchResults([data]); // Tek kullanıcı döndüğünü varsayıyorum, API birden fazla dönerse düzenlenir
        } catch (error) {
            console.error('Arama hatası: ', error);
            setSearchResults([]);
        }
    };

    // Kullanıcı seçme fonksiyonu
    const handleSelectUser = (user) => {
        if (!selectedUsers.find((u) => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    // Kullanıcı silme fonksiyonu
    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
    };

    // Grup oluşturma fonksiyonu (örnek bir API çağrısı)
    const handleCreateGroup = async () => {
        if (!groupName || selectedUsers.length === 0) {
            alert('Lütfen bir grup adı ve en az bir kullanıcı seçin.');
            return;
        }

        try {
            const response = await fetch(`${URL}/conversation/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participants: Array.from(new Set([...selectedUsers.map((user) => user._id), userId])), // Katılımcıları seç ve mevcut kullanıcıyıda dahil et.
                    isGroup: true,
                    groupName,
                    admins: userId,
                }),
            });

            if (!response.ok) {
                throw new Error('Grup oluşturulamadı');
            }

            const data = await response.json();
            console.log('Grup oluşturuldu: ', data);
            navigate(`/chat/${data._id}`)
            // Başarılıysa yönlendirme veya başka bir aksiyon eklenebilir
        } catch (error) {
            console.error('Grup oluşturma hatası: ', error);
        }
    };

    return (
        <div className="flex-1 bg-white p-6 shadow-sm h-screen">
            <h1 className="text-xl font-semibold text-gray-800 mb-6">Grup Sohbeti Oluştur</h1>

            {/* Grup Adı Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grup Adı</label>
                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Grup adını girin..."
                    className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm transition-all duration-200"
                />
            </div>

            {/* Kullanıcı Arama Alanı */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Ara</label>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Email ile ara..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm transition-all duration-200"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Arama Sonuçları */}
            {searchResults.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Arama Sonuçları</h2>
                    <ul className="space-y-2">
                        {searchResults.map((user) => (
                            <li
                                key={user._id}
                                className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg shadow-sm"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                        {user.avatar || '👤'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{user.email.split('@')[0]}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSelectUser(user)}
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors duration-200"
                                >
                                    Seç
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Seçilen Kullanıcılar */}
            {selectedUsers.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Seçilen Kullanıcılar</h2>
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center bg-indigo-100 rounded-full px-3 py-1.5 text-sm text-gray-800"
                            >
                                <span>{user.email.split('@')[0]}</span>
                                <button
                                    onClick={() => handleRemoveUser(user._id)}
                                    className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Grup Oluşturma Butonu */}
            <button
                onClick={handleCreateGroup}
                className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors duration-200"
            >
                Grup Oluştur
            </button>
        </div>
    );
};

export default GroupConversation;