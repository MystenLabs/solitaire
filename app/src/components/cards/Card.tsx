import React, {ReactNode} from 'react';
import { cardIdToSvg } from "@/helpers/card_mappings";
import Image from "next/image";
import {useDraggable, useDroppable} from '@dnd-kit/core';
import {useId} from "react";

export const Card = ({ id, children, marginTop }: { id: number, children?: ReactNode, marginTop?: any }) => {
    let idOfHiddenCard = useId();
    const isHiddenCard = id == -1;
    let cardId = !isHiddenCard ? id : idOfHiddenCard;

    const {attributes, listeners, setNodeRef: setDraggableNodeRef, transform} = useDraggable({
        id: cardId,
        disabled: isHiddenCard,
    });


    const {isOver, setNodeRef: setDroppableNodeRef} = useDroppable({
        id: cardId,
        disabled: isHiddenCard,
    });


    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        height: "166px",
        minWidth: "120px",
        marginTop: marginTop,
    };

    const setNodeRef = (node: any) => {
        setDraggableNodeRef(node);
        setDroppableNodeRef(node);
    };

    return (
        <div className={`card`} style={style} ref={setNodeRef} {...listeners} {...attributes}>
            <Image src={cardIdToSvg(id)}
                  alt={id != -1 ? `Card ${id}` : `Hidden Card: ${idOfHiddenCard}`}/>
            {children}
        </div>
    )
}
