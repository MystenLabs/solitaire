import Image from "next/image";
import React from "react";
import './styles.css'
import {StaticImport} from "next/dist/shared/lib/get-img-props";

interface ModeModalProps {
    level: string;
    description: string;
    mode: string | StaticImport;
}
export const ModeVisual = ({ level, description, mode }: ModeModalProps ) => {
    return (
        <div className={'outer'}>
            <div className={"mode-visual"}>
                <Image src={mode}
                       alt={"Mode visual"}
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
