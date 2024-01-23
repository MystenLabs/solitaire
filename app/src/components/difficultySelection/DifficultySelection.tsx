"use client";
import React from "react";
import {ModeVisual} from "@/components/difficultySelection/difficultyModes/modeVisual";
import easy_mode_visual from "../../../public/assets/difficultyModesVisuals/easy_mode_visual.svg";
import normal_mode_visual from "../../../public/assets/difficultyModesVisuals/normal_mode_visual.svg";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { MoveCallsExecutorService } from "@/helpers/moveCallsExecutorService";

export const DifficultySelection = async () => {
    // TODO: Where should the executor reside? How will the game object be used?
    let executor = await MoveCallsExecutorService.initialize(
        process.env.SUI_NETWORK!,
    );
    return (
        <div className="outside-container px-10 bg-white rounded-3xl backdrop-blur-2xl inline-flex flex-col justify-center items-center">
            <p className={"title text-black pt-14 text-center text-2xl font-bold font-inter mb-10"}>
                Choose Your Difficulty
            </p>
            <div className={"modes-container grid grid-cols-2 pb-14 gap-5"}>
                <div onClick={
                    async () => {
                        let game = await executor.executeInitEasyGame(
                            // TODO: get the signed-in user's ed25519 keypair
                        );
                        // TODO: redirect to game board + start timer
                    }
                }>
                <ModeVisual level={"Easy"}
                            description={"Start with all aces placed"}
                            mode={easy_mode_visual}/>
                </div>
                <div onClick={
                    async () => {
                        let game = await executor.executeInitNormalGame(
                            // TODO: get the signed-in user's ed25519 keypair
                        );
                        // TODO: redirect to game board + start timer
                    }
                }>
                <ModeVisual level={"Normal"}
                            description={"Start with aces in deck"}
                            mode={normal_mode_visual}/>
                </div>
            </div>
        </div>
    )
}