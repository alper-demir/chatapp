import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../store/modalSlice';
import LeaveGroupModal from "./Conversation/LeaveGroupModal";
import GroupInfoModal from "./Conversation/GroupInfoModal";
import ChangePasswordModal from "./Settings/ChangePasswordModal";
import DeleteAccountModal from "./Settings/DeleteAccountModal";
import MessageInfoModal from './Message/MessageInfoModal';

const modalComponents = { // MODAL LIST
    LeaveGroupModal: LeaveGroupModal,
    GroupInfoModal: GroupInfoModal,
    ChangePasswordModal: ChangePasswordModal,
    DeleteAccountModal: DeleteAccountModal,
    MessageInfoModal: MessageInfoModal
};

const ModalManager = () => {

    const dispatch = useDispatch();
    const { isOpen, modalData, modalType } = useSelector(state => state.modal);

    const close = () => {
        dispatch(closeModal());
    }

    if (!isOpen || !modalType) return null;

    const SpecificModal = modalComponents[modalType];

    return (
        <SpecificModal
            isOpen={isOpen}
            close={close}
            modalData={modalData}
        />
    );
}

export default ModalManager;