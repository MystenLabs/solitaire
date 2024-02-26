import Image from "next/image";
import google from "../../../public/assets/logos/google_email.svg";
import React from "react";
import { UserProps } from "@/types/Authentication";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { EnokiFlow } from "@mysten/enoki";
import toast from "react-hot-toast";

export const AccountDropdown = ({
  user,
  enokiFlow,
}: {
  user: UserProps;
  enokiFlow: EnokiFlow;
}) => {
  const logout = async () => {
    await enokiFlow.logout();
    localStorage.clear();
    window.location.replace("/");
  };
  const copyAddress = () => {
    navigator.clipboard.writeText(user.address);
    toast.success("Address copied to clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button>
          <div className="email left-0 top-0 flex max-h-12 min-w-max select-none items-center gap-2 rounded-[36px] border border-white border-opacity-40 py-3 pl-2 pr-3.5">
            <div className={"shrink-0"}>
              <Image src={google} alt={"Logo of google"} />
            </div>
            <div className="font-['Mysten Walter Alte'] text-center text-base font-normal leading-tight text-white">
              {user?.email}
            </div>
            <CaretDownIcon color={"white"} />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={logout}
          className={
            "cursor-pointer select-none rounded-[36px] border border-white bg-white bg-opacity-10 px-14 py-1 text-center text-base leading-tight text-white"
          }
        >
          👋 Logout
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={copyAddress}
          className={
            "cursor-pointer select-none rounded-[36px] border border-white bg-white bg-opacity-10 px-14 py-1 text-center text-base leading-tight text-white"
          }
        >
          {user?.address.slice(0, 10) + "..."}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
