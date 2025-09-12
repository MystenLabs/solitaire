/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from './deps/sui/object';
const $moduleName = '@local-pkg/solitaire::solitaire';
export const Deck = new MoveStruct({ name: `${$moduleName}::Deck`, fields: {
        hidden_cards: bcs.u64(),
        cards: bcs.vector(bcs.u64())
    } });
export const Pile = new MoveStruct({ name: `${$moduleName}::Pile`, fields: {
        cards: bcs.vector(bcs.u64())
    } });
export const Column = new MoveStruct({ name: `${$moduleName}::Column`, fields: {
        hidden_cards: bcs.u64(),
        cards: bcs.vector(bcs.u64())
    } });
export const Game = new MoveStruct({ name: `${$moduleName}::Game`, fields: {
        id: object.UID,
        deck: Deck,
        piles: bcs.vector(Pile),
        columns: bcs.vector(Column),
        available_cards: bcs.vector(bcs.u64()),
        player: bcs.Address,
        start_time: bcs.u64(),
        player_moves: bcs.u64(),
        difficulty: bcs.string()
    } });
export const CardRevealed = new MoveStruct({ name: `${$moduleName}::CardRevealed`, fields: {
        card: bcs.u64()
    } });
export interface InitNormalGameArguments {
}
export interface InitNormalGameOptions {
    package?: string;
    arguments?: InitNormalGameArguments | [
    ];
}
export function initNormalGame(options: InitNormalGameOptions = {}) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    // @ts-ignore
    const parameterNames = [];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'init_normal_game',
        // @ts-ignore
        arguments: normalizeMoveArguments(options.arguments ?? [], argumentsTypes, parameterNames),
    });
}
export interface InitEasyGameArguments {
}
export interface InitEasyGameOptions {
    package?: string;
    arguments?: InitEasyGameArguments | [
    ];
}
/** An easy game has all the Aces placed on the Piles by default. */
export function initEasyGame(options: InitEasyGameOptions = {}) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    // @ts-ignore
    const parameterNames = [];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'init_easy_game',
        // @ts-ignore
        arguments: normalizeMoveArguments(options.arguments ?? [], argumentsTypes, parameterNames),
    });
}
export interface FromDeckToColumnArguments {
    game: RawTransactionArgument<string>;
    columnIndex: RawTransactionArgument<number | bigint>;
}
export interface FromDeckToColumnOptions {
    package?: string;
    arguments: FromDeckToColumnArguments | [
        game: RawTransactionArgument<string>,
        columnIndex: RawTransactionArgument<number | bigint>
    ];
}
export function fromDeckToColumn(options: FromDeckToColumnOptions) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        `${packageAddress}::solitaire::Game`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["game", "columnIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'from_deck_to_column',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FromDeckToPileArguments {
    game: RawTransactionArgument<string>;
    pileIndex: RawTransactionArgument<number | bigint>;
}
export interface FromDeckToPileOptions {
    package?: string;
    arguments: FromDeckToPileArguments | [
        game: RawTransactionArgument<string>,
        pileIndex: RawTransactionArgument<number | bigint>
    ];
}
export function fromDeckToPile(options: FromDeckToPileOptions) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        `${packageAddress}::solitaire::Game`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["game", "pileIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'from_deck_to_pile',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FromColumnToPileArguments {
    game: RawTransactionArgument<string>;
    columnIndex: RawTransactionArgument<number | bigint>;
    pileIndex: RawTransactionArgument<number | bigint>;
}
export interface FromColumnToPileOptions {
    package?: string;
    arguments: FromColumnToPileArguments | [
        game: RawTransactionArgument<string>,
        columnIndex: RawTransactionArgument<number | bigint>,
        pileIndex: RawTransactionArgument<number | bigint>
    ];
}
export function fromColumnToPile(options: FromColumnToPileOptions) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        `${packageAddress}::solitaire::Game`,
        'u64',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["game", "columnIndex", "pileIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'from_column_to_pile',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FromColumnToColumnArguments {
    game: RawTransactionArgument<string>;
    srcColumnIndex: RawTransactionArgument<number | bigint>;
    card: RawTransactionArgument<number | bigint>;
    destColumnIndex: RawTransactionArgument<number | bigint>;
}
export interface FromColumnToColumnOptions {
    package?: string;
    arguments: FromColumnToColumnArguments | [
        game: RawTransactionArgument<string>,
        srcColumnIndex: RawTransactionArgument<number | bigint>,
        card: RawTransactionArgument<number | bigint>,
        destColumnIndex: RawTransactionArgument<number | bigint>
    ];
}
export function fromColumnToColumn(options: FromColumnToColumnOptions) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        `${packageAddress}::solitaire::Game`,
        'u64',
        'u64',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["game", "srcColumnIndex", "card", "destColumnIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'from_column_to_column',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FromPileToColumnArguments {
    game: RawTransactionArgument<string>;
    pileIndex: RawTransactionArgument<number | bigint>;
    columnIndex: RawTransactionArgument<number | bigint>;
}
export interface FromPileToColumnOptions {
    package?: string;
    arguments: FromPileToColumnArguments | [
        game: RawTransactionArgument<string>,
        pileIndex: RawTransactionArgument<number | bigint>,
        columnIndex: RawTransactionArgument<number | bigint>
    ];
}
export function fromPileToColumn(options: FromPileToColumnOptions) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        `${packageAddress}::solitaire::Game`,
        'u64',
        'u64'
    ] satisfies string[];
    const parameterNames = ["game", "pileIndex", "columnIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'from_pile_to_column',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface OpenDeckCardArguments {
    game: RawTransactionArgument<string>;
}
export interface OpenDeckCardOptions {
    package?: string;
    arguments: OpenDeckCardArguments | [
        game: RawTransactionArgument<string>
    ];
}
/**
 * This function is used to reveal a card from the deck if there are still hidden
 * cards.
 */
export function openDeckCard(options: OpenDeckCardOptions) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        `${packageAddress}::solitaire::Game`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'open_deck_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RotateOpenDeckCardsArguments {
    game: RawTransactionArgument<string>;
}
export interface RotateOpenDeckCardsOptions {
    package?: string;
    arguments: RotateOpenDeckCardsArguments | [
        game: RawTransactionArgument<string>
    ];
}
/**
 * This function is used to cycle through the open deck cards and rotate their
 * order, one at a time. The top card is placed at the bottom which makes the next
 * card in the deck `top card`
 */
export function rotateOpenDeckCards(options: RotateOpenDeckCardsOptions) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        `${packageAddress}::solitaire::Game`
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'rotate_open_deck_cards',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FinishGameArguments {
    game: RawTransactionArgument<string>;
}
export interface FinishGameOptions {
    package?: string;
    arguments: FinishGameArguments | [
        game: RawTransactionArgument<string>
    ];
}
/** This funtion needs to be called when the player has finished the game. */
export function finishGame(options: FinishGameOptions) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        `${packageAddress}::solitaire::Game`
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'finish_game',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeleteUnfinishedGameArguments {
    game: RawTransactionArgument<string>;
}
export interface DeleteUnfinishedGameOptions {
    package?: string;
    arguments: DeleteUnfinishedGameArguments | [
        game: RawTransactionArgument<string>
    ];
}
export function deleteUnfinishedGame(options: DeleteUnfinishedGameOptions) {
    const packageAddress = options.package ?? '@local-pkg/solitaire';
    const argumentsTypes = [
        `${packageAddress}::solitaire::Game`
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'solitaire',
        function: 'delete_unfinished_game',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}