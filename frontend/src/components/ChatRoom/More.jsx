import React from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { BsInfoSquare } from "react-icons/bs";
import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";
import { RxExit } from "react-icons/rx";

const More = () => {
    return (
        <Menu as="div" className="relative inline-flex">
            <MenuButton className="flex items-center justify-center w-8 h-8 rounded-full focus:outline-none transition-colors duration-200 data-[hover]:bg-sidebar-selected dark:data-[hover]:bg-dark-sidebar-selected data-[open]:bg-sidebar-selected dark:data-[open]:bg-dark-sidebar-selected cursor-pointer">
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
                                <BsInfoSquare className="h-4 w-4 mr-3" />
                                Grup Bilgisi
                            </Link>
                        )}
                    </MenuItem>
                    <MenuItem>
                        {({ active }) => (
                            <Link to="/chat/group-conversation"
                                className={`cursor-pointer ${active ? 'bg-sidebar-hover dark:bg-dark-dropdown-hover text-text dark:text-dark-text' : 'text-text dark:text-dark-text'
                                    } group flex w-full items-center px-4 py-2 text-sm`}
                            >
                                <RxExit className="h-4 w-4 mr-3" />
                                Gruptan çık
                            </Link>
                        )}
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    )
}

export default More