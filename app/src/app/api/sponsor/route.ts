// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { NextRequest, NextResponse } from "next/server";
import { enokiClient } from "../EnokiClient";
import { getSolitaireMoveCallTargets } from "@/constants/solitaireMoveCalls";

export async function POST(req: NextRequest) {
  try {
    const { transactionKindBytes, sender } = await req.json();
    if (!sender || sender === "0x0" || /^0x0+$/.test(sender)) {
      return NextResponse.json(
        { error: "Invalid sender address" },
        { status: 400 }
      );
    }
    const packageAddress = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;

    if (!packageAddress) {
      throw new Error("Missing NEXT_PUBLIC_PACKAGE_ADDRESS");
    }

    const allowedMoveCallTargets = getSolitaireMoveCallTargets(packageAddress);

    const sponsored = await enokiClient.createSponsoredTransaction({
      network: process.env.NEXT_PUBLIC_SUI_NETWORK_NAME as
        | "mainnet"
        | "testnet"
        | "devnet",
      transactionKindBytes,
      sender: sender,
      allowedAddresses: [sender],
      // Restrict sponsorship only to the Solitaire gameplay Move calls.
      allowedMoveCallTargets,
    } as Parameters<typeof enokiClient.createSponsoredTransaction>[0] & {
      allowedMoveCallTargets?: string[];
    });

    return NextResponse.json({
      bytes: sponsored.bytes,
      digest: sponsored.digest,
    });
  } catch (error) {
    console.error("Sponsorship failed:", error);
    return NextResponse.json({ error: "Sponsorship failed" }, { status: 500 });
  }
}