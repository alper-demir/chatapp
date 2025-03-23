import { Link } from "react-router-dom";
import "./error.css";

const Error = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center object-cover"
            style={{ backgroundImage: `url('/background.jpg')` }}
        >
            <div className="error-card">
                {/* 404 Metni (Gradient ile) */}
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4 animate-404">
                    404
                </h1>

                {/* Hata Başlığı */}
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>

                {/* Açıklama */}
                <p className="text-gray-700 mb-6">
                    The page you are looking for might have been removed or is temporarily unavailable.
                </p>

                {/* Chat Sayfasına Yönlendirme Butonu */}
                <Link
                    to="/chat"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
                >
                    Go to Chat
                </Link>
            </div>
        </div>
    );
};

export default Error;