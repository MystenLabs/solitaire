// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { createDAppKit } from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";

const network = process.env.NEXT_PUBLIC_SUI_NETWORK_NAME ?? "testnet";
const baseUrl = process.env.NEXT_PUBLIC_SUI_NETWORK!;

export const dAppKit = createDAppKit({
  networks: [network],
  defaultNetwork: network,
  createClient: (currentNetwork) =>
    new SuiGrpcClient({
      network: currentNetwork,
      baseUrl,
    }),
});

declare module "@mysten/dapp-kit-react" {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}
