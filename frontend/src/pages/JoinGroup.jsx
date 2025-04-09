import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';
import { joinGroupConversationWithInvitationLink } from '../services/conversationService';
import { useSelector } from 'react-redux';

const JoinGroup = () => {

    const { token } = useParams();
    const navigate = useNavigate();
    const userId = useSelector(state => state.user.user.userId);

    const decodeToken = () => {
        const decoded = jwtDecode(token);
        const isValid = decoded.exp * 1000 > Date.now();
        console.log(decoded);

        isValid ? handleJoinGroup(decoded.conversationId) : navigate("/");
    }

    const handleJoinGroup = async (conversationId) => {
        const data = await joinGroupConversationWithInvitationLink(conversationId, userId);
        console.log(data);

        data ? navigate(`/chat/${data.conversation._id}`) : navigate("/");
    }

    useEffect(() => {
        decodeToken();
    }, [])

    return <div>Gruba katılıyor...</div>;
}

export default JoinGroup