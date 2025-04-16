import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteUserAccount } from "../../../services/userService";
import { useTranslation } from "react-i18next";

const DeleteAccountModal = ({ isOpen, close }) => {
    const { t } = useTranslation();
    const userId = useSelector((state) => state.user.user.userId);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        const data = await deleteUserAccount(userId);
        setIsLoading(false);
        if (data) {
            console.log("Hesap silindi:", data);
            localStorage.removeItem("token");
            navigate("/login");
        } else {
            console.error("Hata:", data.message);
        }
        return;
    };

    return (
        <Dialog open={isOpen} as="div" className="relative z-50" onClose={close}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 text-text dark:text-dark-text">
                <DialogPanel
                    transition
                    className="w-full max-w-sm rounded-2xl bg-main-bg dark:bg-dark-main-bg p-6 shadow-xl ring-1 ring-white/10 transform transition-all duration-300 ease-out scale-100 opacity-100"
                >
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <DialogTitle as="h3" className="text-lg font-semibold">
                            {t("deleteAccountModal.title", "Hesabı Sil")}
                        </DialogTitle>
                        <button
                            onClick={close}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                            disabled={isLoading}
                        >
                            <IoClose className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-sm mt-1">
                            {t(
                                "deleteAccountModal.confirmMessage",
                                "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!"
                            )}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={close}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-200 dark:bg-dark-sidebar text-gray-700 dark:text-dark-text rounded-lg hover:bg-gray-300 dark:hover:bg-dark-sidebar-selected transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {t("deleteAccountModal.cancelButton", "İptal")}
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span>{t("deleteAccountModal.processingButton", "İşleniyor...")}</span>
                                </>
                            ) : (
                                <span>{t("deleteAccountModal.deleteButton", "Hesabı Sil")}</span>
                            )}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default DeleteAccountModal;