import Image from "next/image";
import google from "../../../public/assets/logos/google_email.svg";
import React from "react";
import {UserProps} from "@/types/Authentication";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";
import { CaretDownIcon } from "@radix-ui/react-icons";
import {EnokiFlow} from "@mysten/enoki";
import toast from "react-hot-toast";

export const AccountDropdown = ({user, enokiFlow}: { user: UserProps, enokiFlow: EnokiFlow }) => {
    const logout = async () => {
        await enokiFlow.logout();
        localStorage.clear();
        window.location.replace("/");
    };
    const copyAddress = () => {
        navigator.clipboard.writeText(user.address);
        toast.success("Address copied to clipboard");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <button>
                    <div
                        className="select-none flex gap-2 email pl-2 pr-3.5 py-3 left-0 top-0 rounded-[36px] border border-white border-opacity-40 items-center max-h-12 min-w-max">
                        <div className={"shrink-0"}>
                            <Image src={google} alt={"Logo of google"}/>
                        </div>
                        <div
                            className="text-center text-white text-base font-normal font-['Mysten Walter Alte'] leading-tight">
                            {user?.email}
                        </div>
                        <CaretDownIcon color={"white"}/>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onSelect={logout} className={"select-none rounded-[36px] border border-white px-14 py-1 text-center text-white bg-white bg-opacity-10 text-base leading-tight cursor-pointer"}>
                    👋 Logout
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={copyAddress} className={"select-none rounded-[36px] border border-white px-14 py-1 text-center text-white bg-white bg-opacity-10 text-base leading-tight cursor-pointer"}>
                    {user?.address.slice(0, 10)+'...'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}