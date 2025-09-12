module solitaire::solitaire;

use std::string::String;
use sui::clock::Clock;
use sui::event;
use sui::random::Random;

// =================== Error Codes ===================
const ENoMoreHiddenCards: u64 = 0;
const ENoAvailableDeckCard: u64 = 1;
const ENotKingCard: u64 = 2;
const EInvalidPlacement: u64 = 3;
const ECannotPlaceOnAce: u64 = 4;
const ENotAceCard: u64 = 5;
const ECannotPlaceOnKing: u64 = 6;
const EColumnIsEmpty: u64 = 7;
const ECardNotInColumn: u64 = 8;
const EInvalidColumnIndex: u64 = 9;
const EInvalidPileIndex: u64 = 10;
const EGameNotFinished: u64 = 11;
const EGameHasFinished: u64 = 12;
const EInvalidTurnDeckCard: u64 = 13;
const EUnauthorizedPlayer: u64 = 15;

// =================== Constants ===================
const CARD_COUNT: u64 = 52;
const PILE_COUNT: u64 = 4;
const COLUMN_COUNT: u64 = 7;
const CLUBS_INDEX: u64 = 0;
const SPADES_INDEX: u64 = 13;
const HEARTS_INDEX: u64 = 26;
const DIAMONDS_INDEX: u64 = 39;

// =================== Structs ===================

public struct Game has key {
    id: UID,
    deck: Deck,
    piles: vector<Pile>,
    columns: vector<Column>,
    // This is the stack with all the cards that are not revealed yet
    available_cards: vector<u64>,
    player: address,
    start_time: u64,
    player_moves: u64,
    difficulty: String,
}

/// This is the player Deck containing the cards that are not yet in the game.
/// All 24 cards in the Deck are initially hidden.
public struct Deck has store {
    hidden_cards: u64,
    cards: vector<u64>,
}

/// This is a Pile of cards that should be ordered from Ace to King of the same suit.
public struct Pile has store {
    cards: vector<u64>,
}

/// This is a Column of cards. Initially the game starts with 7 Columns of cards
/// and only the first card of each Column is visible.
public struct Column has store {
    hidden_cards: u64,
    cards: vector<u64>,
}

// =================== Events ===================

/// This event is emitted when a new card is revealed from the deck or column.
public struct CardRevealed has copy, drop {
    card: u64,
}

// =================== Public Functions ===================

entry fun init_normal_game(clock: &Clock, random: &Random, ctx: &mut TxContext) {
    // Initialize the stack with all the available cards.
    let mut available_cards = vector::tabulate!(CARD_COUNT, |i| i);

    // Initialize the Deck with 24 hidden cards and an empty vector of cards.
    let deck = Deck {
        hidden_cards: 24,
        cards: vector[],
    };

    // Initialize the Piles with an empty vector of cards.
    let mut piles = vector[Pile { cards: vector[] }];
    piles.push_back(Pile { cards: vector[] });
    piles.push_back(Pile { cards: vector[] });
    piles.push_back(Pile { cards: vector[] });

    let columns = set_up_columns(&mut available_cards, random, ctx);

    let game = Game {
        id: object::new(ctx),
        deck,
        piles,
        columns,
        available_cards,
        player: ctx.sender(),
        player_moves: 0,
        start_time: clock.timestamp_ms(),
        difficulty: b"NORMAL".to_string(),
    };

    transfer::transfer(game, ctx.sender());
}

/// An easy game has all the Aces placed on the Piles by default.
entry fun init_easy_game(clock: &Clock, random: &Random, ctx: &mut TxContext) {
    let mut available_cards = vector::tabulate!(CARD_COUNT, |i| i);

    let deck = Deck {
        hidden_cards: 20,
        cards: vector[],
    };

    let piles = vector[
        Pile { cards: vector[available_cards.remove(CLUBS_INDEX)] },
        Pile { cards: vector[available_cards.remove(SPADES_INDEX-1)] },
        Pile { cards: vector[available_cards.remove(HEARTS_INDEX-2)] },
        Pile { cards: vector[available_cards.remove(DIAMONDS_INDEX-3)] },
    ];
    let columns = set_up_columns(&mut available_cards, random, ctx);

    let game = Game {
        id: object::new(ctx),
        deck,
        piles,
        columns,
        available_cards,
        player: ctx.sender(),
        player_moves: 0,
        start_time: clock.timestamp_ms(),
        difficulty: b"EASY".to_string(),
    };

    transfer::transfer(game, ctx.sender());
}

