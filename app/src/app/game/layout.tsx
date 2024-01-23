"use client";

import { ChildrenProps } from "@/types/ChildrenProps";
import { useAuthentication } from "@/contexts/Authentication";
import { Spinner } from "@/components/general/Spinner";
import google from "../../../../app/public/assets/logos/google_email.svg";
import Image from "next/image";
import React from "react";

export default function MemberRootLayout({ children }: ChildrenProps) {
  const { user, isLoading } = useAuthentication();

  return (
      <div className="h-full">
          <div className={"flex align-bottom pt-10 px-20 justify-between"}>
              <div className="logo text-white text-[28px] font-bold font-['Mysten Walter Alte']">
                  Mysten Solitaire
              </div>
              <div className="flex gap-2 email pl-2 pr-3.5 py-3 left-0 top-0 rounded-[36px] border border-white border-opacity-40 items-center max-h-12">
                  <div>
                      <Image src={google}
                             alt={"Logo of google"}/>
                  </div>
                  <div className="text-center text-white text-base font-normal font-['Mysten Walter Alte'] leading-tight">
                        {user?.email}
                  </div>
              </div>
          </div>
          {isLoading ? (
              <Spinner/>
          ) : user?.role === "anonymous" ? (
              "Not allowed"
          ) : (
              children
          )}
      </div>
  );
}
