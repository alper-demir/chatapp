import { createBrowserRouter } from "react-router-dom";
import ChatRoom from "./pages/ChatRoom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Error from "./pages/Error"; // Error bileşeni import ediliyor
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import GroupConversation from "./pages/GroupConversation";
import Settings from "./pages/Settings";
import MainLayout from "./layout/MainLayout";
import Profile from "./pages/Profile";
import JoinGroup from "./pages/JoinGroup";

const routes = createBrowserRouter([
  {
    element: <AuthRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { path: "settings", element: <Settings /> },
          { path: "chat/:roomId", element: <ChatRoom /> },
          { path: "chat/group-conversation", element: <GroupConversation /> },
          { path: "profile/:username", element: <Profile /> },
          { path: "join-group/:token", element: <JoinGroup /> }
        ],
      },
    ],
  },
  { path: "*", element: <Error /> }, // Bilinmeyen yollar için Error sayfası
]);

export default routes;