import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message);
            }

            localStorage.setItem("token", data.token);
            navigate("/");
        } catch (error) {
            console.error("Giriş hatası:", error);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url('/background.jpg')` }}
        >
            <div className="glass-card w-full">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Login</h2>
                <form onSubmit={handleLogin}>
                    {/* Email Input */}
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full p-3  bg-opacity-20 rounded-lg border border-gray-300 focus:outline-none placeholder-gray-800"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4 relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-3  bg-opacity-20 rounded-lg border border-gray-300 focus:outline-none placeholder-gray-800"
                            required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">👁️</span>
                    </div>

                    {/* Forget Password Link */}
                    <div className="mb-6 text-right">
                        <a href="#" className="text-sm text-blue-500 hover:underline">
                            Forget password?
                        </a>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full p-3 border text-white rounded-lg cursor-pointer hover:backdrop-blur-xl"
                    >
                        Login
                    </button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-500 hover:underline">
                        Sign up
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

export default Login;