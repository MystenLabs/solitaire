module solitaire::solitaire {
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use sui::transfer::{Self};
    use std::vector;
    use std::string::{String, utf8};
    use sui::event;

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
        // This is the stack with all the cards that are not revealed yet
        available_cards: vector<u64>,
        player: address,
        start_time: u64,
        end_time: u64,
        player_moves: u64,
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

// =================== Events ===================

    /// This event is emitted when a new card is revealed from the deck or column.
    struct CardRevealed has copy, drop {
        card: u64
    }

// =================== Public Functions ===================

    public fun init_normal_game(clock: &Clock, ctx: &mut TxContext) {
        let i: u64 = 0;
        // Initialize the stack with all the available cards.
        let available_cards = vector::empty<u64>();
        while (i < CARD_COUNT) {
            vector::push_back(&mut available_cards, i);
            i = i + 1;
        };
        
        // Initialize the Deck with 24 hidden cards and an empty vector of cards.
        let deck = Deck {
            hidden_cards: 24,
            cards: vector::empty(),
        };

        // Initialize the Piles with an empty vector of cards.
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
            player_moves: 0,
            start_time: clock::timestamp_ms(clock),
            end_time: 0,
            difficulty: utf8(b"NORMAL"),
        };

        transfer::transfer(game, tx_context::sender(ctx));
    }

    /// An easy game has all the Aces placed on the Piles by default.
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
            cards: vector::singleton(vector::remove(&mut available_cards, SPADES_INDEX-1))});
        vector::push_back(&mut piles, Pile {
            cards: vector::singleton(vector::remove(&mut available_cards, HEARTS_INDEX-2))});
        vector::push_back(&mut piles, Pile {
            cards: vector::singleton(vector::remove(&mut available_cards, DIAMONDS_INDEX-3))});

        let columns = set_up_columns(clock, &mut available_cards);

        let game = Game {
            id: object::new(ctx),
            deck,
            piles,
            columns,
            available_cards,
            player: tx_context::sender(ctx),
            player_moves: 0,
            start_time: clock::timestamp_ms(clock),
            end_time: 0,
            difficulty: utf8(b"EASY"),
        };

        transfer::transfer(game, tx_context::sender(ctx));
    }

    public fun from_deck_to_column(game: &mut Game, column_index: u64, _ctx: &mut TxContext) {
        assert!(column_index < COLUMN_COUNT, EInvalidColumnIndex);
        assert!(vector::length(&game.deck.cards) > 0, ENoAvailableDeckCard);
        let column = vector::borrow_mut(&mut game.columns, column_index);
        let deck_card = vector::pop_back(&mut game.deck.cards);
        // if the column is empty, the card must be a king
        if (vector::is_empty(&column.cards)) {
            assert!(deck_card % 13 == 12, ENotKingCard);
            vector::push_back(&mut column.cards, deck_card);
        } else {
            // Get the card at the top of the column
            let last_card_index = vector::length(&column.cards) - 1;
            let column_card = vector::borrow(&column.cards, last_card_index);
            // edge case where the column card is an ace
            assert!(*column_card % 13 != 0, ECannotPlaceOnAce);
            let card_mod = deck_card % 13;
            if (deck_card >= HEARTS_INDEX) { // check if card deck card is red
                assert!((*column_card >= SPADES_INDEX && card_mod == *column_card - SPADES_INDEX - 1) || (card_mod == *column_card - CLUBS_INDEX - 1), EInvalidPlacement);
                vector::push_back(&mut column.cards, deck_card);
            } else { // else, if it is black
                assert!((card_mod == *column_card - HEARTS_INDEX - 1) || (*column_card >= DIAMONDS_INDEX && card_mod == *column_card - DIAMONDS_INDEX - 1), EInvalidPlacement);
                vector::push_back(&mut column.cards, deck_card);
            };
        };
        game.player_moves = game.player_moves + 1;
    }

    public fun from_deck_to_pile(game: &mut Game, pile_index: u64, _ctx: &mut TxContext) {
        assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
        assert!(vector::length(&game.deck.cards) > 0, ENoAvailableDeckCard);
        let deck_card = vector::pop_back(&mut game.deck.cards);
        let pile = vector::borrow_mut(&mut game.piles, pile_index);
        // if the pile is empty, only Ace is allowed to be placed
        if (vector::is_empty(&pile.cards)) {
            assert!(deck_card % 13 == 0, ENotAceCard);
            vector::push_back(&mut pile.cards, deck_card);
        } else {
            let last_card_index = vector::length(&pile.cards) - 1;
            let pile_card = vector::borrow(&pile.cards, last_card_index);
            // edge case where the pile card is a king
            assert!(*pile_card % 13 != 12, ECannotPlaceOnKing);
            // the card to place must be the next card in the pile and of the same suit
            assert!(deck_card == *pile_card + 1, EInvalidPlacement);
            vector::push_back(&mut pile.cards, deck_card);
        };
        game.player_moves = game.player_moves + 1;
    }

    public fun from_column_to_pile(game: &mut Game, column_index: u64, pile_index: u64, clock: &Clock, _ctx: &mut TxContext) {
        assert!(column_index < COLUMN_COUNT, EInvalidColumnIndex);
        assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
        let column = vector::borrow_mut(&mut game.columns, column_index);
        assert!(!vector::is_empty(&column.cards), EColumnIsEmpty);
        let pile = vector::borrow_mut(&mut game.piles, pile_index);
        let column_card = vector::pop_back(&mut column.cards);
        if (vector::is_empty(&pile.cards)) {
            assert!(column_card % 13 == 0, ENotAceCard);
            vector::push_back(&mut pile.cards, column_card);
            // Check if there are hidden cards in the column and reveal one if needed
            if (column.hidden_cards > 0 && vector::is_empty(&column.cards)) {
                column.hidden_cards = column.hidden_cards - 1;
                let card = reveal_card(clock, &mut game.available_cards);
                vector::push_back(&mut column.cards, card);
                event::emit(CardRevealed {card});
            };
        } else {
            let last_card_index = vector::length(&pile.cards) - 1;
            let pile_card = vector::borrow(&pile.cards, last_card_index);
            assert!(*pile_card % 13 != 12, ECannotPlaceOnKing);
            assert!(column_card == *pile_card + 1, EInvalidPlacement);
            vector::push_back(&mut pile.cards, column_card);
            // Check if there are hidden cards in the column and reveal one if needed
            if (column.hidden_cards > 0 && vector::is_empty(&column.cards)) {
                column.hidden_cards = column.hidden_cards - 1;
                let card = reveal_card(clock, &mut game.available_cards);
                vector::push_back(&mut column.cards, card);
                event::emit(CardRevealed {card});
            };
        };
        game.player_moves = game.player_moves + 1;
    }

    public fun from_column_to_column(game: &mut Game, src_column_index: u64, card: u64, dest_column_index: u64, clock: &Clock, _ctx: &mut TxContext) {
        assert!(src_column_index < COLUMN_COUNT, EInvalidColumnIndex);
        assert!(dest_column_index < COLUMN_COUNT, EInvalidColumnIndex);
        if (src_column_index == dest_column_index) {
            // If the source and destination columns are the same,
            // we do not need to do anything.
            return
        };
        // One column needs to be removed because it is not allowed to take 2 mutable references to the same vector.
        let dest_column = vector::remove(&mut game.columns, dest_column_index);
        let src_column = vector::borrow_mut(&mut game.columns, src_column_index);
        let (exist, index) = vector::index_of(&src_column.cards, &card);
        assert!(exist, ECardNotInColumn);
        if (vector::is_empty(&dest_column.cards)) {
            assert!(card % 13 == 12, ENotKingCard);
            // Because more than one card can be moved at once, we need to iterate over the vector with starting point
            // the index of the card to move.
            while (vector::length(&src_column.cards) > index) {
                let card_to_move = vector::remove(&mut src_column.cards, index);
                vector::push_back(&mut dest_column.cards, card_to_move);
            };
            if (src_column.hidden_cards > 0 && vector::is_empty(&src_column.cards)) {
                src_column.hidden_cards = src_column.hidden_cards - 1;
                let card = reveal_card(clock, &mut game.available_cards);
                vector::push_back(&mut src_column.cards, card);
                event::emit(CardRevealed {card});
            };
        } else {
            let last_card_index = vector::length(&dest_column.cards) - 1;
            let dest_column_card = vector::borrow(&dest_column.cards, last_card_index);
            assert!(*dest_column_card % 13 != 0, ECannotPlaceOnAce);
            let card_mod = card % 13;
            if (card >= HEARTS_INDEX) {
                assert!((card_mod == *dest_column_card - CLUBS_INDEX - 1) || (*dest_column_card >= SPADES_INDEX && card_mod == *dest_column_card - SPADES_INDEX - 1), EInvalidPlacement);
                while (vector::length(&src_column.cards) > index) {
                    let card_to_move = vector::remove(&mut src_column.cards, index);
                    vector::push_back(&mut dest_column.cards, card_to_move);
                };
                if (src_column.hidden_cards > 0 && vector::is_empty(&src_column.cards)) {
                    src_column.hidden_cards = src_column.hidden_cards - 1;
                    let card = reveal_card(clock, &mut game.available_cards);
                    vector::push_back(&mut src_column.cards, card);
                    event::emit(CardRevealed {card});
                };
            } else {
                assert!((card_mod == *dest_column_card - HEARTS_INDEX - 1) || (*dest_column_card >= DIAMONDS_INDEX && card_mod == *dest_column_card - DIAMONDS_INDEX - 1), EInvalidPlacement);
                while (vector::length(&src_column.cards) > index) {
                    let card_to_move = vector::remove(&mut src_column.cards, index);
                    vector::push_back(&mut dest_column.cards, card_to_move);
                };
                if (src_column.hidden_cards > 0 && vector::is_empty(&src_column.cards)) {
                    src_column.hidden_cards = src_column.hidden_cards - 1;
                    let card = reveal_card(clock, &mut game.available_cards);
                    vector::push_back(&mut src_column.cards, card);
                    event::emit(CardRevealed {card});
                };
            };
        };
        game.player_moves = game.player_moves + 1;
        vector::insert(&mut game.columns, dest_column, dest_column_index);
    }

    public fun from_pile_to_column(game: &mut Game, pile_index: u64, column_index: u64, _ctx: &mut TxContext) {
        assert!(pile_index < PILE_COUNT, EInvalidPileIndex);
        assert!(column_index < COLUMN_COUNT, EInvalidColumnIndex);
        assert!(game.end_time == 0, EGameHasFinished);
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
                assert!((pile_card_mod == *column_card - CLUBS_INDEX - 1) || (*column_card >= SPADES_INDEX && pile_card_mod  == *column_card - SPADES_INDEX - 1), EInvalidPlacement);
                vector::push_back(&mut column.cards, pile_card);
            } else {
                assert!((pile_card_mod == *column_card - HEARTS_INDEX - 1) || (*column_card >= DIAMONDS_INDEX && pile_card_mod == *column_card - DIAMONDS_INDEX - 1), EInvalidPlacement);
                vector::push_back(&mut column.cards, pile_card);
            };
        };
        game.player_moves = game.player_moves + 1;
    }

    /// This function is used to reveal a card from the deck if there are still hidden cards.
    public fun open_deck_card(game: &mut Game, clock: &Clock, _ctx: &mut TxContext) {
        assert!(game.deck.hidden_cards > 0, ENoMoreHiddenCards);
        game.deck.hidden_cards = game.deck.hidden_cards - 1;
        let card = reveal_card(clock, &mut game.available_cards);
        vector::push_back(&mut game.deck.cards, card);
        event::emit(CardRevealed {card});
    }

    /// This function is used to cycle through the open deck cards and rotate their order, one at a time. 
    /// The top card is placed at the bottom which makes the next card in the deck `top card`
    public fun rotate_open_deck_cards(game: &mut Game, _ctx: &mut TxContext) {
        assert!(game.deck.hidden_cards == 0, EInvalidTurnDeckCard);
        assert!(vector::length(&game.deck.cards) > 0, ENoAvailableDeckCard);
        let card = vector::remove(&mut game.deck.cards, 0);
        vector::push_back(&mut game.deck.cards, card);
        game.player_moves = game.player_moves + 1;
    }

    /// This funtion needs to be called when the player has finished the game.
    public fun finish_game(game: &mut Game, clock: &Clock, _ctx: &mut TxContext) {
        let i = 0;
        while (i < PILE_COUNT) {
            let pile = vector::borrow(&game.piles, i);
            assert!(vector::length(&pile.cards) == 13, EGameNotFinished);
            i = i + 1;
        };
        game.end_time = clock::timestamp_ms(clock);
    }

    /// Internal function that sets up the 7 columns of cards.
    /// Each column has the top card revealed and the a number of hidden cards that is equal to the
    /// index of the column, starting from 0.
    fun set_up_columns(clock: &Clock, available_cards: &mut vector<u64>): vector<Column> {
        let columns = vector::empty<Column>();
        let i: u64 = 0;
        while(i < COLUMN_COUNT) {
            let card = reveal_card(clock, available_cards);
            let column = Column {
                hidden_cards: i,
                cards: vector::singleton<u64>(card)
            };
            vector::push_back(&mut columns, column);
            i = i + 1;
        };
        columns
    }

    fun reveal_card (clock: &Clock, available_cards: &mut vector<u64>): u64 {
        // The randomness will be retrieved from the timestamp of the current block.
        let timestamp =
            clock::timestamp_ms(clock) +
            pseudo_random(clock::timestamp_ms(clock) + vector::length(available_cards));

        let length = vector::length(available_cards);
        // A card is removed from the stack of the available cards based on the modulo of the timestamp.
        // Module length will ensure that we cannot get out of bounds.
        vector::remove(available_cards, timestamp % length)
    }

    fun pseudo_random(seed: u64): u64 {
        // Generated using `for _ in echo {1..400}; do echo -n $(shuf -i 1-52 -n 1),; done`
        let random_order_numbers: vector<u64> = vector<u64>[
            19,33,19,24,50,21,13,23,44,23,45,21,13,13,37,36,1,
            19,6,34,37,4,28,49,6,26,3,44,46,28,23,31,8,23,34,
            38,6,50,20,31,29,15,22,18,9,14,47,6,40,19,39,46,46,
            42,31,41,2,37,11,32,16,22,36,40,41,44,47,32,3,14,15,
            3,23,47,23,51,50,40,45,22,37,43,4,39,28,23,45,47,11,
            37,22,6,38,4,6,14,48,44,50,5,1,17,36,9,51,45,51,7,2,
            13,9,43,34,14,20,7,7,20,6,49,19,28,38,23,18,49,40,16,
            44,49,48,15,51,33,7,38,14,8,8,46,29,8,37,23,6,49,28,2,
            17,46,46,10,20,20,34,3,25,28,33,45,8,2,36,19,22,45,15,
            23,2,16,35,48,22,1,42,36,19,3,19,48,8,15,4,14,38,20,27,
            18,9,20,14,44,22,13,51,45,23,35,31,10,16,44,47,51,36,20,
            6,45,20,8,45,30,7,19,46,45,47,28,3,40,42,32,15,49,45,34,
            40,40,20,1,18,44,36,47,2,45,43,14,32,19,46,39,13,11,40,
            52,39,11,44,8,47,31,43,37,18,47,20,39,37,49,26,9,33,32,15,
            50,42,42,20,4,20,6,47,4,48,45,49,42,47,38,34,11,2,41,13,30,
            26,20,4,30,39,44,14,8,30,33,33,18,6,8,42,7,41,15,41,37,45,
            32,31,20,18,49,13,31,18,45,1,4,23,43,20,40,43,40,1,7,27,19,
            37,6,39,31,24,19,19,14,47,15,11,52,13,17,11,43,3,21,32,50,
            45,23,15,48,50,48,32,15,2,41,7,25,50,38,7,19,37,30,15,2,7,
            6,5,47,31,7,6,25,7,18,33,50,50,13,13,19,14,50,15,51,34,9,
            45,6,20,41,28,9,39,7,47,18,15
        ];
        let length = vector::length(&random_order_numbers);
        *vector::borrow(&random_order_numbers, seed % length)
    }

    #[test_only]
    public fun reveal_card_test (clock: &Clock, available_cards: &mut vector<u64>): u64 {
        reveal_card(clock, available_cards)
    }

    #[test_only]
    public fun get_top_card_of_deck(game: &Game): u64 {
        let length = vector::length(&game.deck.cards);
        let card = vector::borrow(&game.deck.cards, length - 1);
        *card
    }

    #[test_only]
    /// Use this to set a custom deck for testing purposes.
    public fun cheat_open_card_to_deck(game: &mut Game, card: u64) {
        vector::push_back(&mut game.deck.cards, card);
        let (_, index) = vector::index_of(&game.available_cards, &card);
        vector::remove(&mut game.available_cards, index);
    }

    #[test_only]
    public fun remove_all_from_deck(game: &mut Game) {
        while (!vector::is_empty(&game.deck.cards)) {
            vector::pop_back(&mut game.deck.cards);
        };
    }

    #[test_only]
    // Use this when you want a test to interact with an empty column.
    public fun remove_all_from_column(game: &mut Game, column_index: u64) {
        let column = vector::borrow_mut(&mut game.columns, column_index);
        while (!vector::is_empty(&column.cards)) {
            vector::pop_back(&mut column.cards);
        };
    }

    #[test_only]
    public fun get_num_cards_in_column(game: &Game, column_index: u64): u64 {
        let column = vector::borrow(&game.columns, column_index);
        vector::length(&column.cards)
    }

    #[test_only]
    public fun cheat_place_card_to_column(game: &mut Game, card: u64, column_index: u64) {
        let column = vector::borrow_mut(&mut game.columns, column_index);
        vector::push_back(&mut column.cards, card);
        let (_, index) = vector::index_of(&game.available_cards, &card);
        vector::remove(&mut game.available_cards, index);
    }

    #[test_only]
    public fun cheat_place_card_to_pile(game: &mut Game, card: u64, pile_index: u64) {
        let pile = vector::borrow_mut(&mut game.piles, pile_index);
        vector::push_back(&mut pile.cards, card);
        let (_, index) = vector::index_of(&game.available_cards, &card);
        vector::remove(&mut game.available_cards, index);
    }

    #[test_only]
    public fun cheat_fill_all_piles(game: &mut Game) {
        let i: u64 = 0;
        let indexes = vector<u64>[
            CLUBS_INDEX,
            SPADES_INDEX,
            HEARTS_INDEX,
            DIAMONDS_INDEX
        ];
        while (i < PILE_COUNT) {
            let pile = vector::borrow_mut(&mut game.piles, i);
            while (vector::length(&pile.cards) < 13) {
                let card_index = vector::borrow(&indexes, i);
                let card: u64 = *card_index + vector::length(&pile.cards);
                vector::push_back(&mut pile.cards, card);
            };
            i = i + 1;
        };
    }

    #[test_only]
    public fun check_time_end_greater_than_time_start(game: &Game): bool {
        game.end_time > game.start_time
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
}