// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
"use client";

import { ChildrenProps } from "@/types/ChildrenProps";
import { Spinner } from "@/components/general/Spinner";
import React, { useEffect } from "react";
import { LoadingProvider } from "@/contexts/LoadingProvider";
import { useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";

export default function MemberRootLayout({ children }: ChildrenProps) {
  const currentAccount = useCurrentAccount();
	const { isConnecting } = useCurrentWallet();
  const router = useRouter();

  useEffect(() => {
    if(!isConnecting && !currentAccount) {
      router.push("/");
    }
  }, [isConnecting, currentAccount]);

  // Show spinner while account is loading, show content when account is available
  return currentAccount && !isConnecting ? (
    <LoadingProvider>{children}</LoadingProvider>
  ) : (
    <Spinner fullHeight />
  );
}