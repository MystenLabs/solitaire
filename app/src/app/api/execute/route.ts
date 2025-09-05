import { NextRequest, NextResponse } from "next/server";
import { enokiClient } from "../EnokiClient";
import { getKeypair } from "../helpers/getKeyPair";
import { fromBase64 } from "@mysten/sui/utils";
import serverConfig from "@/config/serverConfig";

export async function POST(req: NextRequest) {
  try {
    const { digest, sponsoredBytes } = await req.json();

    const signer = getKeypair(serverConfig.ADMIN_SECRET_KEY!);
    const { signature } = await signer.signTransaction(fromBase64(sponsoredBytes));

    const executionResult = await enokiClient.executeSponsoredTransaction({
      digest,
      signature,
    });

    return NextResponse.json({
      digest: executionResult.digest,
    });
  } catch (error) {
    console.error("Execution failed:", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}