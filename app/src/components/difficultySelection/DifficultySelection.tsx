import React from "react";
import './styles.css'
import {ModeVisual} from "@/components/difficultySelection/difficultyModes/modeVisual";
import easy_mode_visual from "../../../public/assets/difficultyModesVisuals/easy_mode_visual.svg";
import normal_mode_visual from "../../../public/assets/difficultyModesVisuals/normal_mode_visual.svg";


export const DifficultySelection = () => {
    return (
        <div className={"outside-container"}>
            <p className={"title"}>
                Choose Your Difficulty
            </p>
            <div className={"modes-container"}>
                <ModeVisual level={"Easy"}
                            description={"Start with all aces placed"}
                            mode={easy_mode_visual}/>
                <ModeVisual level={"Normal"}
                            description={"Start with aces in deck"}
                            mode={normal_mode_visual}/>
            </div>
        </div>
    )
}