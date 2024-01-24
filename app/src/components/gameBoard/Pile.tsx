"use clinet";

import { Card } from "../cards/Card";

interface Props {
  pile: number[];
}

export default function Pile({ pile }: Props) {
  return (
    <div className="h-[166px] w-[120px] rounded-lg border border-black bg-black bg-opacity-20 relative">
      {pile.map((card, index) => (
        <div className="absolute" key={index} style={{ top: 0 }}>
          <Card id={card} />
        </div>
      ))}
    </div>
  );
}
