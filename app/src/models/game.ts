// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Column } from './column';
import { Deck } from './deck';
import { Pile } from './pile';

interface GameObjectResponse {
    object?: {
        objectId?: string;
        json?: Record<string, any> | null;
    };
}

export class Game {
    id: string;
    columns: Column[];
    deck: Deck;
    piles: Pile[];

    constructor(gameContentsResp: GameObjectResponse) {
        const object = gameContentsResp.object;
        if (!object?.json) {
            throw new Error("Missing game object json content");
        }
        const fields = object.json.fields ? object.json.fields : object.json;
        this.id = object.objectId ?? fields.id?.id;
        this.columns = fields.columns.map(
            (column: any): Column => {
                const columnFields = column.fields ? column.fields : column;
                return {
                    cards: columnFields.cards,
                    hidden_cards: columnFields.hidden_cards
                };
            }
        );

        const deckFields = fields.deck.fields ? fields.deck.fields : fields.deck;
        const deckCards: String[] = deckFields.cards;
        const deckHiddenCards: number = deckFields.hidden_cards
        this.deck = {
            cards: deckCards,
            open_cards: 0,
            hidden_cards: deckHiddenCards,
        };
        this.piles = fields.piles.map(
            (pile: any): Pile => {
                const pileFields = pile.fields ? pile.fields : pile;
                return {
                    cards: pileFields.cards
                }
            }
        );
    }

    get elements(): any {
        return {
            id: this.id,
            columns: this.columns,
            deck: this.deck,
            piles: this.piles
        }
    }
}
