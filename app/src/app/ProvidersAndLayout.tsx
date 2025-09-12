// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
"use client";

import { useRegisterServiceWorker } from "@/hooks/useRegisterServiceWorker";
import { ChildrenProps } from "@/types/ChildrenProps";
import React from "react";
import { Toaster } from "react-hot-toast";
import table from "../../public/Table.svg";
import { InfoIcon } from "./InfoIcon";
import { RegisterEnokiWallets } from "@/contexts/RegisterEnokiWallets";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";

// Create QueryClient instance outside component to prevent recreation on every render
const queryClient = new QueryClient()

const { networkConfig } = createNetworkConfig({
  [process.env.NEXT_PUBLIC_SUI_NETWORK_NAME!]: {
    url: process.env.NEXT_PUBLIC_SUI_NETWORK!,
  },
});

export const ProvidersAndLayout = ({ children }: ChildrenProps) => {
  // const _ = useRegisterServiceWorker();
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={process.env.NEXT_PUBLIC_SUI_NETWORK_NAME!}
      >
        <RegisterEnokiWallets />
        <WalletProvider autoConnect slushWallet={{ name: "Solitaire PoC" }}>
          <main
            className={`min-h-screen w-screen`}
            style={{
              backgroundImage: `url(${table.src})`, // Set the table image as background
              backgroundSize: "cover",
              backgroundPosition: "bottom",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute top-0 w-full flex justify-evenly items-center bg-white py-3 px-5">
              <span className="text-opacity-90 text-[14px] text-[#4F4F4F]">
                [Mysten Solitaire] is provided for testnet purposes only and
                does not involve real money or the opportunity to win real
                money.
              </span>
            </div>
            {children}
            <InfoIcon />
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 5000,
              }}
            />
          </main>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};
