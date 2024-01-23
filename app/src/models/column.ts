export class Column {
    cards: String[];
    hidden_cards: number;
    constructor(cards: String[], hidden_cards: number) {
        this.cards = cards;
        this.hidden_cards = hidden_cards;
    }
}