"use client";
import {ModeVisual} from "@/components/difficultySelection/difficultyModes/modeVisual";
import easy_mode_visual from "../../../public/assets/difficultyModesVisuals/easy_mode_visual.svg";
import normal_mode_visual from "../../../public/assets/difficultyModesVisuals/normal_mode_visual.svg";

export const DifficultySelection = (
    { onGameCreation }: { onGameCreation: (mode: 'easy' | 'normal') => void }
) => {
    return (
        <div className="px-10 bg-white rounded-3xl backdrop-blur-2xl flex flex-col justify-center items-center">
            <p className={"title text-black pt-14 text-center text-2xl font-bold font-inter mb-10"}>
                Choose Your Difficulty
            </p>
            <div className={"modes-container grid grid-cols-2 pb-14 gap-5"}>
                <button onClick={
                    async () => {
                        onGameCreation('easy');
                    }
                }>
                <ModeVisual level={"Easy"}
                            description={"Start with all aces placed"}
                            mode={easy_mode_visual}/>
                </button>
                <button onClick={
                    async () => {
                        onGameCreation('normal');
                    }
                }>
                <ModeVisual level={"Normal"}
                            description={"Start with aces in deck"}
                            mode={normal_mode_visual}/>
                </button>
            </div>
        </div>
    )
}