entry fun from_deck_to_column(game: &mut Game, column_index: u64, ctx: &TxContext) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    assert!(column_index < COLUMN_COUNT, EInvalidColumnIndex);
    assert!(game.deck.cards.length() > 0, ENoAvailableDeckCard);
    let column = game.columns.borrow_mut(column_index);
    let deck_card = game.deck.cards.pop_back();
    // if the column is empty, the card must be a king
    if (column.cards.is_empty()) {
        assert!(deck_card % 13 == 12, ENotKingCard);
        column.cards.push_back(deck_card);
    } else {
        // Get the card at the top of the column
        let last_card_index = column.cards.length() - 1;
        let column_card = column.cards.borrow(last_card_index);
        // edge case where the column card is an ace
        assert!(*column_card % 13 != 0, ECannotPlaceOnAce);
        let card_mod = deck_card % 13;
        if (deck_card >= HEARTS_INDEX) {
            // check if card deck card is red
            assert!(
                (*column_card >= SPADES_INDEX && card_mod == *column_card - SPADES_INDEX - 1) || (card_mod == *column_card - CLUBS_INDEX - 1),
                EInvalidPlacement,
            );
            column.cards.push_back(deck_card);
        } else {
            // else, if it is black
            assert!(
                (card_mod == *column_card - HEARTS_INDEX - 1) || (*column_card >= DIAMONDS_INDEX && card_mod == *column_card - DIAMONDS_INDEX - 1),
                EInvalidPlacement,
            );
            column.cards.push_back(deck_card);
        };
    };
    game.player_moves = game.player_moves + 1;
}

entry fun from_deck_to_pile(game: &mut Game, pile_index: u64, ctx: &TxContext) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
    assert!(game.deck.cards.length() > 0, ENoAvailableDeckCard);
    let deck_card = game.deck.cards.pop_back();
    let pile = game.piles.borrow_mut(pile_index);
    // if the pile is empty, only Ace is allowed to be placed
    if (pile.cards.is_empty()) {
        assert!(deck_card % 13 == 0, ENotAceCard);
        pile.cards.push_back(deck_card);
    } else {
        let last_card_index = pile.cards.length() - 1;
        let pile_card = pile.cards.borrow(last_card_index);
        // edge case where the pile card is a king
        assert!(*pile_card % 13 != 12, ECannotPlaceOnKing);
        // the card to place must be the next card in the pile and of the same suit
        assert!(deck_card == *pile_card + 1, EInvalidPlacement);
        pile.cards.push_back(deck_card);
    };
    game.player_moves = game.player_moves + 1;
}

entry fun from_column_to_pile(
    game: &mut Game,
    column_index: u64,
    pile_index: u64,
    random: &Random,
    ctx: &mut TxContext,
) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    assert!(column_index < COLUMN_COUNT, EInvalidColumnIndex);
    assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
    let column = game.columns.borrow_mut(column_index);
    assert!(!column.cards.is_empty(), EColumnIsEmpty);
    let pile = game.piles.borrow_mut(pile_index);
    let column_card = column.cards.pop_back();
    if (pile.cards.is_empty()) {
        assert!(column_card % 13 == 0, ENotAceCard);
        pile.cards.push_back(column_card);
        // Check if there are hidden cards in the column and reveal one if needed
        if (column.hidden_cards > 0 && column.cards.is_empty()) {
            column.hidden_cards = column.hidden_cards - 1;
            let card = reveal_card(&mut game.available_cards, random, ctx);
            column.cards.push_back(card);
            event::emit(CardRevealed { card });
        };
    } else {
        let last_card_index = pile.cards.length() - 1;
        let pile_card = pile.cards.borrow(last_card_index);
        assert!(*pile_card % 13 != 12, ECannotPlaceOnKing);
        assert!(column_card == *pile_card + 1, EInvalidPlacement);
        pile.cards.push_back(column_card);
        // Check if there are hidden cards in the column and reveal one if needed
        if (column.hidden_cards > 0 && column.cards.is_empty()) {
            column.hidden_cards = column.hidden_cards - 1;
            let card = reveal_card(&mut game.available_cards, random, ctx);
            column.cards.push_back(card);
            event::emit(CardRevealed { card });
        };
    };
    game.player_moves = game.player_moves + 1;
}

