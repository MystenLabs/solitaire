import React from "react";
import Link from "next/link";
import { useZkLogin } from "@mysten/enoki/react";
import { UserProfileMenu } from "../../general/UserProfileMenu";
import { Balance } from "../../general/Balance";

export const TopNavbar = () => {
  const { address } = useZkLogin();

  return (
    <div className="sticky top-0 z-10 flex h-full w-full items-center justify-between space-x-2 bg-inherit p-5 backdrop-blur-md md:space-x-4 md:backdrop-blur-none">
      <Link
        href="/new"
        className="w-[min-content] text-2xl font-bold text-white md:w-[300px]"
      >
        Mysten Solitaire
      </Link>
      <div className="flex flex-1 items-center justify-end space-x-1">
        {!!address && (
          <div className="flex items-center space-x-2">
            <Balance />
            <UserProfileMenu />
          </div>
        )}
      </div>
    </div>
  );
};
