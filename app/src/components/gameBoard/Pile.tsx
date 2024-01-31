"use client";

import { Card } from "../cards/Card";
import { Pile } from "../../models/pile";


export default function Pile({ pile }: { pile: Pile }) {
  return (
    <div className="h-[166px] w-[120px] rounded-lg border border-black bg-black bg-opacity-20 relative">
      {pile.cards.map((card: any, index: any) => (
        <div className="absolute" key={index} style={{ top: 0 }}>
          <Card id={Number(card)} />
        </div>
      ))}
    </div>
  );
}

