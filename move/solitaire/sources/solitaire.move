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
const EUnauthorizedPlayer: u64 = 14;

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
    has_revealed_all_cards: bool,
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
        has_revealed_all_cards: false,
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
        has_revealed_all_cards: false,
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

    if (column.cards.is_empty()) {
        // Only Kings can be placed on empty columns
        assert!(is_king(deck_card), ENotKingCard);
        column.cards.push_back(deck_card);
    } else {
        // Get the top card of the column
        let column_top = *column.cards.borrow(column.cards.length() - 1);
        assert!(!is_ace(column_top), ECannotPlaceOnAce);
        assert!(can_place_on_column(deck_card, column_top), EInvalidPlacement);
        column.cards.push_back(deck_card);
    };
    game.player_moves = game.player_moves + 1;
}

entry fun from_deck_to_pile(game: &mut Game, pile_index: u64, ctx: &TxContext) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
    assert!(game.deck.cards.length() > 0, ENoAvailableDeckCard);
    let deck_card = game.deck.cards.pop_back();
    let pile = game.piles.borrow_mut(pile_index);

    if (pile.cards.is_empty()) {
        assert!(is_ace(deck_card), ENotAceCard);
        pile.cards.push_back(deck_card);
    } else {
        let pile_top = *pile.cards.borrow(pile.cards.length() - 1);
        assert!(!is_king(pile_top), ECannotPlaceOnKing);
        assert!(can_place_on_pile(deck_card, &pile.cards), EInvalidPlacement);
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

    // Check if card can be placed on pile
    if (pile.cards.is_empty()) {
        assert!(is_ace(column_card), ENotAceCard);
    } else {
        let pile_top = *pile.cards.borrow(pile.cards.length() - 1);
        assert!(!is_king(pile_top), ECannotPlaceOnKing);
        assert!(can_place_on_pile(column_card, &pile.cards), EInvalidPlacement);
    };

    pile.cards.push_back(column_card);

    // Check if there are hidden cards in the column and reveal one if needed
    if (column.hidden_cards > 0 && column.cards.is_empty()) {
        column.hidden_cards = column.hidden_cards - 1;
        let card = reveal_card(&mut game.available_cards, random, ctx);
        column.cards.push_back(card);
        event::emit(CardRevealed { card });
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
    // Check placement validity
    if (dest_column.cards.is_empty()) {
        assert!(is_king(card), ENotKingCard);
    } else {
        let dest_top = *dest_column.cards.borrow(dest_column.cards.length() - 1);
        assert!(!is_ace(dest_top), ECannotPlaceOnAce);
        assert!(can_place_on_column(card, dest_top), EInvalidPlacement);
    };

    // Move all cards from the specified index to the destination
    while (src_column.cards.length() > index) {
        let card_to_move = src_column.cards.remove(index);
        dest_column.cards.push_back(card_to_move);
    };

    // Reveal hidden card if source column is now empty
    if (src_column.hidden_cards > 0 && src_column.cards.is_empty()) {
        src_column.hidden_cards = src_column.hidden_cards - 1;
        let card = reveal_card(&mut game.available_cards, random, ctx);
        src_column.cards.push_back(card);
        event::emit(CardRevealed { card });
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

    if (column.cards.is_empty()) {
        assert!(is_king(pile_card), ENotKingCard);
        column.cards.push_back(pile_card);
    } else {
        let column_top = *column.cards.borrow(column.cards.length() - 1);
        assert!(!is_ace(column_top), ECannotPlaceOnAce);
        assert!(can_place_on_column(pile_card, column_top), EInvalidPlacement);
        column.cards.push_back(pile_card);
    };
    game.player_moves = game.player_moves + 1;
}

/// This function is used to reveal a card from the deck if there are still hidden cards.
entry fun open_deck_card(game: &mut Game, random: &Random, ctx: &mut TxContext) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    assert!(game.deck.hidden_cards > 0, ENoMoreHiddenCards);
    if (game.deck.has_revealed_all_cards) {
        game.player_moves = game.player_moves + 1;
        game.deck.hidden_cards = game.deck.hidden_cards - 1;
        let card = game.deck.cards[0];
        game.deck.cards.remove(0);
        game.deck.cards.push_back(card);
        event::emit(CardRevealed { card });
    } else {
        game.deck.hidden_cards = game.deck.hidden_cards - 1;
        let card = reveal_card(&mut game.available_cards, random, ctx);
        game.deck.cards.push_back(card);
        game.player_moves = game.player_moves + 1;
        event::emit(CardRevealed { card });
    }
}

/// This function is used to cycle through the open deck cards and rotate their order, one at a time.
/// The top card is placed at the bottom which makes the next card in the deck `top card`
/// After going through all cards, this allows cycling through the deck again.
public fun rotate_open_deck_cards(game: &mut Game, ctx: &mut TxContext) {
    assert!(game.player == ctx.sender(), EUnauthorizedPlayer);
    // Allow rotation when hidden_cards == 0 OR when we're already in cycling mode
    assert!(game.deck.hidden_cards == 0 || game.deck.has_revealed_all_cards, EInvalidTurnDeckCard);
    assert!(game.deck.cards.length() > 0, ENoAvailableDeckCard);

    // If this is the first rotation after revealing all cards, set up cycling mode
    game.deck.has_revealed_all_cards = true;
    game.deck.hidden_cards = game.deck.cards.length() - 1;

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

// =================== Helper Functions ===================

/// Get the rank of a card (0 = Ace, 1 = 2, ..., 12 = King)
fun get_rank(card: u64): u64 {
    card % 13
}

/// Check if a card is red (Hearts or Diamonds)
fun is_red_card(card: u64): bool {
    card >= HEARTS_INDEX // >= 26 → Heart / Diamond
}

/// Check if a card is an Ace
fun is_ace(card: u64): bool {
    get_rank(card) == 0
}

/// Check if a card is a King
fun is_king(card: u64): bool {
    get_rank(card) == 12
}

/// Get the suit index of a card (0 = Clubs, 1 = Spades, 2 = Hearts, 3 = Diamonds)
fun get_suit(card: u64): u64 {
    card / 13
}

/// Check if two cards are the same suit
fun same_suit(card1: u64, card2: u64): bool {
    get_suit(card1) == get_suit(card2)
}

/// Check if a card can be placed on another card in a column
/// Rules: different color, one rank lower, cannot place on Ace
fun can_place_on_column(moving_card: u64, target_card: u64): bool {
    if (is_ace(target_card)) {
        false // Cannot place anything on an Ace
    } else {
        is_red_card(moving_card) != is_red_card(target_card) &&
        get_rank(moving_card) == get_rank(target_card) - 1
    }
}

/// Check if a card can be placed on a pile
/// Rules: same suit, one rank higher, or Ace on empty pile
fun can_place_on_pile(moving_card: u64, pile_cards: &vector<u64>): bool {
    if (pile_cards.is_empty()) {
        is_ace(moving_card)
    } else {
        let pile_top = *pile_cards.borrow(pile_cards.length() - 1);
        same_suit(moving_card, pile_top) && 
        get_rank(moving_card) == get_rank(pile_top) + 1
    }
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
public fun get_deck_cards_length(game: &Game): u64 {
    game.deck.cards.length()
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
