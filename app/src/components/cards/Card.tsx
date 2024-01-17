import React from 'react';
import { cardIdToSvg } from "@/helpers/card_mappings";
import Image from "next/image";


export const Card = ({ id }: { id: number }) => {
    return (
        <div className={`card`}>
           <Image src={cardIdToSvg(id)}
                  alt={"Card"}/>
        </div>
    )
}
