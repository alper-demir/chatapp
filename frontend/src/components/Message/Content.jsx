import React from 'react'
import AudioView from '../AudioView'

const Content = ({ message, reply }) => {
    return (
        <>
            {
                message.mediaType ? (
                    message.mediaType === "audio" ? (
                        <div className="w-60"><AudioView audioUrl={message.mediaUrl} reply={reply} /></div>
                    ) : message.mediaType === "image" ? (
                        <>img</>
                    ) : (
                        <>video</>
                    )
                ) : (
                    <div className="text-sm">{message.type === "text" && message.content}</div>
                )
            }
        </>
    )
}

export default Content