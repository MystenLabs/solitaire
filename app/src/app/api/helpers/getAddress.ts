// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { getKeypair } from "./getKeyPair";

export const getAddress = (secretKey: string): string => {
  const keypair = getKeypair(secretKey);
  const address = keypair.getPublicKey().toSuiAddress();
  return address;
};
