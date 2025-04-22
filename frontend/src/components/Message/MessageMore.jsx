import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { BsInfoSquare } from "react-icons/bs";
import { IoMdMore } from "react-icons/io";
import { useDispatch } from 'react-redux';
import { openModal } from '../../store/modalSlice';
import { useTranslation } from 'react-i18next';
import { BsArrow90DegLeft } from "react-icons/bs";

const MessageMore = ({ message, setReplyMessage, userId }) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const handleMessageInfoModal = () => {
        dispatch(openModal({ modalType: "MessageInfoModal", modalData: { message } }))
    }

    return (
        <Menu as="div" className="relative inline-flex">
            <MenuButton className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <IoMdMore className="text-lg" />
            </MenuButton>

            <MenuItems
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-main-bg dark:bg-dark-main-bg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                anchor="right start"
            >
                <div className="py-1">
                    <MenuItem>
                        {({ active }) => (
                            <div onClick={handleMessageInfoModal}
                                className={`cursor-pointer ${active ? 'bg-sidebar-hover dark:bg-dark-dropdown-hover text-text dark:text-dark-text' : 'text-text dark:text-dark-text'
                                    } group flex w-full items-center px-4 py-2 text-sm`}
                            >
                                <BsInfoSquare className="h-4 w-4 mr-3" />
                                {t("chatroom.messageMore.messageInfo", "Mesaj bilgisi")}
                            </div>
                        )}
                    </MenuItem>
                    <MenuItem>
                        {({ active }) => (
                            <div onClick={() => setReplyMessage(message)}
                                className={`cursor-pointer ${active ? 'bg-sidebar-hover dark:bg-dark-dropdown-hover text-text dark:text-dark-text' : 'text-text dark:text-dark-text'
                                    } group flex w-full items-center px-4 py-2 text-sm`}
                            >
                                <BsArrow90DegLeft className="h-4 w-4 mr-3" />
                                {t("chatroom.messageMore.reply", "Yanıtla")}
                            </div>
                        )}
                    </MenuItem>
                    {/* {
                        message.sender._id !== userId && (
                            <MenuItem>
                                {({ active }) => (
                                    <div onClick={() => setReplyMessage(message)}
                                        className={`cursor-pointer ${active ? 'bg-sidebar-hover dark:bg-dark-dropdown-hover text-text dark:text-dark-text' : 'text-text dark:text-dark-text'
                                            } group flex w-full items-center px-4 py-2 text-sm`}
                                    >
                                        <BsArrow90DegLeft className="h-4 w-4 mr-3" />
                                        Other
                                    </div>
                                )}
                            </MenuItem>
                        )
                    } */}
                </div>
            </MenuItems>
        </Menu>
    )
}

export default MessageMore