import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ModalManager from "../components/modals/ModalManager";

const MainLayout = () => {

    const theme = () => {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
            document.querySelector("html").classList.add("dark");
        } else {
            document.querySelector("html").classList.remove("dark");
        }
    }

    useEffect(() => {
        theme();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 font-inter antialiased text-text dark:text-dark-text">
            {/* Sidebar */}
            <Sidebar />
            {/* Ana İçerik Alanı */}
            <div className="flex-1 md:w-3/4 bg-main-bg dark:bg-dark-main-bg">
                <Outlet />
            </div>
            <ModalManager />
        </div>
    );
};

export default MainLayout;