"use client";

import {Card} from "../cards/Card";
import {Pile} from "../../models/pile";


export default function Pile({pile}: { pile: Pile }) {
    const reverseOrder = pile.cards.slice().reverse();
    return (
        <div className={'pile-placeholder h-[166px] w-[120px] rounded-lg border border-black bg-black bg-opacity-20 flex'}>
            {reverseOrder.reduce(
                (accumulator, id, currentIndex) => {
                    return (
                        <div
                            // className={currentIndex < pile.cards.length - 1 ? '-mt-40' : ''}
                            style={currentIndex < pile.cards.length - 1 ? {marginTop: '-139%'} : {} }
                        >
                            <Card id={id !== undefined && id !== null ? Number(id) : -1}>
                                {accumulator}
                            </Card>
                        </div>
                    )
                }, <></>
            )}
        </div>
    );
}