entry fun from_column_to_column(
    game: &mut Game,
    mut src_column_index: u64,
    card: u64,
    dest_column_index: u64,
    random: &Random,
    ctx: &mut TxContext,
) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    assert!(src_column_index < COLUMN_COUNT, EInvalidColumnIndex);
    assert!(dest_column_index < COLUMN_COUNT, EInvalidColumnIndex);
    if (src_column_index == dest_column_index) {
        // If the source and destination columns are the same,
        // we do not need to do anything.
        return
    };
    // One column needs to be removed because it is not allowed to take 2 mutable references to the same vector.
    let mut dest_column = game.columns.remove(dest_column_index);
    // If the destination column is to the left of the source column, we need to decrease the index of the source column.
    if (dest_column_index < src_column_index) {
        src_column_index = src_column_index - 1;
    };
    let src_column = game.columns.borrow_mut(src_column_index);
    let (exist, index) = src_column.cards.index_of(&card);
    assert!(exist, ECardNotInColumn);
    if (dest_column.cards.is_empty()) {
        assert!(card % 13 == 12, ENotKingCard);
        // Because more than one card can be moved at once, we need to iterate over the vector with starting point
        // the index of the card to move.
        while (src_column.cards.length() > index) {
            let card_to_move = src_column.cards.remove(index);
            dest_column.cards.push_back(card_to_move);
        };
        if (src_column.hidden_cards > 0 && src_column.cards.is_empty()) {
            src_column.hidden_cards = src_column.hidden_cards - 1;
            let card = reveal_card(&mut game.available_cards, random, ctx);
            src_column.cards.push_back(card);
            event::emit(CardRevealed { card });
        };
    } else {
        let last_card_index = dest_column.cards.length() - 1;
        let dest_column_card = dest_column.cards.borrow(last_card_index);
        assert!(*dest_column_card % 13 != 0, ECannotPlaceOnAce);
        let card_mod = card % 13;
        if (card >= HEARTS_INDEX) {
            assert!(
                (card_mod == *dest_column_card - CLUBS_INDEX - 1) || (*dest_column_card >= SPADES_INDEX && card_mod == *dest_column_card - SPADES_INDEX - 1),
                EInvalidPlacement,
            );
            while (src_column.cards.length() > index) {
                let card_to_move = src_column.cards.remove(index);
                dest_column.cards.push_back(card_to_move);
            };
            if (src_column.hidden_cards > 0 && src_column.cards.is_empty()) {
                src_column.hidden_cards = src_column.hidden_cards - 1;
                let card = reveal_card(&mut game.available_cards, random, ctx);
                src_column.cards.push_back(card);
                event::emit(CardRevealed { card });
            };
        } else {
            assert!(
                (card_mod == *dest_column_card - HEARTS_INDEX - 1) || (*dest_column_card >= DIAMONDS_INDEX && card_mod == *dest_column_card - DIAMONDS_INDEX - 1),
                EInvalidPlacement,
            );
            while (src_column.cards.length() > index) {
                let card_to_move = src_column.cards.remove(index);
                dest_column.cards.push_back(card_to_move);
            };
            if (src_column.hidden_cards > 0 && src_column.cards.is_empty()) {
                src_column.hidden_cards = src_column.hidden_cards - 1;
                let card = reveal_card(&mut game.available_cards, random, ctx);
                src_column.cards.push_back(card);
                event::emit(CardRevealed { card });
            };
        };
    };
    game.player_moves = game.player_moves + 1;
    game.columns.insert(dest_column, dest_column_index);
}

entry fun from_pile_to_column(
    game: &mut Game,
    pile_index: u64,
    column_index: u64,
    ctx: &TxContext,
) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
    assert!(column_index < COLUMN_COUNT, EInvalidColumnIndex);
    let pile = game.piles.borrow_mut(pile_index);
    let column = game.columns.borrow_mut(column_index);
    let pile_card = pile.cards.pop_back();
    // if the column is empty, the card must be a king
    if (column.cards.is_empty()) {
        assert!(pile_card % 13 == 12, ENotKingCard);
        column.cards.push_back(pile_card);
    } else {
        let last_card_index = column.cards.length() - 1;
        let column_card = column.cards.borrow(last_card_index);
        // edge case where the column card is an ace
        assert!(*column_card % 13 != 0, ECannotPlaceOnAce);
        let pile_card_mod = pile_card % 13;
        if (pile_card >= HEARTS_INDEX) {
            assert!(
                (pile_card_mod == *column_card - CLUBS_INDEX - 1) || (*column_card >= SPADES_INDEX && pile_card_mod  == *column_card - SPADES_INDEX - 1),
                EInvalidPlacement,
            );
            column.cards.push_back(pile_card);
        } else {
            assert!(
                (pile_card_mod == *column_card - HEARTS_INDEX - 1) || (*column_card >= DIAMONDS_INDEX && pile_card_mod == *column_card - DIAMONDS_INDEX - 1),
                EInvalidPlacement,
            );
            column.cards.push_back(pile_card);
        };
    };
    game.player_moves = game.player_moves + 1;
}

