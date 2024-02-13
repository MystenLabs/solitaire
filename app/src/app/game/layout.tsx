"use client";

import { ChildrenProps } from "@/types/ChildrenProps";
import { useAuthentication } from "@/contexts/Authentication";
import { Spinner } from "@/components/general/Spinner";
import google from "../../../../app/public/assets/logos/google_email.svg";
import Image from "next/image";
import React from "react";
import { LoadingProvider } from "@/contexts/LoadingProvider";

export default function MemberRootLayout({ children }: ChildrenProps) {
  const { user, isLoading } = useAuthentication();

  return isLoading ? (
    <Spinner />
  ) : user?.role === "anonymous" ? (
    "Not allowed"
  ) : (
    <LoadingProvider>{children}</LoadingProvider>
  );
}
