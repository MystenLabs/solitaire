// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import React, {ReactNode, useContext} from 'react';
import { cardIdToSvg } from "@/helpers/cardMappings";
import Image from "next/image";
import {useDraggable, useDroppable} from '@dnd-kit/core';
import {useId} from "react";
import { LoadingContext } from '@/contexts/LoadingProvider';

export const Card = ({ id, children, marginTop, draggable = true }: { id: number, children?: ReactNode, marginTop?: any, draggable?: boolean }) => {
    const { isMoveLoading } = useContext(LoadingContext);
    let idOfHiddenCard = useId();
    const isHiddenCard = id == -1;
    let cardId = !isHiddenCard ? String(id) : idOfHiddenCard;

    const {attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging} = useDraggable({
        id: cardId,
        disabled: isHiddenCard || !draggable || isMoveLoading,
    });

    const {setNodeRef: setDroppableNodeRef} = useDroppable({
        id: cardId,
        disabled: isHiddenCard,
    });

    const style = {
        transform: isDragging ? `translate3d(${transform?.x}px, ${transform?.y}px, 0) rotate(10deg)` : 'none',
        marginTop: marginTop,
        cursor: (isMoveLoading ? 'wait' : (id === -1 ? 'default' : (isDragging ? 'grabbing' : 'grab'))),
    };

    const setNodeRef = (node: any) => {
        setDraggableNodeRef(node);
        setDroppableNodeRef(node);
    };

    return (
        <div className={`card h-[110px] md:h-[166px] min-w[80px] md:min-h-[120px]`} style={style} ref={setNodeRef} {...listeners} {...attributes}>
            <Image src={cardIdToSvg(id)}
                   alt={id != -1 ? `Card ${id}` : `Hidden Card: ${idOfHiddenCard}`}
                   className="w-full h-full object-contain"/>
            {children}
        </div>
    )
}