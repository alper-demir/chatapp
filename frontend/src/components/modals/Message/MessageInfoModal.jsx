import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { formatDate, formatMessageTime } from "../../../utils/date";
import Content from "../../Message/Content";

const MessageInfoModal = ({ isOpen, close, modalData }) => {
    const { t } = useTranslation();
    const { message } = modalData;

    return (
        <Dialog open={isOpen} as="div" className="relative z-50" onClose={close}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 text-text dark:text-dark-text">
                <DialogPanel
                    transition
                    className="w-full max-w-sm rounded-2xl bg-main-bg dark:bg-dark-main-bg p-6 shadow-xl ring-1 ring-white/10 transform transition-all duration-300 ease-out scale-100 opacity-100"
                >
                    <div className="flex justify-between items-center border-b border-border dark:border-dark-border pb-3 mb-4">
                        <DialogTitle as="h3" className="text-lg font-semibold">
                            {t("messageInfoModal.title", "Mesaj Bilgisi")}
                        </DialogTitle>
                    </div>

                    <div className="text-center mb-6 flex flex-col gap-y-3 items-center">
                        <p className="text-sm font-medium">
                            {t("messageInfoModal.sender", "Gönderen")}: {message.sender.email}
                        </p>
                        <p className="text-sm">
                            <Content message={message} />
                        </p>
                        <p className="text-xs">
                            {t("messageInfoModal.time", "Gönderilme Zamanı")}: {formatDate(message.createdAt) + " " + formatMessageTime(message.createdAt)}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={close}
                            className="px-4 py-2 bg-sidebar dark:bg-dark-sidebar dark:text-dark-text hover:bg-sidebar-selected dark:hover:bg-dark-sidebar-selected rounded-lg text-sm font-medium cursor-pointer transition-colors"
                        >
                            {t("messageInfoModal.close", "Kapat")}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default MessageInfoModal;