import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";
import { useTranslation } from "react-i18next";

const Register = () => {

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Şifreler eşleşmiyor!");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, username }),
            });

            if (!response.ok) {
                throw new Error("Kayıt başarısız");
            }

            const data = await response.json();
            console.log(data);

            navigate("/");
        } catch (error) {
            console.error("Kayıt hatası:", error);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url('/background.jpg')` }}
        >
            <title>{t("register.pageTitle", "Chatapp | Register")}</title>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-lg glass-card">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                    {t("register.title", "Sign up")}
                </h2>
                <form onSubmit={handleRegister}>
                    {/* Email Input */}
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("register.emailPlaceholder", "Email")}
                            className="w-full p-3 bg-opacity-20 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-800"
                            required
                        />
                    </div>

                    {/* Create Password Input */}
                    <div className="mb-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("register.passwordPlaceholder", "Password")}
                            className="w-full p-3 bg-opacity-20 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-800"
                            required
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mb-4 relative">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t("register.confirmPasswordPlaceholder", "Confirm password")}
                            className="w-full p-3 bg-opacity-20 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-800"
                            required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            👁️
                        </span>
                    </div>

                    {/* Username Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t("register.usernamePlaceholder", "Username")}
                            className="w-full p-3 bg-opacity-20 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-800"
                            required
                        />
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        className="w-full p-3 border text-white rounded-lg cursor-pointer hover:backdrop-blur-xl"
                    >
                        {t("register.signUpButton", "Sign up")}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    {t("register.hasAccount", "Already have an account?")}{" "}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        {t("register.loginLink", "Login")}
                    </Link>
                </div>

                {/* Divider */}
                <div className="my-4 flex items-center">
                    <hr className="flex-1 border-gray-300" />
                    <span className="mx-2 text-gray-800">{t("register.or", "Or")}</span>
                    <hr className="flex-1 border-gray-300" />
                </div>

                {/* Social Login Buttons */}
                <button className="w-full p-3 mb-3 bg-blue-800 text-white rounded-lg flex items-center justify-center hover:bg-blue-900 transition-all">
                    <span className="mr-2">f</span>{" "}
                    {t("register.facebookLogin", "Login with Facebook")}
                </button>
                <button className="w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all">
                    <span className="mr-2">G</span>{" "}
                    {t("register.googleLogin", "Login with Google")}
                </button>
            </div>
        </div>
    );
};

export default Register;