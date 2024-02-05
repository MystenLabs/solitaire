type CardColor = 'red' | 'black';
export class CardDetails {
    id: String;
    constructor(id: String) {
        this.id = id;
    }

    /// Returns the rank of the card, 0-12 (Ace to King)
    get rank(): number {
        const idNumber = Number(this.id);
        return idNumber % 13;
    }

    get color(): CardColor {
        const idNumber = Number(this.id);
        if (idNumber >=0 && idNumber < 26) {
            return 'black';
        }
        else if (idNumber >= 26 && idNumber <= 51) {
            return 'red';
        }
        else {
            throw new Error(`Invalid card id: ${this.id}. Card id should be between 0 and 51`);
        }
    }
}