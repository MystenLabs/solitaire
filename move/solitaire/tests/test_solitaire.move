#[test_only]
#[allow(unused_use)]
module solitaire::test_solitaire {
    use std::vector;
    use sui::test_scenario::{Self, Scenario};
    use sui::clock;

    use solitaire::solitaire::{
        Self,
        Game,
        ENoMoreHiddenCards,
        ENoAvailableDeckCard,
        ENotKingCard,
        EInvalidPlacement,
        ECannotPlaceOnAce,
        ENotAceCard,
        ECannotPlaceOnKing,
        EColumnIsEmpty,
        ECardNotInColumn,
        EInvalidColumnIndex,
        EInvalidPileIndex,
        EGameNotFinished,
        EGameHasFinished,
        EInvalidTurnDeckCard,
    };

    // Test error codes
    const ETestColumnNotEmpty: u64 = 901;
    const ETestIncorrectNumberOfCardsInColumnAfterMove: u64 = 902;
    const ETestTimeEndNotGreaterThanTimeStart : u64 = 903;

    const PLAYER: address = @0xCAFE;

    // ----------------- Helper functions -----------------
    fun generate_cards(num_cards: u64): vector<u64>{
        let i: u64 = 0;
        let available_cards = vector::empty<u64>();
        while (i < num_cards) {
            vector::push_back(&mut available_cards, i);
            i = i + 1;
        };
        available_cards
    }

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
            let available_cards = generate_cards(num_cards);
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
    #[expected_failure(abort_code = ENoMoreHiddenCards)]
    public fun test_open_deck_card_invalid_out_of_cards() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            // Open all the cards in the deck
            let i = 0;
            while (i <= 25) {
                solitaire::open_deck_card(&mut game, &clock, test_scenario::ctx(scenario));
                i = i + 1;
            };
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
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

