import { Transaction } from "@mysten/sui/transactions";

const CLOCK = "0x0000000000000000000000000000000000000000000000000000000000000006";

export function initNormalGame() {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::init_normal_game`,
        arguments: [
            tx.object(CLOCK)
        ],
    });
    return tx;
}

export function initEasyGame() {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::init_easy_game`,
        arguments: [
            tx.object(CLOCK)
        ],
    });
    return tx;
}

export function fromDeckToColumn(game: string, columnIndex: number) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::from_deck_to_column`,
        arguments: [
            tx.object(game),
            tx.pure.u64(columnIndex)
        ],
    });
    return tx;
}

export function fromDeckToPile(game: string, pileIndex: number) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::from_deck_to_pile`,
        arguments: [
            tx.object(game),
            tx.pure.u64(pileIndex)
        ],
    });
    return tx;
}

export function fromColumnToPile(game: string, columnIndex: number, pileIndex: number ) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::from_column_to_pile`,
        arguments: [
            tx.object(game),
            tx.pure.u64(columnIndex),
            tx.pure.u64(pileIndex),
            tx.object(CLOCK)
        ],
    });
    return tx;
}

export function fromColumnToColumn(game: string, fromColumnIndex: number, card: number, toColumnIndex: number ) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::from_column_to_column`,
        arguments: [
            tx.object(game),
            tx.pure.u64(fromColumnIndex),
            tx.pure.u64(card),
            tx.pure.u64(toColumnIndex),
            tx.object(CLOCK)
        ],
    });
    return tx;
}

export function fromPileToColumn(game: string, pileIndex: number, columnIndex: number) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::from_pile_to_column`,
        arguments: [
            tx.object(game),
            tx.pure.u64(pileIndex),
            tx.pure.u64(columnIndex)
        ],
    });
    return tx;
}

export function openDeckCard(game: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::open_deck_card`,
        arguments: [
            tx.object(game),
            tx.object(CLOCK)
        ],
    });
    return tx;
}

export function rotateOpenDeckCards(game: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::rotate_open_deck_cards`,
        arguments: [
            tx.object(game)
        ],
    });
    return tx;
}

export function finishGame(game: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::finish_game`,
        arguments: [
            tx.object(game),
            tx.object(CLOCK)
        ],
    });
    return tx;
}

export function deleteUnfinishedGame(game: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::delete_unfinished_game`,
        arguments: [
            tx.object(game)
        ],
    });
    return tx;
}