/// This function is used to reveal a card from the deck if there are still hidden cards.
entry fun open_deck_card(game: &mut Game, random: &Random, ctx: &mut TxContext) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    assert!(game.deck.hidden_cards > 0, ENoMoreHiddenCards);
    game.deck.hidden_cards = game.deck.hidden_cards - 1;
    let card = reveal_card(&mut game.available_cards, random, ctx);
    game.deck.cards.push_back(card);
    game.player_moves = game.player_moves + 1;
    event::emit(CardRevealed { card });
}

/// This function is used to cycle through the open deck cards and rotate their order, one at a time.
/// The top card is placed at the bottom which makes the next card in the deck `top card`
public fun rotate_open_deck_cards(game: &mut Game, ctx: &mut TxContext) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    assert!(game.deck.hidden_cards == 0, EInvalidTurnDeckCard);
    assert!(game.deck.cards.length() > 0, ENoAvailableDeckCard);
    let card = game.deck.cards.remove(0);
    game.deck.cards.push_back(card);
    game.player_moves = game.player_moves + 1;
}

/// This funtion needs to be called when the player has finished the game.
public fun finish_game(game: Game, _ctx: &mut TxContext) {
    assert!(game.piles.all!(|pile| pile.cards.length() == 13), EGameNotFinished);
    delete_game(game);
}

public fun delete_unfinished_game(game: Game, _ctx: &mut TxContext) {
    // Validate that the game is not finished by checking that at least one pile is incomplete
    assert!(game.piles.any!(|pile| pile.cards.length() < 13), EGameHasFinished);
    delete_game(game);
}

fun delete_game(game: Game) {
    let Game {
        id,
        deck,
        piles,
        columns,
        ..,
    } = game;
    let Deck { .. } = deck;
    piles.destroy!(|pile| { let Pile { .. } = pile; });
    columns.destroy!(|column| { let Column { .. } = column; });
    id.delete();
}

/// Internal function that sets up the 7 columns of cards.
/// Each column has the top card revealed and the a number of hidden cards that is equal to the
/// index of the column, starting from 0.
fun set_up_columns(
    available_cards: &mut vector<u64>,
    random: &Random,
    ctx: &mut TxContext,
): vector<Column> {
    vector::tabulate!(COLUMN_COUNT, |i| {
        let card = reveal_card(available_cards, random, ctx);
        Column {
            hidden_cards: i,
            cards: vector::singleton<u64>(card),
        }
    })
}

fun reveal_card(available_cards: &mut vector<u64>, random: &Random, ctx: &mut TxContext): u64 {
    // Initialize random generator and variables
    let mut random_generator = random.new_generator(ctx);

    let length = available_cards.length();
    let cardToRemove = if (length == 1) 0
    else random_generator.generate_u64_in_range(0, length - 1);

    // A card is removed from the stack of the available cards based on the modulo of the timestamp.
    // Module length will ensure that we cannot get out of bounds.
    available_cards.remove(cardToRemove)
}

#[test_only]
public fun reveal_card_test(
    available_cards: &mut vector<u64>,
    random: &Random,
    ctx: &mut TxContext,
): u64 {
    reveal_card(available_cards, random, ctx)
}

#[test_only]
public fun get_top_card_of_deck(game: &Game): u64 {
    let length = game.deck.cards.length();
    let card = game.deck.cards.borrow(length - 1);
    *card
}

#[test_only]
/// Use this to set a custom deck for testing purposes.
public fun cheat_open_card_to_deck(game: &mut Game, card: u64) {
    game.deck.cards.push_back(card);
    let (_, index) = game.available_cards.index_of(&card);
    game.available_cards.remove(index);
}

#[test_only]
public fun remove_all_from_deck(game: &mut Game) {
    game.deck.cards.length().do!(|_| {
        game.deck.cards.pop_back();
    });
}

#[test_only]
// Use this when you want a test to interact with an empty column.
public fun remove_all_from_column(game: &mut Game, column_index: u64) {
    let column = game.columns.borrow_mut(column_index);
    column.cards.length().do!(|_| {
        column.cards.pop_back();
    });
}

#[test_only]
public fun get_num_cards_in_column(game: &Game, column_index: u64): u64 {
    let column = game.columns.borrow(column_index);
    column.cards.length()
}

