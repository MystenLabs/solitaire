"use client";

import React from "react";
import {
  useConnectWallet,
  useCurrentAccount,
  useWallets,
} from "@mysten/dapp-kit";
import { isEnokiWallet, EnokiWallet, AuthProvider } from "@mysten/enoki";
import Image from "next/image";

export const LoginForm = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();

  const wallets = useWallets().filter(isEnokiWallet);
  const walletsByProvider = wallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<AuthProvider, EnokiWallet>()
  );

  const googleWallet = walletsByProvider.get("google");

  if (currentAccount) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-sm">Current address:</div>
        <code className="text-xs break-all">{currentAccount.address}</code>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row space-x-3 items-center justify-center">
        <button
          onClick={() => connect({ wallet: googleWallet! })}
          className="flex justify-center items-center space-x-2 px-3 py-2 bg-gray-100 text-black w-[200px] rounded-lg"
        >
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          <div>Sign In</div>
        </button>
      </div>
    </div>
  );
};
