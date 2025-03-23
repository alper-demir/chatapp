import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";

const ProtectedRoute = () => {

    const dispatch = useDispatch();

    const token = localStorage.getItem("token");

    // şuan sadece user id bilgisi geliyor, id ile apiye istek atıp user bilgilerini redux'a verebiliriz
    if (token) {
        const decodedJWT = jwtDecode(token);
        dispatch(setUser(decodedJWT));
        console.log(decodedJWT);
    }

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;