#[test_only]
public fun cheat_place_card_to_column(game: &mut Game, card: u64, column_index: u64) {
    let column = game.columns.borrow_mut(column_index);
    column.cards.push_back(card);
    let (_, index) = game.available_cards.index_of(&card);
    game.available_cards.remove(index);
}

#[test_only]
public fun cheat_place_card_to_pile(game: &mut Game, card: u64, pile_index: u64) {
    let pile = game.piles.borrow_mut(pile_index);
    pile.cards.push_back(card);
    let (_, index) = game.available_cards.index_of(&card);
    game.available_cards.remove(index);
}

#[test_only]
public fun cheat_fill_all_piles(game: &mut Game) {
    let indexes = vector<u64>[CLUBS_INDEX, SPADES_INDEX, HEARTS_INDEX, DIAMONDS_INDEX];
    indexes.length().do!(|i| {
        let pile = game.piles.borrow_mut(i);
        let card_index = indexes[i];
        while (pile.cards.length() < 13) {
            let card: u64 = card_index + pile.cards.length();
            pile.cards.push_back(card);
        };
    });
}

// We consider the following mapping between Move Contract and Application:
//
// index= 0,  suit: "Clubs", name-on-card: "A",
// index= 1,  suit: "Clubs", name-on-card: "2",
// index= 2,  suit: "Clubs", name-on-card: "3",
// index= 3,  suit: "Clubs", name-on-card: "4",
// index= 4,  suit: "Clubs", name-on-card: "5",
// index= 5,  suit: "Clubs", name-on-card: "6",
// index= 6,  suit: "Clubs", name-on-card: "7",
// index= 7,  suit: "Clubs", name-on-card: "8",
// index= 8,  suit: "Clubs", name-on-card: "9",
// index= 9,  suit: "Clubs", name-on-card: "10",
// index= 10, suit: "Clubs", name-on-card: "J",
// index= 11, suit: "Clubs", name-on-card: "Q",
// index= 12, suit: "Clubs", name-on-card: "K",
//
// index= 13, suit: "Spades", name-on-card: "A",
// index= 14, suit: "Spades", name-on-card: "2",
// index= 15, suit: "Spades", name-on-card: "3",
// index= 16, suit: "Spades", name-on-card: "4",
// index= 17, suit: "Spades", name-on-card: "5",
// index= 18, suit: "Spades", name-on-card: "6",
// index= 19, suit: "Spades", name-on-card: "7",
// index= 20, suit: "Spades", name-on-card: "8",
// index= 21, suit: "Spades", name-on-card: "9",
// index= 22, suit: "Spades", name-on-card: "10",
// index= 23, suit: "Spades", name-on-card: "J",
// index= 24, suit: "Spades", name-on-card: "Q",
// index= 25, suit: "Spades", name-on-card: "K",
//
// index= 26, suit: "Hearts", name-on-card:"A",
// index= 27, suit: "Hearts", name-on-card:"2",
// index= 28, suit: "Hearts", name-on-card:"3",
// index= 29, suit: "Hearts", name-on-card:"4",
// index= 30, suit: "Hearts", name-on-card:"5",
// index= 31, suit: "Hearts", name-on-card:"6",
// index= 32, suit: "Hearts", name-on-card:"7",
// index= 33, suit: "Hearts", name-on-card:"8",
// index= 34, suit: "Hearts", name-on-card:"9",
// index= 35, suit: "Hearts", name-on-card:"10",
// index= 36, suit: "Hearts", name-on-card:"J",
// index= 37, suit: "Hearts", name-on-card:"Q",
// index= 38, suit: "Hearts", name-on-card:"K",
//
// index= 39, suit: "Diamonds", name-on-card: "A",
// index= 40, suit: "Diamonds", name-on-card: "2",
// index= 41, suit: "Diamonds", name-on-card: "3",
// index= 42, suit: "Diamonds", name-on-card: "4",
// index= 43, suit: "Diamonds", name-on-card: "5",
// index= 44, suit: "Diamonds", name-on-card: "6",
// index= 45, suit: "Diamonds", name-on-card: "7",
// index= 46, suit: "Diamonds", name-on-card: "8",
// index= 47, suit: "Diamonds", name-on-card: "9",
// index= 48, suit: "Diamonds", name-on-card: "10",
// index= 49, suit: "Diamonds", name-on-card: "J",
// index= 50, suit: "Diamonds", name-on-card: "Q",
// index= 51, suit: "Diamonds", name-on-card: "K",
