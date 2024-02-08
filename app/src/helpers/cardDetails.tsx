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

    get suit(): 'clubs' | 'spades' | 'hearts' | 'diamonds' {
        const idNumber = Number(this.id);
        if (idNumber >= 0 && idNumber < 13) {
            return 'clubs';
        } else if (idNumber >= 13 && idNumber < 26) {
            return 'spades';
        } else if (idNumber >= 26 && idNumber < 39) {
            return 'hearts';
        } else if (idNumber >= 39 && idNumber < 52) {
            return 'diamonds';
        } else {
            throw new Error(`Invalid card id: ${this.id}. Card id should be between 0 and 51`);
        }
    }
}