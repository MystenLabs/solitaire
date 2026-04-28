// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { SuiGrpcClient } from "@mysten/sui/grpc";

export const useSui = () => {
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK_NAME ?? "testnet";
  const FULL_NODE = process.env.NEXT_PUBLIC_SUI_NETWORK!;
  const suiClient = new SuiGrpcClient({ network, baseUrl: FULL_NODE });

  return { suiClient };
};
