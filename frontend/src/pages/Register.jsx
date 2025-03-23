import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

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
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Kayıt başarısız");
            }

            const data = await response.json();
            console.log(data);
            
            navigate("/chat"); // Kayıt başarılıysa chat sayfasına yönlendir
        } catch (error) {
            console.error("Kayıt hatası:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url('/background.jpg')` }}>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-lg glass-card">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Sign up</h2>
                <form onSubmit={handleRegister}>
                    {/* Email Input */}
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
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
                            placeholder="Password"
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
                            placeholder="Confirm password"
                            className="w-full p-3 bg-opacity-20 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-800"
                            required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">👁️</span>
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        className="w-full p-3 border text-white rounded-lg cursor-pointer hover:backdrop-blur-xl"
                    >
                        Sign up
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </div>

                {/* Divider */}
                <div className="my-4 flex items-center">
                    <hr className="flex-1 border-gray-300" />
                    <span className="mx-2 text-gray-800">Or</span>
                    <hr className="flex-1 border-gray-300" />
                </div>

                {/* Social Login Buttons */}
                <button className="w-full p-3 mb-3 bg-blue-800 text-white rounded-lg flex items-center justify-center hover:bg-blue-900 transition-all">
                    <span className="mr-2">f</span> Login with Facebook
                </button>
                <button className="w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all">
                    <span className="mr-2">G</span> Login with Google
                </button>
            </div>
        </div>
    );
};

export default Register;