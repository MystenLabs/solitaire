"use client";

import { use, useEffect, useState } from "react";
import cardBack from "../../../../app/public/assets/cards/card_back.svg";
import Image from "next/image";
import Pile from "./Pile";
import Column from "./Column";
import { Card } from "../cards/Card";

interface CardObject {
  hiddenCards: number;
  cards: number[];
}

interface Props {
  gameId: string | null;
}

export default function GameBoard({ gameId }: Props) {
  const [deck, setDeck] = useState<CardObject>({ hiddenCards: 10, cards: [12,9,0]});
  const [piles, setPiles] = useState<number[][]>([[14], [25], [33], [41]]);
  const [columns, setColumns] = useState<CardObject[]>([
    { hiddenCards: 1, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 2, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 3, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 4, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 5, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 6, cards: [1, 2, 3, 4, 5, 6, 7] },
    { hiddenCards: 7, cards: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  ]);

  return (
    <div className="px-60 h-full w-full flex flex-col items-center space-y-7 pt-14">
      <ul className="w-full flex justify-between items-center">
        <li key={"cardDeck"}>
          <Image
            src={cardBack}
            alt={"Card Back"}
            className="min-w-[120px] h-[166px]"
          />
        </li>
        <li className="min-w-[120px] h-[166px]" key={"openCard"}>
            <Card id={deck.cards[deck.cards.length - 1]} />
        </li>
        <li className="w-[120px] h-[166px]"></li>
        {piles.map((pile, index) => (
          <li key={index}>
            <Pile pile={pile}/>
          </li>
        ))}
      </ul>
      <ul className="w-full flex justify-between items-center ">
        {columns.map((column, index) => (
          <li key={index}>
            <Column column={column}/>
          </li>
        ))}
      </ul>
    </div>
  );
}
