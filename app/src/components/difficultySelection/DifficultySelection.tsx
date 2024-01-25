"use client";
import {ModeVisual} from "@/components/difficultySelection/difficultyModes/modeVisual";
import easy_mode_visual from "../../../public/assets/difficultyModesVisuals/easy_mode_visual.svg";
import normal_mode_visual from "../../../public/assets/difficultyModesVisuals/normal_mode_visual.svg";
import { MoveCallsExecutorService } from "@/helpers/moveCallsExecutorService";
import { useAuthentication } from "@/contexts/Authentication";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519"
import { fromB64 } from "@mysten/sui.js/utils";
import { Game } from "@/models/game";
import {UserProps} from "@/types/Authentication";

export const DifficultySelection = (
    { onGameCreation }: { onGameCreation: (game: Game) => void }
) => {
    const { user } = useAuthentication();
    return (
        <div className="px-10 bg-white rounded-3xl backdrop-blur-2xl flex flex-col justify-center items-center">
            <p className={"title text-black pt-14 text-center text-2xl font-bold font-inter mb-10"}>
                Choose Your Difficulty
            </p>
            <div className={"modes-container grid grid-cols-2 pb-14 gap-5"}>
                <div onClick={
                    async () => {
                        let game = await createGame(user, 'easy');
                        onGameCreation(game);
                    }
                }>
                <ModeVisual level={"Easy"}
                            description={"Start with all aces placed"}
                            mode={easy_mode_visual}/>
                </div>
                <div onClick={
                    async () => {
                        let game = await createGame(user, 'normal');
                        onGameCreation(game);
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

async function createGame(user: UserProps, mode: 'easy' | 'normal' ): Promise<Game> {
    let executorService = new MoveCallsExecutorService(); // TODO parse from env
    const keypair = user.zkLoginSession?.ephemeralKeyPair;
    let privateKeyArray = Uint8Array.from(Array.from(fromB64(keypair!)));
    const signerKeypair = Ed25519Keypair.fromSecretKey(privateKeyArray)
    let game = undefined;
    if (mode === 'easy') {
        game = await executorService.executeInitEasyGame(signerKeypair);
    } else if (mode === 'normal') {
        game = await executorService.executeInitNormalGame(signerKeypair);
    } else {
        throw new Error('Invalid difficulty mode');
    }
    if (!game) {
        throw new Error('Failed to initialize game');
    }
    return game;
}