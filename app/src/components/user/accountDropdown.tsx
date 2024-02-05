import Image from "next/image";
import google from "../../../public/assets/logos/google_email.svg";
import React from "react";
import {UserProps} from "@/types/Authentication";

export const AccountDropdown = ({ user }: {user: UserProps}) => {
    return (
        <div
            className="flex gap-2 email pl-2 pr-3.5 py-3 left-0 top-0 rounded-[36px] border border-white border-opacity-40 items-center max-h-12 min-w-max">
            <div className={"shrink-0"}>
                <Image src={google} alt={"Logo of google"}/>
            </div>
            <div className="text-center text-white text-base font-normal font-['Mysten Walter Alte'] leading-tight">
                {user?.email}
            </div>
        </div>
    )
}