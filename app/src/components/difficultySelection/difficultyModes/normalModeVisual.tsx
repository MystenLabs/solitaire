import Image from "next/image";
import normal_mode_visual from "../../../../public/assets/difficultyModesVisuals/normal_mode_visual.svg";
import React from "react";
import './styles.css'

interface ModeModalProps {
    level: string;
    description: string;
}
export const NormalModeVisual = ({ level, description }: ModeModalProps ) => {
    return (
        <div className={'outer'}>
            <div className={"mode-visual"}>
                <Image src={normal_mode_visual}
                       alt={"Easy mode visual"}
                       style={{
                           display: "block",
                           marginLeft: "auto",
                           marginRight: "auto"
                       }}/>
            </div>
            <p className={'mode-title'}>{level}</p>
            <p className={'mode-subtitle'}>{description}</p>
        </div>
    )
}
