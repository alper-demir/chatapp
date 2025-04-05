import React from 'react'
import { formatConversationTime } from '../../utils/date'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const Conversation = ({ conv, selectedRoom, setSelectedRoom }) => {

    const userId = useSelector(state => state.user.user.userId);

    return (
        <Link
            key={conv._id}
            to={`/chat/${conv._id}`}
            className={`px-5 py-3 flex items-center hover:bg-sidebar-hover dark:hover:bg-dark-sidebar-hover transition-colors duration-150 ${selectedRoom === conv._id ? "bg-sidebar-selected dark:bg-dark-sidebar-selected border-l-4 border-sidebar-selected-border dark:border-dark-sidebar-selected-border" : ""
                }`}
            onClick={() => setSelectedRoom(conv._id)}
        >
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                {conv.isGroup ? "👥" : "👤"}
            </div>
            <div className="flex-1 truncate">
                <div className="font-medium truncate">
                    {
                        conv.isGroup ? (
                            <>{conv.groupName}</>
                        ) : (
                            conv?.participants.map(p => p._id !== userId && <>{p.username}</>)
                        )
                    }
                </div>
                <div className="text-sm text-sidebar-text dark:text-dark-sidebar-text flex justify-between items-center">
                    <span className="truncate mr-2" title={conv.lastMessage?.content}>{conv.lastMessage?.content || "Yeni sohbet"}</span>
                    <span className="text-xs">{formatConversationTime(conv.updatedAt)}</span>
                </div>
            </div>
            <span className="p-1 rounded-full bg-red-400 text-white text-xs">
                {
                    conv?.lastMessage?.readBy?.includes(userId) || conv?.lastMessage?.sender._id === userId ? "✓" : "Okunmamış mesaj"
                }
            </span>

        </Link>
    )
}

export default Conversation