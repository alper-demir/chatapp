import { IoMdMore, IoIosSettings, IoIosLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Link, useNavigate } from "react-router-dom";

const More = ({ setSelectedRoom }) => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate("/login");
    }

    return (
        <div className="flex items-center gap-x-2">
            <Menu as="div" className="relative inline-flex">
                <MenuButton className="flex items-center justify-center w-8 h-8 rounded-full focus:outline-none transition-colors duration-200 data-[hover]:bg-sidebar-hover dark:data-[hover]:bg-dark-sidebar-hover data-[open]:bg-sidebar-hover dark:data-[open]:bg-dark-sidebar-hover cursor-pointer">
                    <IoMdMore className="text-xl" />
                </MenuButton>

                <MenuItems
                    className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-main-bg dark:bg-dark-main-bg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    anchor="right start"
                >
                    <div className="py-1">
                        <MenuItem>
                            {({ active }) => (
                                <Link to="/chat/group-conversation"
                                    className={`cursor-pointer ${active ? 'bg-sidebar-hover dark:bg-dark-dropdown-hover text-text dark:text-dark-text' : 'text-text dark:text-dark-text'
                                        } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    <HiOutlineUserGroup className="h-4 w-4 mr-3" />
                                    Yeni Grup
                                </Link>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    className={`cursor-pointer ${active ? 'bg-sidebar-hover dark:bg-dark-dropdown-hover text-text dark:text-dark-text' : 'text-text dark:text-dark-text'
                                        } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    <CgProfile className="h-4 w-4 mr-3" />
                                    Profil
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <Link to="/settings" onClick={() => setSelectedRoom(null)}
                                    className={`cursor-pointer ${active ? 'bg-sidebar-hover dark:bg-dark-dropdown-hover text-text dark:text-dark-text' : 'text-text dark:text-dark-text'
                                        } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    <IoIosSettings className="h-4 w-4 mr-3" />
                                    Ayarlar
                                </Link>
                            )}
                        </MenuItem>

                        <div className="my-1 h-px bg-gray-200" />

                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={handleLogout}
                                    className={`cursor-pointer ${active ? 'bg-sidebar-hover dark:bg-dark-dropdown-hover text-text dark:text-dark-text' : 'text-text dark:text-dark-text'
                                        } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    <IoIosLogOut className="h-4 w-4 mr-3" />
                                    Çıkış yap
                                </button>
                            )}
                        </MenuItem>
                    </div>
                </MenuItems>
            </Menu>


        </div>
    )
}

export default More