// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import serverConfig from "@/config/serverConfig";
import { EnokiClient } from "@mysten/enoki";

export const enokiClient = new EnokiClient({
  apiKey: serverConfig.ENOKI_SECRET_KEY,
});