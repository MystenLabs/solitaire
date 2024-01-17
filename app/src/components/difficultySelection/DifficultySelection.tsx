import React from "react";
import './styles.css'
import {EasyModeVisual} from "@/components/difficultySelection/difficultyModes/easyModeVisual";
import {NormalModeVisual} from "@/components/difficultySelection/difficultyModes/normalModeVisual";

export const DifficultySelection = () => {
    return (
        <div className={"outside-container"}>
            <p className={"title"}>
                Choose Your Difficulty
            </p>
            <div className={"modes-container"}>
                <EasyModeVisual level={"Easy"} description={"Start with all aces placed"}/>
                <NormalModeVisual level={"Normal"} description={"Start with aces in deck"}/>
            </div>
        </div>
    )
}