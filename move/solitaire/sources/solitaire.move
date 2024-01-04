module solitaire::solitaire {
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use sui::transfer::{Self};
    use std::vector;
    use std::string::{String, utf8};

// =================== Error Codes ===================
    const EInvalidGamePlayer: u64 = 0;
    const ENoMoreHiddenCards: u64 = 1;
    const ECardNotInDeck: u64 = 2;
    const ENotKingCard: u64 = 3;
    const EInvalidPlacement: u64 = 4;
    const ECannotPlaceOnAce: u64 = 5;
    const ENotAceCard: u64 = 6;
    const ECannotPlaceOnKing: u64 = 7;
    const EColumnIsEmpty: u64 = 8;
    const ECardNotInColumn: u64 = 9;
    const EInvalidColumnIndex: u64 = 10;
    const EInvalidPileIndex: u64 = 11;

// =================== Constants ===================
    const CARD_COUNT: u64 = 52;
    const PILE_COUNT: u64 = 4;
    const COLUMN_COUNT: u64 = 7;
    const CLUBS_INDEX: u64 = 0;
    const SPADES_INDEX: u64 = 13;
    const HEARTS_INDEX: u64 = 26;
    const DIAMONDS_INDEX: u64 = 39;


// =================== Structs ===================

    struct Game has key {
        id: UID,
        deck: Deck,
        piles: vector<Pile>,
        columns: vector<Column>,
        available_cards: vector<u64>,
        player: address,
        start_time: u64,
        difficulty: String,
    }

    /// This is the player Deck containing the cards that are not yet in the game.
    /// All 24 cards in the Deck are initially hidden.
    struct Deck has store {
        hidden_cards: u64,
        cards: vector<u64>
    }

    /// This is a Pile of cards that should be ordered from Ace to King of the same suit.
    struct Pile has store {
        cards: vector<u64>
    }

    /// This is a Column of cards. Initially the game starts with 7 Columns of cards
    /// and only the first card of each Column is visible.
    struct Column has store {
        hidden_cards: u64,
        cards: vector<u64>
    }

    public fun init_normal_game(clock: &Clock, ctx: &mut TxContext) {
        let i: u64 = 0;
        let available_cards = vector::empty<u64>();
        while (i < CARD_COUNT) {
            vector::push_back(&mut available_cards, i);
            i = i + 1;
        };
        
        let deck = Deck {
            hidden_cards: 24,
            cards: vector::empty(),
        };

        let piles = vector::singleton<Pile>(Pile {cards: vector::empty()});
        vector::push_back(&mut piles, Pile {cards: vector::empty()});
        vector::push_back(&mut piles, Pile {cards: vector::empty()});
        vector::push_back(&mut piles, Pile {cards: vector::empty()});

        let columns = set_up_columns(clock, &mut available_cards);

        let game = Game {
            id: object::new(ctx),
            deck,
            piles,
            columns,
            available_cards,
            player: tx_context::sender(ctx),
            start_time: clock::timestamp_ms(clock),
            difficulty: utf8(b"NORMAL"),
        };

        transfer::share_object(game);
    }

    public fun init_easy_game(clock: &Clock, ctx: &mut TxContext) {
        let i: u64 = 0;
        let available_cards = vector::empty<u64>();
        while (i < CARD_COUNT) {
            vector::push_back(&mut available_cards, i);
            i = i + 1;
        };
        
        let deck = Deck {
            hidden_cards: 20,
            cards: vector::empty(),
        };

        let piles = vector::singleton<Pile>(Pile {
            cards: vector::singleton(vector::remove(&mut available_cards, CLUBS_INDEX))});
        vector::push_back(&mut piles, Pile {
            cards: vector::singleton(vector::remove(&mut available_cards, SPADES_INDEX))});
        vector::push_back(&mut piles, Pile {
            cards: vector::singleton(vector::remove(&mut available_cards, HEARTS_INDEX))});
        vector::push_back(&mut piles, Pile {
            cards: vector::singleton(vector::remove(&mut available_cards, DIAMONDS_INDEX))});

        let columns = set_up_columns(clock, &mut available_cards);

        let game = Game {
            id: object::new(ctx),
            deck,
            piles,
            columns,
            available_cards,
            player: tx_context::sender(ctx),
            start_time: clock::timestamp_ms(clock),
            difficulty: utf8(b"EASY"),
        };

        transfer::share_object(game);
    }

    public fun from_deck_to_column(game: &mut Game, card: u64, column_index: u64, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
        assert!(column_index < COLUMN_COUNT, EInvalidColumnIndex);
        let (exist, index) = vector::index_of(&game.deck.cards, &card);
        assert!(exist, ECardNotInDeck);
        let column = vector::borrow_mut(&mut game.columns, column_index);
        // if the column is empty, the card must be a king
        if (vector::is_empty(&column.cards)) {
            assert!(card % 13 == 12, ENotKingCard);
            let card_to_place = vector::remove(&mut game.deck.cards, index);
            vector::push_back(&mut column.cards, card_to_place);
        } else {
            let last_card_index = vector::length(&column.cards) - 1;
            let column_card = vector::borrow(&column.cards, last_card_index);
            // edge case where the column card is an ace
            assert!(*column_card % 13 != 0, ECannotPlaceOnAce);
            let card_mod = card % 13;
            if (card >= HEARTS_INDEX) {
                assert!((card_mod == *column_card - SPADES_INDEX - 1) || (card_mod == *column_card - CLUBS_INDEX - 1), EInvalidPlacement);
                let card_to_place = vector::remove(&mut game.deck.cards, index);
                vector::push_back(&mut column.cards, card_to_place);
            } else {
                assert!((card_mod == *column_card - HEARTS_INDEX - 1) || (card_mod == *column_card - DIAMONDS_INDEX - 1), EInvalidPlacement);
                let card_to_place = vector::remove(&mut game.deck.cards, index);
                vector::push_back(&mut column.cards, card_to_place);
            }
        }
    }

    public fun from_deck_to_pile(game: &mut Game, card: u64, pile_index: u64, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
        assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
        let (exist, index) = vector::index_of(&game.deck.cards, &card);
        assert!(exist, ECardNotInDeck);
        let pile = vector::borrow_mut(&mut game.piles, pile_index);
        // if the pile is empty, only Ace is allowed to be placed
        if (vector::is_empty(&pile.cards)) {
            assert!(card % 13 == 0, ENotAceCard);
            let card_to_place = vector::remove(&mut game.deck.cards, index);
            vector::push_back(&mut pile.cards, card_to_place);
        } else {
            let pile_card = vector::borrow(&pile.cards, 0);
            // edge case where the pile card is a king
            assert!(*pile_card % 13 != 12, ECannotPlaceOnKing);
            assert!(card == *pile_card + 1, EInvalidPlacement);
            let card_to_place = vector::remove(&mut game.deck.cards, index);
            vector::push_back(&mut pile.cards, card_to_place);
        }
    }

    public fun from_column_to_pile(game: &mut Game, column_index: u64, pile_index: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
        assert!(column_index < COLUMN_COUNT, EInvalidColumnIndex);
        assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
        let column = vector::borrow_mut(&mut game.columns, column_index);
        assert!(!vector::is_empty(&column.cards), EColumnIsEmpty);
        let pile = vector::borrow_mut(&mut game.piles, pile_index);
        let column_card = vector::pop_back(&mut column.cards);
        if (vector::is_empty(&pile.cards)) {
            assert!(column_card % 13 == 0, ENotAceCard);
            vector::push_back(&mut pile.cards, column_card);
            if (column.hidden_cards > 0 && vector::is_empty(&column.cards)) {
                column.hidden_cards = column.hidden_cards - 1;
                let card = reveal_card(clock, &mut game.available_cards);
                vector::push_back(&mut column.cards, card);
            }
        } else {
            let last_card_index = vector::length(&pile.cards) - 1;
            let pile_card = vector::borrow(&pile.cards, last_card_index);
            assert!(*pile_card % 13 != 12, ECannotPlaceOnKing);
            assert!(column_card == *pile_card + 1, EInvalidPlacement);
            vector::push_back(&mut pile.cards, column_card);
            if (column.hidden_cards > 0 && vector::is_empty(&column.cards)) {
                column.hidden_cards = column.hidden_cards - 1;
                let card = reveal_card(clock, &mut game.available_cards);
                vector::push_back(&mut column.cards, card);
            }
        }
    }

    public fun from_column_to_column(game: &mut Game, src_column_index: u64, card: u64, dest_column_index: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
        assert!(src_column_index < COLUMN_COUNT, EInvalidColumnIndex);
        assert!(dest_column_index < COLUMN_COUNT, EInvalidColumnIndex);
        // one column needs to be removed because I cannot take 2 mutable references to the same vector
        let dest_column = vector::remove(&mut game.columns, dest_column_index);
        let src_column = vector::borrow_mut(&mut game.columns, src_column_index);
        let (exist, index) = vector::index_of(&game.deck.cards, &card);
        assert!(exist, ECardNotInColumn);
        if (vector::is_empty(&dest_column.cards)) {
            assert!(card % 13 == 12, ENotKingCard);
            while (vector::length(&src_column.cards) >= index) {
                let card_to_move = vector::remove(&mut src_column.cards, index);
                vector::push_back(&mut dest_column.cards, card_to_move);
            };
            if (src_column.hidden_cards > 0 && vector::is_empty(&src_column.cards)) {
                src_column.hidden_cards = src_column.hidden_cards - 1;
                let card = reveal_card(clock, &mut game.available_cards);
                vector::push_back(&mut src_column.cards, card);
            }
        } else {
            let last_card_index = vector::length(&dest_column.cards) - 1;
            let dest_column_card = vector::borrow(&dest_column.cards, last_card_index);
            assert!(*dest_column_card % 13 != 0, ECannotPlaceOnAce);
            let card_mod = card % 13;
            if (card >= HEARTS_INDEX) {
                assert!((card_mod == *dest_column_card - SPADES_INDEX - 1) || (card_mod == *dest_column_card - CLUBS_INDEX - 1), EInvalidPlacement);
                while (vector::length(&src_column.cards) >= index) {
                    let card_to_move = vector::remove(&mut src_column.cards, index);
                    vector::push_back(&mut dest_column.cards, card_to_move);
                };
                if (src_column.hidden_cards > 0 && vector::is_empty(&src_column.cards)) {
                    src_column.hidden_cards = src_column.hidden_cards - 1;
                    let card = reveal_card(clock, &mut game.available_cards);
                    vector::push_back(&mut src_column.cards, card);
                }
            } else {
                assert!((card_mod == *dest_column_card - HEARTS_INDEX - 1) || (card_mod == *dest_column_card - DIAMONDS_INDEX - 1), EInvalidPlacement);
                while (vector::length(&src_column.cards) >= index) {
                    let card_to_move = vector::remove(&mut src_column.cards, index);
                    vector::push_back(&mut dest_column.cards, card_to_move);
                };
                if (src_column.hidden_cards > 0 && vector::is_empty(&src_column.cards)) {
                    src_column.hidden_cards = src_column.hidden_cards - 1;
                    let card = reveal_card(clock, &mut game.available_cards);
                    vector::push_back(&mut src_column.cards, card);
                }
            }
        };
        vector::insert(&mut game.columns, dest_column, dest_column_index);
    }

    public fun from_pile_to_column(game: &mut Game, pile_index: u64, column_index: u64, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
        assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
        assert!(column_index < COLUMN_COUNT, EInvalidColumnIndex);
        let pile = vector::borrow_mut(&mut game.piles, pile_index);
        let column = vector::borrow_mut(&mut game.columns, column_index);
        let pile_card = vector::pop_back(&mut pile.cards);
        // if the column is empty, the card must be a king
        if (vector::is_empty(&column.cards)) {
            assert!(pile_card % 13 == 12, ENotKingCard);
            vector::push_back(&mut column.cards, pile_card);
        } else {
            let last_card_index = vector::length(&column.cards) - 1;
            let column_card = vector::borrow(&column.cards, last_card_index);
            // edge case where the column card is an ace
            assert!(*column_card % 13 != 0, ECannotPlaceOnAce);
            let pile_card_mod = pile_card % 13;
            if (pile_card >= HEARTS_INDEX) {
                assert!((pile_card_mod == *column_card - SPADES_INDEX - 1) || (pile_card_mod == *column_card - CLUBS_INDEX - 1), EInvalidPlacement);
                vector::push_back(&mut column.cards, pile_card);
            } else {
                assert!((pile_card_mod == *column_card - HEARTS_INDEX - 1) || (pile_card_mod == *column_card - DIAMONDS_INDEX - 1), EInvalidPlacement);
                vector::push_back(&mut column.cards, pile_card);
            }
        }
    }

    public fun open_deck_card(game: &mut Game, clock: &Clock, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
        assert!(game.deck.hidden_cards > 0, ENoMoreHiddenCards);
        game.deck.hidden_cards = game.deck.hidden_cards - 1;
        let card = reveal_card(clock, &mut game.available_cards);
        vector::push_back(&mut game.deck.cards, card);
    }

    //fun game_won(game: &mut Game, ctx: TxContext) {}

    fun set_up_columns(clock: &Clock, available_cards: &mut vector<u64>): vector<Column> {
        let columns = vector::empty<Column>();
        let i = 0;
        while(i < COLUMN_COUNT) {
            let card = reveal_card(clock, available_cards);
            let column = Column {
                hidden_cards: i,
                cards: vector::singleton<u64>(card),
            };
            vector::push_back(&mut columns, column);
            i = i + 1;
        };
        columns
    }

    fun reveal_card (clock: &Clock, available_cards: &mut vector<u64>): u64 {
        let timestamp = clock::timestamp_ms(clock);
        let length = vector::length(available_cards);
        vector::remove(available_cards, timestamp % length)
    }
    
    // We consider the following mapping between Move Contract and FrontEnd:
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
}