#[test_only]
module solitaire::test_solitaire {
    // use std::string::{Self};
    use std::vector;
    use sui::test_scenario;
    // use sui::sui::SUI;
    // use sui::object::{ID};
    use sui::clock;

    use solitaire::solitaire::{
        Self,
        // Game,
        // Deck,
        // Column,
        // Pile,
        // ENoMoreHiddenCards,
        // ECardNotInDeck,
        // ENotKingCard,
        // EInvalidPlacement,
        // ECannotPlaceOnAce,
        // ENotAceCard,
        // ECannotPlaceOnKing,
        // EColumnIsEmpty,
        // ECardNotInColumn,
        // EInvalidColumnIndex,
        // EInvalidPileIndex,
    };

    // Test address
    const PLAYER: address = @0xCAFE;

    #[test]
    public fun test_init_normal_game() {
        /// Sanity check that the normal game can be initialized
        let scenario_val = test_scenario::begin(PLAYER);
        let scenario = &mut scenario_val;
        {
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            solitaire::init_normal_game(&clock, test_scenario::ctx(scenario));
            clock::destroy_for_testing(clock);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_init_easy_game() {
        /// Sanity check that the easy game can be initialized
        let scenario_val = test_scenario::begin(PLAYER);
        let scenario = &mut scenario_val;
        {
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            solitaire::init_easy_game(&clock, test_scenario::ctx(scenario));
            clock::destroy_for_testing(clock);
        };
        test_scenario::end(scenario_val);
    }

    fun reveal_card_helper(num_cards: u64) {
        /// Helper function used to parameterize the reveal_card test
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

    #[test]
    public fun test_reveal_card() {
        /// Test that the reveal_card function works as expected
        use std::debug;
        let inputs = vector<u64>[1, 52]; // reveal card from a deck of 1 and 52 cards
        let i = vector::length(&inputs);
        while (i > 0) {
            let num_cards = vector::pop_back(&mut inputs);
            debug::print(&num_cards);
            reveal_card_helper(num_cards);
            i = i - 1;
        };
    }
}