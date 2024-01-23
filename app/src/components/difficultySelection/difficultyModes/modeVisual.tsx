import Image from "next/image";
import React from "react";
import {StaticImport} from "next/dist/shared/lib/get-img-props";

interface ModeModalProps {
    level: string;
    description: string;
    mode: string | StaticImport;
}
export const ModeVisual = ({ level, description, mode }: ModeModalProps ) => {
    return (
        <div className="rounded-2xl border-2 border-gray-300 bg-white hover:border-black cursor-pointer" >
            <div className="mode-visual m-5 bg-white">
                <Image src={mode}
                       alt={"Mode visual"}
                       style={{
                           display: "block",
                           marginLeft: "auto",
                           marginRight: "auto"
                       }}/>
            </div>
            <p className="mode-title text-black text-center text-xl font-bold mb-2">{level}</p>
            <p className="mode-subtitle text-gray-700 text-center text-lg font-normal mb-4 mx-5">{description}</p>
        </div>
    )
}
