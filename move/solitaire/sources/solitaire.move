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

// =================== Constants ===================
    const CARD_COUNT: u8 = 52;
    const PILE_COUNT: u8 = 4;
    const COLUMN_COUNT: u8 = 7;
    const CLUBS_INDEX: u8 = 0;
    const DIAMONDS_INDEX: u8 = 13;
    const HEARTS_INDEX: u8 = 26;
    const SPADES_INDEX: u8 = 39;


// =================== Structs ===================

    struct Game has key {
        id: UID,
        deck: Deck,
        piles: vector<Pile>,
        columns: vector<Column>,
        available_cards: vector<u8>,
        player: address,
        start_time: u64,
        difficulty: String,
    }

    /// This is the player Deck containing the cards that are not yet in the game.
    /// All 24 cards in the Deck are initially hidden.
    struct Deck has store {
        hidden_cards: u8,
        cards: vector<u8>
    }

    /// This is a Pile of cards that should be ordered from Ace to King of the same suit.
    struct Pile has store {
        cards: vector<u8>
    }

    /// This is a Column of cards. Initially the game starts with 7 Columns of cards
    /// and only the first card of each Column is visible.
    struct Column has store {
        hidden_cards: u8,
        cards: vector<u8>
    }

    public fun init_normal_game(clock: &Clock, ctx: &mut TxContext) {
        let i: u8 = 0;
        let available_cards = vector::empty<u8>();
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
        let i: u8 = 0;
        let available_cards = vector::empty<u8>();
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
            cards: vector::singleton(vector::remove(&mut available_cards, DAMONDS_INDEX))});
        vector::push_back(&mut piles, Pile {
            cards: vector::singleton(&mut available_cards, HEARTS_INDEX)});
        vector::push_back(&mut piles, Pile {
            cards: vector::singleton(&mut available_cards, SPADES_INDEX)});

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

    public fun from_deck_to_column(game: &mut Game, card_index: u64, column_index: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
    }

    public fun from_deck_to_pile(game: &mut Game, card_index: u64, pile_index: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
    }

    public fun from_column_to_pile(game: &mut Game, column_index: u64, pile_index: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
    }

    public fun from_column_to_column(game: &mut Game, column_index: u64, card_index: u64, pile_index: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
    }

    public fun from_pile_to_column(game: &mut Game, pile_index: u64, column_index: u64, clock: &Clock, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
    }

    public fun open_deck_card(game: &mut Game, clock: &Clock, ctx: &mut TxContext) {
        assert!(game.player == tx_context::sender(ctx), EInvalidGamePlayer);
        assert!(game.deck.hidden_cards > 0, ENoMoreHiddenCards);
        game.deck.hidden_cards = game.deck.hidden_cards - 1;
        let card = reveal_card(clock, &mut game.available_cards);
        vector::push_back(&mut game.deck.cards, card);
    }

    fun game_won(game: &mut Game, ctx: TxContext) {

    }

    fun set_up_columns(clock: &Clock, available_cards: &mut vector<u8>): vector<Column> {
        let columns = vector::empty<Column>();
        let i = 0;
        while(i < COLUMN_COUNT) {
            let card = reveal_card(clock, available_cards);
            let column = Column {
                hidden_cards: i,
                cards: vector::singleton<u8>(card),
            };
            vector::push_back(&mut columns, column);
            i = i + 1;
        };
        columns
    }

    fun reveal_card (clock: &Clock, available_cards: &mut vector<u8>): u8 {
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
    // index= 13, suit: "Diamonds", name-on-card: "A",  
    // index= 14, suit: "Diamonds", name-on-card: "2",  
    // index= 15, suit: "Diamonds", name-on-card: "3",  
    // index= 16, suit: "Diamonds", name-on-card: "4",  
    // index= 17, suit: "Diamonds", name-on-card: "5",  
    // index= 18, suit: "Diamonds", name-on-card: "6",  
    // index= 19, suit: "Diamonds", name-on-card: "7",  
    // index= 20, suit: "Diamonds", name-on-card: "8",  
    // index= 21, suit: "Diamonds", name-on-card: "9",  
    // index= 22, suit: "Diamonds", name-on-card: "10", 
    // index= 23, suit: "Diamonds", name-on-card: "J",  
    // index= 24, suit: "Diamonds", name-on-card: "Q",  
    // index= 25, suit: "Diamonds", name-on-card: "K",  
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
    // index= 39, suit: "Spades", name-on-card: "A",  
    // index= 40, suit: "Spades", name-on-card: "2",  
    // index= 41, suit: "Spades", name-on-card: "3",  
    // index= 42, suit: "Spades", name-on-card: "4",  
    // index= 43, suit: "Spades", name-on-card: "5",  
    // index= 44, suit: "Spades", name-on-card: "6",  
    // index= 45, suit: "Spades", name-on-card: "7",  
    // index= 46, suit: "Spades", name-on-card: "8",  
    // index= 47, suit: "Spades", name-on-card: "9",  
    // index= 48, suit: "Spades", name-on-card: "10", 
    // index= 49, suit: "Spades", name-on-card: "J",  
    // index= 50, suit: "Spades", name-on-card: "Q",  
    // index= 51, suit: "Spades", name-on-card: "K",  
}