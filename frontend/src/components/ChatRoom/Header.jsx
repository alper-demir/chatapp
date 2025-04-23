import React from 'react'
import { useTranslation } from 'react-i18next';
import More from "./More";

const Header = ({ conversation, userId, isOnline, roomId }) => {

    const { t } = useTranslation();

    return (
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
    )
}

export default Header