            // Placing {index= 20, suit: "Spades", name-on-card: "8"} on {index= 34, suit: "Hearts", name-on-card:"9"}
            solitaire::from_deck_to_column(
                &mut game, 0, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidPlacement)]
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

            // Placing {index= 20, suit: "Spades", name-on-card: "8"} on {index= 30, suit: "Hearts", name-on-card:"5"}
            solitaire::from_deck_to_column(
                &mut game, 4, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ENoAvailableDeckCard)]
    public fun test_from_deck_to_column_no_available_card() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            // Open all the cards in the deck
            let i = 0;
            while (i < 24) {
                solitaire::open_deck_card(&mut game, &clock, test_scenario::ctx(scenario));
                i = i + 1;
            };
            solitaire::remove_all_from_deck(&mut game);
            solitaire::from_deck_to_column(
                &mut game, 0, test_scenario::ctx(scenario)
            );
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidPlacement)]
    public fun test_from_deck_to_column_invalid_color_hearts_4_on_hearts_5() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {   // Open a deck card and move it to a column
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            // Get {hearts 4} with a cheat function:
            solitaire::cheat_open_card_to_deck(&mut game, 29);
            clock::destroy_for_testing(clock);

            // Placing {index= 20, suit: "Spades", name-on-card: "8"} on {index= 30, suit: "Hearts", name-on-card:"5"}
            solitaire::from_deck_to_column(
                &mut game, 4, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_deck_to_column_valid_diamonds_K_on_empty() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            // Empty the first column
            solitaire::remove_all_from_column(&mut game, 0);
            // Cheat to get the king of diamonds on top of the deck
            solitaire::cheat_open_card_to_deck(&mut game, 51);
            // Use the king of diamonds to place it on the empty column
            solitaire::from_deck_to_column(
                &mut game, 0, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ENotKingCard)]
    public fun test_from_deck_to_column_invalid_order_diamonds_Q_on_empty() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            // Empty the first column
            solitaire::remove_all_from_column(&mut game, 0);
            // Cheat to get the queen of diamonds on top of the deck
            solitaire::cheat_open_card_to_deck(&mut game, 50);
            // Use the queen of diamonds to try to place it on the empty column
            solitaire::from_deck_to_column(
                &mut game, 0, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_deck_to_pile_valid_hearts_A_on_empty() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            // Cheat to get ace of hearts on top of the deck
            solitaire::cheat_open_card_to_deck(&mut game, 26);
            // Use the ace of hearts to place it on the empty pile
            solitaire::from_deck_to_pile(
                &mut game, 0, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_deck_to_pile_valid_hearts_2_on_hearts_A() {
        // Init easy game to start with aces on the piles
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            // Cheat to get 2 of hearts on top of the deck
            solitaire::cheat_open_card_to_deck(&mut game, 27);

            // Use the 2 of hearts to place it on the hearts pile
            solitaire::from_deck_to_pile(
                &mut game, 2, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ENoAvailableDeckCard)]
    public fun test_from_deck_to_pile_no_available_card() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::from_deck_to_pile(
                &mut game, 0, test_scenario::ctx(scenario)
            );
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ENotAceCard)]
    public fun test_from_deck_to_pile_invalid_order_diamonds_7_on_empty() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            // Cheat to get 7 of diamonds on top of the deck
            solitaire::cheat_open_card_to_deck(&mut game, 45);
            // Use the 7 of diamonds to place it on the empty pile
            solitaire::from_deck_to_pile(
                &mut game, 0, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }


    #[test]
    #[expected_failure(abort_code = EInvalidPlacement)]
    public fun test_from_deck_to_pile_invalid_order_hearts_3_on_hearts_A() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            // Cheat to get 3 of hearts on top of the deck
            solitaire::cheat_open_card_to_deck(&mut game, 28);
            // Use the 3 of hearts to place it on the hearts pile
            solitaire::from_deck_to_pile(
                &mut game, 2, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidPlacement)]
    public fun test_from_deck_to_pile_invalid_class_clubs_2_on_hearts_A() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            // Cheat to get 3 of hearts on top of the deck
            solitaire::cheat_open_card_to_deck(&mut game, 1);
            // Use the 3 of hearts to place it on the hearts pile
            solitaire::from_deck_to_pile(
                &mut game, 2, test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_column_to_pile_valid_hearts_A_on_empty() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            // Place ace of hearts to the first column
            solitaire::cheat_place_card_to_column(&mut game, 26, 0);

            // Move ace of hearts to an empty pile (e.g. pile 0)
            solitaire::from_column_to_pile(&mut game, 0, 0, &clock, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_column_to_pile_valid_hearts_2_on_hearts_A() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            // Place ace of hearts 2 to the first column
            solitaire::cheat_place_card_to_column(&mut game, 27, 0);

            // Move ace of hearts to the hearts pile that already contains an ace due to
            // an easy game start
            solitaire::from_column_to_pile(&mut game, 0, 2, &clock, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ENotAceCard)]
    public fun test_from_column_to_pile_invalid_order_diamonds_7_on_empty() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            solitaire::cheat_place_card_to_column(&mut game, 45, 0);

            solitaire::from_column_to_pile(&mut game, 0, 2, &clock, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }


    #[test]
    #[expected_failure(abort_code = EInvalidPlacement)]
    public fun test_from_column_to_pile_invalid_order_hearts_3_on_hearts_A() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            solitaire::cheat_place_card_to_column(&mut game, 41, 0);

            solitaire::from_column_to_pile(&mut game, 0, 2, &clock, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidPlacement)]
    public fun test_from_column_to_pile_invalid_class_clubs_2_on_hearts_A() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            solitaire::cheat_place_card_to_column(&mut game, 1, 0);

            solitaire::from_column_to_pile(&mut game, 0, 2, &clock, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidColumnIndex)]
    public fun test_from_column_to_pile_invalid_column_index() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::from_column_to_pile(&mut game, 7, 2, &clock, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidPileIndex)]
    public fun test_from_column_to_pile_invalid_pile_index() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::from_column_to_pile(&mut game, 1, 4, &clock, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EColumnIsEmpty)]
    public fun test_from_column_to_pile_column_is_empty() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::remove_all_from_column(&mut game, 5);
            solitaire::from_column_to_pile(&mut game, 5, 3, &clock, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ECannotPlaceOnKing)]
    public fun test_from_column_to_pile_invalid_place_on_king() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            let ace_of_hearts = 26;
            solitaire::cheat_place_card_to_column(
                &mut game,
                ace_of_hearts,
                0);

            let king_of_spades = 25;
            solitaire::cheat_place_card_to_pile(
                &mut game,
                king_of_spades,
                3);

            solitaire::from_column_to_pile(&mut game, 0, 3, &clock, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_column_to_column_valid_hearts_J_on_clubs_Q() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::cheat_place_card_to_column(
                &mut game, 36, 0
            ); // J of hearts
            solitaire::cheat_place_card_to_column(
                &mut game, 11, 1
            ); // Q of clubs

            solitaire::from_column_to_column(
                &mut game, 0, 36, 1, &clock, test_scenario::ctx(scenario)
            );

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidPlacement)]
    public fun test_from_column_to_column_invalid_order_spades_8_on_hearts_10() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            // Setup -- place 8 of spades on column 0 and 9 of hearts on column 1
            solitaire::cheat_place_card_to_column(&mut game, 20, 0); // 8 of spades
            solitaire::cheat_place_card_to_column(&mut game, 35, 1); // 9 of hearts

            solitaire::from_column_to_column(
                &mut game, 0, 20, 1, &clock, test_scenario::ctx(scenario)
            );

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidColumnIndex)]
    public fun test_from_column_to_column_invalid_src_column_index() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::from_column_to_column(
                &mut game, 7, 20, 1, &clock, test_scenario::ctx(scenario)
            );

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidColumnIndex)]
    public fun test_from_column_to_column_invalid_dest_column_index() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::from_column_to_column(
                &mut game, 0, 20, 7, &clock, test_scenario::ctx(scenario)
            );

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_column_to_column_valid_multiple_cards() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            // Put 2 cards on column 0. It's ok to cheat here, just don't tell anyone.
            solitaire::cheat_place_card_to_column(&mut game, 38, 0);
            solitaire::cheat_place_card_to_column(&mut game, 37, 0);
            // Remove the card from column 1 so that we can move anything to it
            solitaire::remove_all_from_column(&mut game, 1);

            // Both cheat-placed cards should be moved to column 1.
            solitaire::from_column_to_column(
                &mut game, 0, 38, 1, &clock, test_scenario::ctx(scenario)
            );
            assert!(
                solitaire::get_num_cards_in_column(&game, 0) == 1,
                ETestColumnNotEmpty
            );
            assert!(
                solitaire::get_num_cards_in_column(&game, 1) == 2,
                ETestIncorrectNumberOfCardsInColumnAfterMove
            );

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_column_to_column_valid_to_same_column() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::remove_all_from_column(&mut game, 0);

            // Put 2 cards on column 0. It's ok to cheat here, just don't tell anyone.
            solitaire::cheat_place_card_to_column(&mut game, 38, 0);
            solitaire::cheat_place_card_to_column(&mut game, 37, 0);

            // Both cheat-placed cards should be moved to column 1.
            solitaire::from_column_to_column(
                &mut game, 0, 38, 0, &clock, test_scenario::ctx(scenario)
            );

            assert!(
                solitaire::get_num_cards_in_column(&game, 0) == 2,
                ETestIncorrectNumberOfCardsInColumnAfterMove
            );

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ECardNotInColumn)]
    public fun test_from_column_to_column_invalid_card_not_in_column() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::from_column_to_column(
                &mut game, 0, 70, 1, &clock, test_scenario::ctx(scenario)
            );

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ENotKingCard)]
    public fun test_from_column_to_column_invalid_clubs_3_on_empty() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            solitaire::cheat_place_card_to_column(&mut game, 4, 0);
            solitaire::remove_all_from_column(&mut game, 1);
            solitaire::from_column_to_column(
                &mut game, 0, 4, 1, &clock, test_scenario::ctx(scenario)
            );

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_column_to_column_valid_clubs_K_on_empty() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            solitaire::cheat_place_card_to_column(&mut game, 12, 0);

            solitaire::remove_all_from_column(&mut game, 1);

            solitaire::from_column_to_column(
                &mut game, 0, 12, 1, &clock, test_scenario::ctx(scenario)
            );

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidPileIndex)]
    public fun test_from_pile_to_column_invalid_pile_index() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);

            solitaire::remove_all_from_column(&mut game, 4);

            solitaire::from_pile_to_column(
                &mut game, 4, 4, test_scenario::ctx(scenario)
            );

            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidColumnIndex)]
    public fun test_from_pile_to_column_invalid_column_index() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);

            solitaire::remove_all_from_column(&mut game, 4);

            solitaire::from_pile_to_column(
                &mut game, 0, 7, test_scenario::ctx(scenario)
            );

            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_from_pile_to_column_valid_clubs_2_on_diamonds_3() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);

            solitaire::cheat_place_card_to_pile(&mut game, 41, 1);
            solitaire::cheat_place_card_to_column(&mut game, 3, 4);

            solitaire::from_pile_to_column(
                &mut game, 1, 4, test_scenario::ctx(scenario)
            );

            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = ECannotPlaceOnAce)]
    public fun test_from_pile_to_column_invalid_spades_K_on_hearts_A(){
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            // Setup
            let game = test_scenario::take_from_sender<Game>(scenario);
            solitaire::cheat_place_card_to_column(&mut game, 26, 4);
            solitaire::cheat_place_card_to_pile(&mut game, 25, 3);

            solitaire::from_pile_to_column(
                &mut game, 3, 4, test_scenario::ctx(scenario)
            );

            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EGameHasFinished)]
    public fun test_pile_to_column_invalid_has_finished() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            // Setup
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            // Run test
            solitaire::cheat_fill_all_piles(&mut game);
            clock::set_for_testing(&mut clock, 2008);
            solitaire::finish_game(&mut game, &clock, test_scenario::ctx(scenario));
            solitaire::from_pile_to_column(&mut game, 0, 1, test_scenario::ctx(scenario));

            // Teardown
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_turn_deck_card_valid_reveal_all_and_iterate_2_times() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            // Open all the cards in the deck
            let i = 0;
            while (i < 24) {
                solitaire::open_deck_card(&mut game, &clock, test_scenario::ctx(scenario));
                i = i + 1;
            };
            // iterate the whole deck 2 times
            i = 0;
            while (i < 48) {
                solitaire::rotate_open_deck_cards(&mut game, test_scenario::ctx(scenario));
                i = i + 1;
            };
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidTurnDeckCard)]
    public fun test_invalid_turn_deck_card() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            solitaire::open_deck_card(&mut game, &clock, test_scenario::ctx(scenario));
            solitaire::rotate_open_deck_cards(&mut game, test_scenario::ctx(scenario));

            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);    
    }

    #[test]
    public fun test_finish_game_valid_finished() {
        let scenario_val = init_normal_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            solitaire::cheat_fill_all_piles(&mut game);
            clock::set_for_testing(&mut clock, 2009);
            solitaire::finish_game(&mut game, &clock, test_scenario::ctx(scenario));
            assert!(
                solitaire::check_time_end_greater_than_time_start(&game),
                ETestTimeEndNotGreaterThanTimeStart
            );
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = EGameNotFinished)]
    public fun test_finish_game_invalid_not_finished() {
        let scenario_val = init_easy_game_scenario_helper();
        let scenario = &mut scenario_val;
        test_scenario::next_tx(scenario, PLAYER);
        {
            let game = test_scenario::take_from_sender<Game>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            solitaire::finish_game(&mut game, &clock, test_scenario::ctx(scenario));
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, game);
        };
        test_scenario::end(scenario_val);
    }
}