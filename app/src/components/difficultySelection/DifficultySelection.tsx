import React from "react";
import './styles.css'
import { Card } from "../cards/Card";
import {EasyMode} from "@/components/difficultySelection/difficultyModes/easyMode";

export const DifficultySelection = () => {
    return (
        <div className={"outside-container"}>
            <p className={"title"}>
                Choose Your Difficulty
            </p>
            <div className={"modes-container"}>
                <EasyMode />
                <EasyMode />
            </div>
        </div>
    )
}