import { NextRequest, NextResponse } from "next/server";
import { deleteUnfinishedGame } from "@/helpers/moveCalls";
import { SuiClient } from "@mysten/sui.js/client";

const suiClient = new SuiClient({url: process.env.SUI_NETWORK!});

export const DELETE = async (request: NextRequest) => {
    if (!request.body) {
        throw new Error("No body provided");
    }
    // Convert the ReadableStream to a string
    const body = await new Response(request.body).json();

    if (!body.keypair) {
        throw new Error("No keypair provided");
    }
    await deleteGameRequest(body.gameId, body.keypair);

    return NextResponse.json(
        {
            status: "DELETED",
        },
        { status: 200 }
    );
};

const deleteGameRequest = async (gameId: string, keypair: any) => {
    const tx = deleteUnfinishedGame(gameId);
    await suiClient
        .signAndExecuteTransactionBlock({
            transactionBlock: tx,
            signer: keypair,
            requestType: "WaitForLocalExecution",
            options: {
                showEffects: true,
                showObjectChanges: true,
            },
        })
        .then((resp) => {
            if (resp.effects?.status.status !== "success") {
                throw new Error("Game deletion failed");
            }
        })
        .catch((err) => {
            console.log(err);
            throw new Error("Game deletion failed");
        });
}