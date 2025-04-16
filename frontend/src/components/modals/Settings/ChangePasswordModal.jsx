import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoClose, IoEyeOutline, IoEyeOffOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";
import { changePassword } from "../../../services/userService";
import { useTranslation } from "react-i18next"; // i18next için

// Yeniden kullanılabilir PasswordInput bileşeni
const PasswordInput = ({ placeholder, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full p-2 pr-10 border border-border dark:border-dark-border rounded-lg focus:outline-none text-sm"
            />
            <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                {showPassword ? (
                    <IoEyeOffOutline className="h-5 w-5" />
                ) : (
                    <IoEyeOutline className="h-5 w-5" />
                )}
            </button>
        </div>
    );
};

const ChangePasswordModal = ({ isOpen, close }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userId = useSelector((state) => state.user.user.userId);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isMinLengthValid, setIsMinLengthValid] = useState(false);
    const [isMaxLengthValid, setIsMaxLengthValid] = useState(false);
    const [isNoSpecialChars, setIsNoSpecialChars] = useState(false);
    const [isPasswordMatch, setIsPasswordMatch] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Şifre kurallarını kontrol eden fonksiyon
    const checkPasswordRules = (newPass, confirmPass) => {
        setIsMinLengthValid(newPass.length >= 6);
        setIsMaxLengthValid(newPass.length <= 20);
        setIsNoSpecialChars(/^[a-zA-Z0-9]*$/.test(newPass));
        setIsPasswordMatch(newPass === confirmPass && newPass.length > 0);
    };

    // Yeni şifre inputu değiştiğinde
    const handleNewPasswordChange = (e) => {
        const password = e.target.value;
        setNewPassword(password);
        checkPasswordRules(password, confirmNewPassword);
    };

    // Onay şifresi inputu değiştiğinde
    const handleConfirmPasswordChange = (e) => {
        const confirmPassword = e.target.value;
        setConfirmNewPassword(confirmPassword);
        checkPasswordRules(newPassword, confirmPassword);
    };

    const handleChangePassword = async () => {
        setIsLoading(true);
        setErrorMessage(""); // Hata mesajını sıfırla

        // Tüm kuralların geçerli olduğunu kontrol et
        if (!isMinLengthValid) {
            setErrorMessage(t("changePasswordModal.error.minLength", "Şifre en az 6 karakter olmalıdır."));
            setIsLoading(false);
            return;
        }
        if (!isMaxLengthValid) {
            setErrorMessage(t("changePasswordModal.error.maxLength", "Şifre en fazla 20 karakter olmalıdır."));
            setIsLoading(false);
            return;
        }
        if (!isNoSpecialChars) {
            setErrorMessage(t("changePasswordModal.error.specialChars", "Şifre özel karakter içermemelidir."));
            setIsLoading(false);
            return;
        }
        if (!isPasswordMatch) {
            setErrorMessage(t("changePasswordModal.error.passwordMismatch", "Yeni şifre ve onay şifresi eşleşmelidir."));
            setIsLoading(false);
            return;
        }

        const data = await changePassword(userId, currentPassword, newPassword);
        console.log(data);

        if (data) {
            close();
            navigate("/settings");
        }
        setIsLoading(false);
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
                            {t("changePasswordModal.title", "Şifreyi Değiştir")}
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
                        {/* Şifreler için input */}
                        <div className="mt-4">
                            <PasswordInput
                                placeholder={t("changePasswordModal.currentPasswordPlaceholder", "Mevcut şifrenizi girin")}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div className="mt-4">
                            <PasswordInput
                                placeholder={t("changePasswordModal.newPasswordPlaceholder", "Yeni şifre")}
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                            />
                        </div>
                        <div className="mt-4">
                            <PasswordInput
                                placeholder={t("changePasswordModal.confirmPasswordPlaceholder", "Yeni şifre tekrar")}
                                value={confirmNewPassword}
                                onChange={handleConfirmPasswordChange}
                            />
                        </div>

                        {/* Şifre kuralları */}
                        <div className="text-left mt-4">
                            <p className="text-sm font-medium">
                                {t("changePasswordModal.passwordRulesTitle", "Şifre Kuralları:")}
                            </p>
                            <ul className="list-none text-sm mt-2">
                                <li className="flex items-center">
                                    {isMinLengthValid ? (
                                        <IoCheckmarkCircleOutline className="text-green-500 mr-2" />
                                    ) : (
                                        <IoCloseCircleOutline className="text-red-500 mr-2" />
                                    )}
                                    {t("changePasswordModal.minLengthRule", "En az 6 karakter")}
                                </li>
                                <li className="flex items-center">
                                    {isMaxLengthValid ? (
                                        <IoCheckmarkCircleOutline className="text-green-500 mr-2" />
                                    ) : (
                                        <IoCloseCircleOutline className="text-red-500 mr-2" />
                                    )}
                                    {t("changePasswordModal.maxLengthRule", "En fazla 20 karakter")}
                                </li>
                                <li className="flex items-center">
                                    {isNoSpecialChars ? (
                                        <IoCheckmarkCircleOutline className="text-green-500 mr-2" />
                                    ) : (
                                        <IoCloseCircleOutline className="text-red-500 mr-2" />
                                    )}
                                    {t("changePasswordModal.noSpecialCharsRule", "Özel karakter içermemeli")}
                                </li>
                                <li className="flex items-center">
                                    {isPasswordMatch ? (
                                        <IoCheckmarkCircleOutline className="text-green-500 mr-2" />
                                    ) : (
                                        <IoCloseCircleOutline className="text-red-500 mr-2" />
                                    )}
                                    {t("changePasswordModal.passwordMatchRule", "Şifreler eşleşmeli")}
                                </li>
                            </ul>
                        </div>

                        {/* Hata mesajı */}
                        {errorMessage && (
                            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={close}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-200 dark:bg-dark-sidebar text-gray-700 dark:text-dark-text rounded-lg hover:bg-gray-300 dark:hover:bg-dark-sidebar-selected transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {t("changePasswordModal.cancelButton", "İptal")}
                        </button>
                        <button
                            onClick={handleChangePassword}
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
                                    <span>{t("changePasswordModal.processingButton", "İşleniyor...")}</span>
                                </>
                            ) : (
                                <span>{t("changePasswordModal.changeButton", "Değiştir")}</span>
                            )}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ChangePasswordModal;