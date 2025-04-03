import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser, setUserSettings } from "../store/userSlice";

const ProtectedRoute = () => {

    const dispatch = useDispatch();

    const token = localStorage.getItem("token");

    const fetchSettigns = async (userId) => {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/user/settings/${userId}`);
        return await response.json();
    }

    // şuan sadece user id bilgisi geliyor, id ile apiye istek atıp user bilgilerini redux'a verebiliriz
    if (token) {
        const decodedJWT = jwtDecode(token);

        fetchSettigns(decodedJWT.userId).then(data => {
            dispatch(setUserSettings({ notifications: data.notifications, privacy: data.privacy, theme: data.theme }));
        });

        dispatch(setUser(decodedJWT));
    }

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;