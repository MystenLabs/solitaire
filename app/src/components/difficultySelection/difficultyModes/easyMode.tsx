import React from "react";
import easy_mode_visual from "../../../../public/assets/difficultyModesVisuals/easy_mode_visual.svg";
import './styles.css'
import Image from "next/image";
export const EasyMode = () => {
    return (
        <div className={'outer'}>
            <div className={"mode-visual"} >
                <Image src={easy_mode_visual}
                       alt={"Easy mode visual"}
                       style={{display: "block",
                           marginLeft: "auto",
                           marginRight: "auto"}}/>
            </div>
            <p className={'mode-title'}>Easy</p>
            <p className={'mode-subtitle'}>Start with aces placed</p>
        </div>
    )
}