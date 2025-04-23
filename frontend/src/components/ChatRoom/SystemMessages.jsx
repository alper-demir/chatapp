import { useTranslation } from "react-i18next"

const SystemMessages = ({ msg }) => {

    const { t } = useTranslation();

    return (
        <div className="text-sm italic text-center p-2 bg-system-message dark:bg-dark-system-message rounded-lg text-dark-text my-2">
            {msg.systemMessageType === "user_added" ? (
                <span>
                    {t("chatroom.systemMessages.user_added", {
                        performedUser: msg.performedUser.username,
                        sender: msg.sender.username,
                    })}
                </span>
            ) : msg.systemMessageType === "user_kicked" ? (
                <span>
                    {t("chatroom.systemMessages.user_kicked", {
                        performedUser: msg.performedUser.username,
                        sender: msg.sender.username,
                    })}
                </span>
            ) : msg.systemMessageType === "user_joined" ? (
                <span>
                    {t("chatroom.systemMessages.user_joined", {
                        performedUser: msg.performedUser.username,
                    })}
                </span>
            ) : msg.systemMessageType === "user_left" ? (
                <span>
                    {t("chatroom.systemMessages.user_left", {
                        performedUser: msg.performedUser.username,
                    })}
                </span>
            ) : msg.systemMessageType === "group_info_updated" ? (
                <span>
                    {t("chatroom.systemMessages.group_info_updated", {
                        sender: msg.sender.username,
                    })}
                </span>
            ) : msg.systemMessageType === "user_joined_with_invitation_link" ? (
                <span>
                    {t("chatroom.systemMessages.user_joined_with_invitation_link", {
                        performedUser: msg.performedUser.username,
                    })}
                </span>
            ) : (
                msg.systemMessageType === "user_granted_admin" && (
                    <span>
                        {t("chatroom.systemMessages.user_granted_admin", {
                            performedUser: msg.performedUser.username,
                            sender: msg.sender.username,
                        })}
                    </span>
                )
            )}
        </div>
    )
}

export default SystemMessages