"use client";

import { Card } from "../cards/Card";
import { Column } from "@/models/column";
import { ReactNode } from "react";

export default function Column({ column, index }: { column: Column, index: number}) {
    // Create an array containing all the cards in the column, both hidden and open cards.
    // `Undefined` represent hidden cards.
    const allCards: (ReactNode | undefined)[] = Array.from(
        {length: column.hidden_cards}
    );
    allCards.push(...column.cards);

    // Generate stack the of cards:
    return (
        <div>
            {allCards.reduceRight(
                (accumulator, id) => {
                    return (
                        <Card id={id !== undefined && id !== null ? Number(id) : -1} marginTop={'-110%'}>
                            {accumulator}
                        </Card>
                    )
                }, <></>
            )}
        </div>
    )
}