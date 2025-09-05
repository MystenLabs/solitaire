"use client";

import { ChildrenProps } from "@/types/ChildrenProps";
import { Spinner } from "@/components/general/Spinner";
import React from "react";
import { LoadingProvider } from "@/contexts/LoadingProvider";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function MemberRootLayout({ children }: ChildrenProps) {
  const currentAccount = useCurrentAccount();

  // Show spinner while account is loading, show content when account is available
  return currentAccount ? (
    <LoadingProvider>{children}</LoadingProvider>
  ) : (
    <Spinner fullHeight />
  );
}
