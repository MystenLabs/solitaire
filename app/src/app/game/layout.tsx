"use client";

import { ChildrenProps } from "@/types/ChildrenProps";
import { useAuthentication } from "@/contexts/Authentication";
import { Spinner } from "@/components/general/Spinner";
import google from "../../../../app/public/assets/logos/google_email.svg";
import Image from "next/image";
import React from "react";

export default function MemberRootLayout({ children }: ChildrenProps) {
  const { user, isLoading } = useAuthentication();

  return isLoading ? (
    <Spinner />
  ) : user?.role === "anonymous" ? (
    "Not allowed"
  ) : (
    children
  );
}
