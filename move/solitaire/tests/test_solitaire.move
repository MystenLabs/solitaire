#[test_only]
module solitaire::test_solitaire {
    // use std::string::{Self};
    use std::debug; // TODO - remove this
    use std::vector;
    use sui::test_scenario::{Self, Scenario};
    // use sui::sui::SUI;
    // use sui::object::{ID};
    use sui::clock;

    use solitaire::solitaire::{
        Self,
        Game,
        // Deck,
        // Column,
        // Pile,
        // ENoMoreHiddenCards,
        // ECardNotInDeck,
        // ENotKingCard,
        EInvalidPlacement,
        // ECannotPlaceOnAce,
        // ENotAceCard,
        // ECannotPlaceOnKing,
        // EColumnIsEmpty,
        // ECardNotInColumn,
        // EInvalidColumnIndex,
        // EInvalidPileIndex,
    };

    const PLAYER: address = @0xCAFE;

    // ----------------- Helper functions -----------------

    fun init_normal_game_scenario_helper(): Scenario {
        let scenario_val = test_scenario::begin(PLAYER);
        let scenario = &mut scenario_val;
        {
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::set_for_testing(&mut clock, 30);
            solitaire::init_normal_game(&clock, test_scenario::ctx(scenario));
            clock::destroy_for_testing(clock);
        };
        scenario_val
    }

    fun init_easy_game_scenario_helper(): Scenario {
        let scenario_val = test_scenario::begin(PLAYER);
        let scenario = &mut scenario_val;
        {
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::set_for_testing(&mut clock, 30);
            solitaire::init_easy_game(&clock, test_scenario::ctx(scenario));
            clock::destroy_for_testing(clock);
        };
        scenario_val
    }

    fun reveal_card_helper(num_cards: u64) {
        let scenario_val = test_scenario::begin(PLAYER);
        let scenario = &mut scenario_val;
        {
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            let available_cards = solitaire::generate_cards(num_cards);
            solitaire::reveal_card_test(&clock, &mut available_cards);
            clock::destroy_for_testing(clock);
        };
        test_scenario::end(scenario_val);
    }

    // ----------------- Tests -----------------

    #[test]
    /// Sanity check that the normal game can be initialized
    public fun test_init_normal_game_valid() {
        let scenario_val = init_normal_game_scenario_helper();
        test_scenario::end(scenario_val);
    }

    #[test]
    /// Sanity check that the easy game can be initialized
    public fun test_init_easy_game_valid() {
        let scenario_val = init_easy_game_scenario_helper();
        test_scenario::end(scenario_val);
    }

    #[test]
    /// Test that the reveal_card function works as expected
    public fun test_reveal_card_valid() {
        let inputs = vector<u64>[1, 52]; // reveal card from a deck of 1 and a deck of 52 cards
        let i = vector::length(&inputs);
        while (i > 0) {
            let num_cards = vector::pop_back(&mut inputs);
            reveal_card_helper(num_cards);
            i = i - 1;
        };
    }

    #[test]
    public fun test_from_deck_to_column_valid_spades_8_on_hearts_9(){
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {   // Open a deck card and move it to a column
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::set_for_testing(&mut clock, 40);
            solitaire::open_deck_card(&mut game, &clock, test_scenario::ctx(scenario));
            clock::destroy_for_testing(clock);

            // Top card should be {index= 20, suit: "Spades", name-on-card: "8"}
            let top_card_of_dock = solitaire::get_top_card_of_deck(&game);

            // Placing {index= 20, suit: "Spades", name-on-card: "8"} on {index= 34, suit: "Hearts", name-on-card:"9"}
            solitaire::from_deck_to_column(
                &mut game, top_card_of_dock, 0, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidPlacement)]
    // Try to do an illegal move by placing a card on a column that its top has the same color
    // as the one that is to be placed.
    public fun test_from_deck_to_column_invalid_order_spades_8_on_hearts_5(){
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {   // Open a deck card and move it to a column
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            clock::set_for_testing(&mut clock, 40);
            solitaire::open_deck_card(&mut game, &clock, test_scenario::ctx(scenario));
            clock::destroy_for_testing(clock);

            // Top card should be {index= 20, suit: "Spades", name-on-card: "8"}
            let top_card_of_dock = solitaire::get_top_card_of_deck(&game);

            debug::print(&game);
            // Placing {index= 20, suit: "Spades", name-on-card: "8"} on {index= 30, suit: "Hearts", name-on-card:"5"}
            solitaire::from_deck_to_column(
                &mut game, top_card_of_dock, 4, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };

        test_scenario::end(scenario_val);
    }

    // #[test]
    // public fun test_should_only_move_card_top_of_deck() {}

    // #[test]
    // public fun test_should_only_move_card_top_of_deck() {}
}