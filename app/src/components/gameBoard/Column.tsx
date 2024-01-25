"use client";

import { Card } from "../cards/Card";
import cardBack from "../../../../app/public/assets/cards/card_back.svg";
import Image from "next/image";

interface Props {
  column: {
    hiddenCards: number;
    cards: number[];
  };
}

export default function Column({ column }: Props) {
  return (
    <div className="h-[166px] w-[120px] rounded-lg border border-black bg-black bg-opacity-20 relative">
      {Array.from({ length: column.hiddenCards }).map((_, index) => (
        <div key={index} className="absolute" style={{ top: index * 10 }}>
          <Image
            src={cardBack}
            alt={"Card Back"}
            className="min-w-[120px] h-[166px]"
          />
        </div>
      ))}
      {column.cards.map((card, index) => (
        <div
          key={index + column.hiddenCards}
          className="absolute"
          style={{ top: column.hiddenCards * 10 + index * 22 }}
        >
          <Card id={card} />
        </div>
      ))}
    </div>
  );
}
