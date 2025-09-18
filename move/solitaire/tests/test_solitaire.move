#[test_only]
#[allow(unused_use)]
module solitaire::test_solitaire;

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
    EUnauthorizedPlayer
};
use sui::clock;
use sui::random;
use sui::test_scenario::{Self, Scenario};

// Test error codes
const ETestColumnNotEmpty: u64 = 901;
const ETestIncorrectNumberOfCardsInColumnAfterMove: u64 = 902;

const PLAYER: address = @0xCAFE;
const SYSTEM_ADDRESS: address = @0x0;

// ----------------- Helper functions -----------------
fun generate_cards(num_cards: u64): vector<u64> {
    vector::tabulate!(num_cards, |i| i)
}

fun init_normal_game_scenario_helper(): Scenario {
    let mut scenario_val = test_scenario::begin(SYSTEM_ADDRESS);
    let scenario = &mut scenario_val;
    random::create_for_testing(test_scenario::ctx(scenario));
    scenario.next_tx(SYSTEM_ADDRESS);
    let random_state = scenario.take_shared<random::Random>();
    scenario.next_tx(PLAYER);
    {
        let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
        clock.set_for_testing(30);
        solitaire::init_normal_game(&clock, &random_state, test_scenario::ctx(scenario));
        clock.destroy_for_testing();
        test_scenario::return_shared(random_state);
    };
    scenario_val
}

fun init_easy_game_scenario_helper(): Scenario {
    let mut scenario_val = test_scenario::begin(SYSTEM_ADDRESS);
    let scenario = &mut scenario_val;
    random::create_for_testing(test_scenario::ctx(scenario));
    scenario.next_tx(SYSTEM_ADDRESS);
    let random_state = scenario.take_shared<random::Random>();
    scenario.next_tx(PLAYER);
    {
        let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
        clock.set_for_testing(30);
        solitaire::init_easy_game(&clock, &random_state, test_scenario::ctx(scenario));
        test_scenario::return_shared(random_state);
        clock.destroy_for_testing();
    };
    scenario_val
}

fun reveal_card_helper(num_cards: u64, random_state: random::Random) {
    let mut scenario_val = test_scenario::begin(PLAYER);
    let scenario = &mut scenario_val;
    {
        let mut available_cards = generate_cards(num_cards);
        solitaire::reveal_card_test(
            &mut available_cards,
            &random_state,
            test_scenario::ctx(scenario),
        );
    };
    test_scenario::return_shared(random_state);
    scenario_val.end();
}

// ----------------- Tests -----------------

#[test]
/// Sanity check that the normal game can be initialized
public fun init_normal_game_valid() {
    let scenario_val = init_normal_game_scenario_helper();
    scenario_val.end();
}

#[test]
/// Sanity check that the easy game can be initialized
public fun init_easy_game_valid() {
    let scenario_val = init_easy_game_scenario_helper();
    scenario_val.end();
}

#[test]
/// Test that the reveal_card function works as expected
public fun reveal_card_valid() {
    let inputs = vector<u64>[1, 52]; // reveal card from a deck of 1 and a deck of 52 cards
    let mut scenario_val = test_scenario::begin(SYSTEM_ADDRESS);
    let scenario = &mut scenario_val;
    random::create_for_testing(test_scenario::ctx(scenario));
    {
        inputs.do!(|num_cards| {
            scenario.next_tx(SYSTEM_ADDRESS);
            let random_state = scenario.take_shared<random::Random>();
            reveal_card_helper(num_cards, random_state);
        });
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = ENoMoreHiddenCards)]
public fun open_deck_card_invalid_out_of_cards() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    let random_state = scenario.take_shared<random::Random>();
    test_scenario::next_tx(scenario, PLAYER);
    // Open all the cards in the deck
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        26u64.do!(|_| {
            solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        });
        abort
    }
}

#[test]
public fun from_deck_to_column_valid_spades_8_on_hearts_9() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        // Open a deck card and move it to a column
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        // Place Hearts 9 (index 34) on column 0 first
        solitaire::cheat_place_card_to_column(&mut game, 34, 0);

        // Add Spades 8 (index 20) to deck - this is a black card that can be placed on red Hearts 9
        solitaire::cheat_open_card_to_deck(&mut game, 20);

        // Placing {index= 20, suit: "Spades", name-on-card: "8"} on {index= 34, suit: "Hearts", name-on-card:"9"}
        solitaire::from_deck_to_column(
            &mut game,
            0,
            test_scenario::ctx(scenario),
        );
        test_scenario::return_to_sender(scenario, game);
    };

    scenario_val.end();
}

#[test, expected_failure(abort_code = EInvalidPlacement)]
public fun from_deck_to_column_invalid_order_spades_8_on_hearts_5() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    let random_state = scenario.take_shared<random::Random>();
    test_scenario::next_tx(scenario, PLAYER);
    {
        // Open a deck card and move it to a column
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));

        // Placing {index= 20, suit: "Spades", name-on-card: "8"} on {index= 30, suit: "Hearts", name-on-card:"5"}
        solitaire::from_deck_to_column(
            &mut game,
            0,
            test_scenario::ctx(scenario),
        );
        abort
    }
}

#[test, expected_failure(abort_code = ENoAvailableDeckCard)]
public fun from_deck_to_column_no_available_card() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Open all the cards in the deck
        24u64.do!(|_| {
            solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        });

        solitaire::remove_all_from_deck(&mut game);
        solitaire::from_deck_to_column(
            &mut game,
            0,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = EInvalidPlacement)]
public fun from_deck_to_column_invalid_color_hearts_4_on_hearts_5() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        // Open a deck card and move it to a column
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Get {hearts 4} with a cheat function:
        solitaire::cheat_open_card_to_deck(&mut game, 29);

        // Placing {index= 20, suit: "Spades", name-on-card: "8"} on {index= 30, suit: "Hearts", name-on-card:"5"}
        solitaire::from_deck_to_column(
            &mut game,
            4,
            test_scenario::ctx(scenario),
        );
        abort
    }
}

#[test]
public fun from_deck_to_column_valid_diamonds_K_on_empty() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Empty the first column
        solitaire::remove_all_from_column(&mut game, 0);
        // Cheat to get the king of diamonds on top of the deck
        solitaire::cheat_open_card_to_deck(&mut game, 51);
        // Use the king of diamonds to place it on the empty column
        solitaire::from_deck_to_column(
            &mut game,
            0,
            test_scenario::ctx(scenario),
        );
        test_scenario::return_to_sender(scenario, game);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = ENotKingCard)]
public fun from_deck_to_column_invalid_order_diamonds_Q_on_empty() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Empty the first column
        solitaire::remove_all_from_column(&mut game, 0);
        // Cheat to get the queen of diamonds on top of the deck
        solitaire::cheat_open_card_to_deck(&mut game, 50);
        // Use the queen of diamonds to try to place it on the empty column
        solitaire::from_deck_to_column(
            &mut game,
            0,
            test_scenario::ctx(scenario),
        );
        abort
    }
}

#[test]
public fun from_deck_to_pile_valid_hearts_A_on_empty() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Cheat to get ace of hearts on top of the deck
        solitaire::cheat_open_card_to_deck(&mut game, 26);
        // Use the ace of hearts to place it on the empty pile
        solitaire::from_deck_to_pile(
            &mut game,
            0,
            test_scenario::ctx(scenario),
        );
        test_scenario::return_to_sender(scenario, game);
    };
    scenario_val.end();
}

#[test]
public fun from_deck_to_pile_valid_hearts_2_on_hearts_A() {
    // Init easy game to start with aces on the piles
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Cheat to get 2 of hearts on top of the deck
        solitaire::cheat_open_card_to_deck(&mut game, 27);

        // Use the 2 of hearts to place it on the hearts pile
        solitaire::from_deck_to_pile(
            &mut game,
            2,
            test_scenario::ctx(scenario),
        );
        test_scenario::return_to_sender(scenario, game);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = ENoAvailableDeckCard)]
public fun from_deck_to_pile_no_available_card() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        solitaire::from_deck_to_pile(
            &mut game,
            0,
            test_scenario::ctx(scenario),
        );
        abort
    }
}

#[test, expected_failure(abort_code = ENotAceCard)]
public fun from_deck_to_pile_invalid_order_diamonds_7_on_empty() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Cheat to get 7 of diamonds on top of the deck
        solitaire::cheat_open_card_to_deck(&mut game, 45);
        // Use the 7 of diamonds to place it on the empty pile
        solitaire::from_deck_to_pile(
            &mut game,
            0,
            test_scenario::ctx(scenario),
        );
        abort
    }
}

#[test, expected_failure(abort_code = EInvalidPlacement)]
public fun from_deck_to_pile_invalid_order_hearts_3_on_hearts_A() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Cheat to get 3 of hearts on top of the deck
        solitaire::cheat_open_card_to_deck(&mut game, 28);
        // Use the 3 of hearts to place it on the hearts pile
        solitaire::from_deck_to_pile(
            &mut game,
            2,
            test_scenario::ctx(scenario),
        );
        abort
    }
}

#[test, expected_failure(abort_code = EInvalidPlacement)]
public fun from_deck_to_pile_invalid_class_clubs_2_on_hearts_A() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Cheat to get 3 of hearts on top of the deck
        solitaire::cheat_open_card_to_deck(&mut game, 1);
        // Use the 3 of hearts to place it on the hearts pile
        solitaire::from_deck_to_pile(
            &mut game,
            2,
            test_scenario::ctx(scenario),
        );
        abort
    }
}

#[test]
public fun from_column_to_pile_valid_hearts_A_on_empty() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        solitaire::cheat_place_card_to_column(&mut game, 26, 0);

        // Move ace of hearts to an empty pile (e.g. pile 0)
        solitaire::from_column_to_pile(
            &mut game,
            0,
            0,
            &random_state,
            test_scenario::ctx(scenario),
        );

        // Teardown
        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test]
public fun from_column_to_pile_valid_hearts_2_on_hearts_A() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        solitaire::cheat_place_card_to_column(&mut game, 27, 0);

        // Move ace of hearts to the hearts pile that already contains an ace due to
        // an easy game start
        solitaire::from_column_to_pile(
            &mut game,
            0,
            2,
            &random_state,
            test_scenario::ctx(scenario),
        );

        // Teardown
        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = ENotAceCard)]
public fun from_column_to_pile_invalid_order_diamonds_7_on_empty() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::cheat_place_card_to_column(&mut game, 45, 0);

        solitaire::from_column_to_pile(
            &mut game,
            0,
            2,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test]
#[expected_failure(abort_code = EInvalidPlacement)]
public fun from_column_to_pile_invalid_order_hearts_3_on_hearts_A() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::cheat_place_card_to_column(&mut game, 41, 0);
        solitaire::from_column_to_pile(
            &mut game,
            0,
            2,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = EInvalidPlacement)]
public fun from_column_to_pile_invalid_class_clubs_2_on_hearts_A() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::cheat_place_card_to_column(&mut game, 1, 0);

        solitaire::from_column_to_pile(
            &mut game,
            0,
            2,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = EInvalidColumnIndex)]
public fun from_column_to_pile_invalid_column_index() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::from_column_to_pile(
            &mut game,
            7,
            2,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = EInvalidPileIndex)]
public fun from_column_to_pile_invalid_pile_index() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        solitaire::from_column_to_pile(
            &mut game,
            1,
            4,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = EColumnIsEmpty)]
public fun from_column_to_pile_column_is_empty() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        solitaire::remove_all_from_column(&mut game, 5);
        solitaire::from_column_to_pile(
            &mut game,
            5,
            3,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = ECannotPlaceOnKing)]
public fun from_column_to_pile_invalid_place_on_king() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        let ace_of_hearts = 26;
        solitaire::cheat_place_card_to_column(
            &mut game,
            ace_of_hearts,
            0,
        );

        let king_of_spades = 25;
        solitaire::cheat_place_card_to_pile(
            &mut game,
            king_of_spades,
            3,
        );

        solitaire::from_column_to_pile(
            &mut game,
            0,
            3,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test]
public fun from_column_to_column_valid_hearts_J_on_clubs_Q() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::cheat_place_card_to_column(
            &mut game,
            36,
            0,
        ); // J of hearts
        solitaire::cheat_place_card_to_column(
            &mut game,
            11,
            1,
        ); // Q of clubs

        solitaire::from_column_to_column(
            &mut game,
            0,
            36,
            1,
            &random_state,
            test_scenario::ctx(scenario),
        );

        // Teardown
        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = EInvalidPlacement)]
public fun from_column_to_column_invalid_order_spades_8_on_hearts_10() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Setup -- place 8 of spades on column 0 and 9 of hearts on column 1
        solitaire::cheat_place_card_to_column(&mut game, 20, 0); // 8 of spades
        solitaire::cheat_place_card_to_column(&mut game, 35, 1); // 9 of hearts

        solitaire::from_column_to_column(
            &mut game,
            0,
            20,
            1,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = EInvalidColumnIndex)]
public fun from_column_to_column_invalid_src_column_index() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::from_column_to_column(
            &mut game,
            7,
            20,
            1,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = EInvalidColumnIndex)]
public fun from_column_to_column_invalid_dest_column_index() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::from_column_to_column(
            &mut game,
            0,
            20,
            7,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test]
public fun from_column_to_column_valid_multiple_cards() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Put 2 cards on column 0. It's ok to cheat here, just don't tell anyone.
        solitaire::cheat_place_card_to_column(&mut game, 38, 0);
        solitaire::cheat_place_card_to_column(&mut game, 37, 0);
        // Remove the card from column 1 so that we can move anything to it
        solitaire::remove_all_from_column(&mut game, 1);

        // Both cheat-placed cards should be moved to column 1.
        solitaire::from_column_to_column(
            &mut game,
            0,
            38,
            1,
            &random_state,
            test_scenario::ctx(scenario),
        );
        assert!(solitaire::get_num_cards_in_column(&game, 0) == 1, ETestColumnNotEmpty);
        assert!(
            solitaire::get_num_cards_in_column(&game, 1) == 2,
            ETestIncorrectNumberOfCardsInColumnAfterMove,
        );

        // Teardown
        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test]
public fun from_column_to_column_valid_to_same_column() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::remove_all_from_column(&mut game, 0);

        // Put 2 cards on column 0. It's ok to cheat here, just don't tell anyone.
        solitaire::cheat_place_card_to_column(&mut game, 38, 0);
        solitaire::cheat_place_card_to_column(&mut game, 37, 0);

        // Both cheat-placed cards should be moved to column 1.
        solitaire::from_column_to_column(
            &mut game,
            0,
            38,
            0,
            &random_state,
            test_scenario::ctx(scenario),
        );

        assert!(
            solitaire::get_num_cards_in_column(&game, 0) == 2,
            ETestIncorrectNumberOfCardsInColumnAfterMove,
        );

        // Teardown
        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = ECardNotInColumn)]
public fun from_column_to_column_invalid_card_not_in_column() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::from_column_to_column(
            &mut game,
            0,
            70,
            1,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = ENotKingCard)]
public fun from_column_to_column_invalid_clubs_3_on_empty() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::cheat_place_card_to_column(&mut game, 4, 0);
        solitaire::remove_all_from_column(&mut game, 1);
        solitaire::from_column_to_column(
            &mut game,
            0,
            4,
            1,
            &random_state,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test]
public fun from_column_to_column_valid_clubs_K_on_empty() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::cheat_place_card_to_column(&mut game, 12, 0);

        solitaire::remove_all_from_column(&mut game, 1);

        solitaire::from_column_to_column(
            &mut game,
            0,
            12,
            1,
            &random_state,
            test_scenario::ctx(scenario),
        );

        // Teardown
        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = EInvalidPileIndex)]
public fun from_pile_to_column_invalid_pile_index() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        solitaire::remove_all_from_column(&mut game, 4);

        solitaire::from_pile_to_column(
            &mut game,
            4,
            4,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test, expected_failure(abort_code = EInvalidColumnIndex)]
public fun from_pile_to_column_invalid_column_index() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        solitaire::remove_all_from_column(&mut game, 4);

        solitaire::from_pile_to_column(
            &mut game,
            0,
            7,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test]
public fun from_pile_to_column_valid_clubs_2_on_diamonds_3() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        solitaire::cheat_place_card_to_pile(&mut game, 41, 1);
        solitaire::cheat_place_card_to_column(&mut game, 3, 4);

        solitaire::from_pile_to_column(
            &mut game,
            1,
            4,
            test_scenario::ctx(scenario),
        );

        test_scenario::return_to_sender(scenario, game);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = ECannotPlaceOnAce)]
public fun from_pile_to_column_invalid_spades_K_on_hearts_A() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        // Setup
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::cheat_place_card_to_column(&mut game, 26, 4);
        solitaire::cheat_place_card_to_pile(&mut game, 25, 3);

        solitaire::from_pile_to_column(
            &mut game,
            3,
            4,
            test_scenario::ctx(scenario),
        );

        abort
    }
}

#[test]
public fun turn_deck_card_valid_reveal_all_and_iterate_2_times() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        24u64.do!(|_| {
            solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        });
        // iterate the whole deck 2 times
        48u64.do!(|_| {
            solitaire::rotate_open_deck_cards(&mut game, test_scenario::ctx(scenario));
        });
        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test]
public fun rotate_deck_and_reveal_all_cards() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        24u64.do!(|_| {
            solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        });
        // iterate the whole deck 2 times
        solitaire::rotate_open_deck_cards(&mut game, test_scenario::ctx(scenario));
        solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));

        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = EInvalidTurnDeckCard)]
public fun invalid_turn_deck_card() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        solitaire::rotate_open_deck_cards(&mut game, test_scenario::ctx(scenario));

        abort
    }
}

#[test]
public fun finish_game_valid_finished() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::cheat_fill_all_piles(&mut game);
        solitaire::finish_game(game, test_scenario::ctx(scenario));
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = EGameNotFinished)]
public fun finish_game_invalid_not_finished() {
    let mut scenario_val = init_easy_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let game = test_scenario::take_from_sender<Game>(scenario);
        solitaire::finish_game(game, test_scenario::ctx(scenario));
        abort
    }
}

#[test]
public fun delete_unfinished_game_valid() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let game = test_scenario::take_from_sender<Game>(scenario);
        // Game is unfinished by default, so this should succeed
        solitaire::delete_unfinished_game(game, test_scenario::ctx(scenario));
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = EGameHasFinished)]
public fun delete_unfinished_game_invalid_already_finished() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Fill all piles to make the game finished
        solitaire::cheat_fill_all_piles(&mut game);
        // This should fail because the game is now finished
        solitaire::delete_unfinished_game(game, test_scenario::ctx(scenario));
        abort
    }
}

#[test]
public fun delete_unfinished_game_valid_partially_complete() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Fill only 3 out of 4 piles completely (leaving one incomplete)
        solitaire::cheat_place_card_to_pile(&mut game, 0, 0); // Clubs A
        solitaire::cheat_place_card_to_pile(&mut game, 1, 0); // Clubs 2
        solitaire::cheat_place_card_to_pile(&mut game, 2, 0); // Clubs 3
        solitaire::cheat_place_card_to_pile(&mut game, 3, 0); // Clubs 4
        solitaire::cheat_place_card_to_pile(&mut game, 4, 0); // Clubs 5
        solitaire::cheat_place_card_to_pile(&mut game, 5, 0); // Clubs 6
        solitaire::cheat_place_card_to_pile(&mut game, 6, 0); // Clubs 7
        solitaire::cheat_place_card_to_pile(&mut game, 7, 0); // Clubs 8
        solitaire::cheat_place_card_to_pile(&mut game, 8, 0); // Clubs 9
        solitaire::cheat_place_card_to_pile(&mut game, 9, 0); // Clubs 10
        solitaire::cheat_place_card_to_pile(&mut game, 10, 0); // Clubs J
        solitaire::cheat_place_card_to_pile(&mut game, 11, 0); // Clubs Q
        solitaire::cheat_place_card_to_pile(&mut game, 12, 0); // Clubs K

        // Fill pile 1 (Spades) completely
        solitaire::cheat_place_card_to_pile(&mut game, 13, 1); // Spades A
        solitaire::cheat_place_card_to_pile(&mut game, 14, 1); // Spades 2
        solitaire::cheat_place_card_to_pile(&mut game, 15, 1); // Spades 3
        solitaire::cheat_place_card_to_pile(&mut game, 16, 1); // Spades 4
        solitaire::cheat_place_card_to_pile(&mut game, 17, 1); // Spades 5
        solitaire::cheat_place_card_to_pile(&mut game, 18, 1); // Spades 6
        solitaire::cheat_place_card_to_pile(&mut game, 19, 1); // Spades 7
        solitaire::cheat_place_card_to_pile(&mut game, 20, 1); // Spades 8
        solitaire::cheat_place_card_to_pile(&mut game, 21, 1); // Spades 9
        solitaire::cheat_place_card_to_pile(&mut game, 22, 1); // Spades 10
        solitaire::cheat_place_card_to_pile(&mut game, 23, 1); // Spades J
        solitaire::cheat_place_card_to_pile(&mut game, 24, 1); // Spades Q
        solitaire::cheat_place_card_to_pile(&mut game, 25, 1); // Spades K

        // Fill pile 2 (Hearts) completely
        solitaire::cheat_place_card_to_pile(&mut game, 26, 2); // Hearts A
        solitaire::cheat_place_card_to_pile(&mut game, 27, 2); // Hearts 2
        solitaire::cheat_place_card_to_pile(&mut game, 28, 2); // Hearts 3
        solitaire::cheat_place_card_to_pile(&mut game, 29, 2); // Hearts 4
        solitaire::cheat_place_card_to_pile(&mut game, 30, 2); // Hearts 5
        solitaire::cheat_place_card_to_pile(&mut game, 31, 2); // Hearts 6
        solitaire::cheat_place_card_to_pile(&mut game, 32, 2); // Hearts 7
        solitaire::cheat_place_card_to_pile(&mut game, 33, 2); // Hearts 8
        solitaire::cheat_place_card_to_pile(&mut game, 34, 2); // Hearts 9
        solitaire::cheat_place_card_to_pile(&mut game, 35, 2); // Hearts 10
        solitaire::cheat_place_card_to_pile(&mut game, 36, 2); // Hearts J
        solitaire::cheat_place_card_to_pile(&mut game, 37, 2); // Hearts Q
        solitaire::cheat_place_card_to_pile(&mut game, 38, 2); // Hearts K

        // Leave pile 3 (Diamonds) with only a few cards - incomplete
        solitaire::cheat_place_card_to_pile(&mut game, 39, 3); // Diamonds A
        solitaire::cheat_place_card_to_pile(&mut game, 40, 3); // Diamonds 2
        solitaire::cheat_place_card_to_pile(&mut game, 41, 3); // Diamonds 3

        // This should succeed because pile 3 is incomplete (only 3 cards instead of 13)
        solitaire::delete_unfinished_game(game, test_scenario::ctx(scenario));
    };
    scenario_val.end();
}

#[test]
public fun open_deck_card_valid() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Should successfully open a deck card
        solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = EUnauthorizedPlayer)]
public fun from_deck_to_column_invalid_unauthorized_player() {
    let mut scenario_val = test_scenario::begin(SYSTEM_ADDRESS);
    let scenario = &mut scenario_val;
    random::create_for_testing(test_scenario::ctx(scenario));
    scenario.next_tx(SYSTEM_ADDRESS);
    let random_state = scenario.take_shared<random::Random>();
    scenario.next_tx(PLAYER);
    {
        let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
        clock.set_for_testing(30);
        solitaire::init_normal_game(&clock, &random_state, test_scenario::ctx(scenario));
        clock.destroy_for_testing();
    };
    scenario.next_tx(@0xBAD); // Different player tries to access
    {
        let mut game = test_scenario::take_from_address<Game>(scenario, PLAYER); // Game belongs to PLAYER
        // This should fail with unauthorized player since @0xBAD is trying to access PLAYER's game
        solitaire::from_deck_to_column(&mut game, 0, test_scenario::ctx(scenario));
        abort
    }
}

#[test, expected_failure(abort_code = ECannotPlaceOnAce)]
public fun from_deck_to_column_invalid_place_on_ace() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Place an Ace in column 0
        solitaire::cheat_place_card_to_column(&mut game, 0, 0); // Clubs Ace
        // Try to place any card on the Ace from deck
        solitaire::cheat_open_card_to_deck(&mut game, 1); // Clubs 2
        solitaire::from_deck_to_column(&mut game, 0, test_scenario::ctx(scenario));
        abort
    }
}

#[test, expected_failure(abort_code = ECannotPlaceOnAce)]
public fun from_pile_to_column_invalid_place_on_ace() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Place an Ace in column 0
        solitaire::cheat_place_card_to_column(&mut game, 0, 0); // Clubs Ace
        // Place a card in pile and try to move it to ace column
        solitaire::cheat_place_card_to_pile(&mut game, 1, 0); // Clubs 2 in pile
        solitaire::from_pile_to_column(&mut game, 0, 0, test_scenario::ctx(scenario));
        abort
    }
}

#[test, expected_failure(abort_code = ECannotPlaceOnAce)]
public fun from_column_to_column_invalid_place_on_ace() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Place an Ace in column 0
        solitaire::cheat_place_card_to_column(&mut game, 0, 0); // Clubs Ace
        // Place a 2 in column 1
        solitaire::cheat_place_card_to_column(&mut game, 1, 1); // Clubs 2
        // Try to move 2 onto Ace - should fail
        solitaire::from_column_to_column(
            &mut game,
            1,
            1,
            0,
            &random_state,
            test_scenario::ctx(scenario),
        );
        abort
    }
}

#[test]
public fun test_hidden_card_reveal_from_column_to_pile() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Set up column 0 with a single visible card and some hidden cards
        solitaire::remove_all_from_column(&mut game, 0);
        solitaire::cheat_place_card_to_column(&mut game, 26, 0); // Hearts A

        // Move the visible card to pile, which should reveal a hidden card
        solitaire::from_column_to_pile(
            &mut game,
            0,
            0,
            &random_state,
            test_scenario::ctx(scenario),
        );

        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test]
public fun test_hidden_card_reveal_from_column_to_column() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Set up source column with a single visible card
        solitaire::remove_all_from_column(&mut game, 0);
        solitaire::cheat_place_card_to_column(&mut game, 25, 0); // Spades K
        // Set up empty destination column
        solitaire::remove_all_from_column(&mut game, 1);

        // Move King to empty column, should reveal hidden card in source
        solitaire::from_column_to_column(
            &mut game,
            0,
            25,
            1,
            &random_state,
            test_scenario::ctx(scenario),
        );

        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test, expected_failure(abort_code = EUnauthorizedPlayer)]
public fun open_deck_card_invalid_unauthorized_player() {
    let mut scenario_val = test_scenario::begin(SYSTEM_ADDRESS);
    let scenario = &mut scenario_val;
    random::create_for_testing(test_scenario::ctx(scenario));
    scenario.next_tx(SYSTEM_ADDRESS);
    let random_state = scenario.take_shared<random::Random>();
    scenario.next_tx(PLAYER);
    {
        let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
        clock.set_for_testing(30);
        solitaire::init_normal_game(&clock, &random_state, test_scenario::ctx(scenario));
        clock.destroy_for_testing();
    };
    scenario.next_tx(@0xBAD); // Different player tries to access
    {
        let mut game = test_scenario::take_from_address<Game>(scenario, PLAYER);
        solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        abort
    }
}

#[test, expected_failure(abort_code = EUnauthorizedPlayer)]
public fun rotate_open_deck_cards_invalid_unauthorized_player() {
    let mut scenario_val = test_scenario::begin(SYSTEM_ADDRESS);
    let scenario = &mut scenario_val;
    random::create_for_testing(test_scenario::ctx(scenario));
    scenario.next_tx(SYSTEM_ADDRESS);
    let random_state = scenario.take_shared<random::Random>();
    scenario.next_tx(PLAYER);
    {
        let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
        clock.set_for_testing(30);
        solitaire::init_normal_game(&clock, &random_state, test_scenario::ctx(scenario));
        clock.destroy_for_testing();
    };
    // First open all deck cards
    scenario.next_tx(PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        24u64.do!(|_| {
            solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        });
        test_scenario::return_to_sender(scenario, game);
    };
    scenario.next_tx(@0xBAD); // Different player tries to access
    {
        let mut game = test_scenario::take_from_address<Game>(scenario, PLAYER);
        solitaire::rotate_open_deck_cards(&mut game, test_scenario::ctx(scenario));
        abort
    }
}

#[test]
public fun color_validation_red_on_black_comprehensive() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Test Hearts card (red) on Clubs card (black)
        solitaire::cheat_place_card_to_column(&mut game, 11, 0); // Clubs Q (black)
        solitaire::cheat_open_card_to_deck(&mut game, 36); // Hearts J (red)
        solitaire::from_deck_to_column(&mut game, 0, test_scenario::ctx(scenario));
        test_scenario::return_to_sender(scenario, game);
    };
    scenario_val.end();
}

#[test]
public fun color_validation_black_on_red_comprehensive() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, PLAYER);
    {
        let mut game = test_scenario::take_from_sender<Game>(scenario);
        // Test Spades card (black) on Diamonds card (red)
        solitaire::cheat_place_card_to_column(&mut game, 50, 0); // Diamonds Q (red)
        solitaire::cheat_open_card_to_deck(&mut game, 23); // Spades J (black)
        solitaire::from_deck_to_column(&mut game, 0, test_scenario::ctx(scenario));
        test_scenario::return_to_sender(scenario, game);
    };
    scenario_val.end();
}

#[test]
public fun test_deck_cycling_basic() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        // First, reveal all 24 cards from the deck
        24u64.do!(|_| {
            solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        });

        // Store the initial deck size
        let initial_deck_size = solitaire::get_deck_cards_length(&game);

        // Now call rotate_open_deck_cards to enable cycling
        solitaire::rotate_open_deck_cards(&mut game, test_scenario::ctx(scenario));

        // After rotation, we should be able to cycle through the existing cards
        // Call open_deck_card a few times to verify it cycles through existing cards
        3u64.do!(|_| {
            solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        });

        // Verify deck size hasn't changed (no new cards added)
        assert!(solitaire::get_deck_cards_length(&game) == initial_deck_size, 0);

        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}

#[test]
public fun test_deck_rotation_changes_order() {
    let mut scenario_val = init_normal_game_scenario_helper();
    let scenario = &mut scenario_val;
    test_scenario::next_tx(scenario, SYSTEM_ADDRESS);
    random::create_for_testing(test_scenario::ctx(scenario));
    test_scenario::next_tx(scenario, PLAYER);
    {
        let random_state = scenario.take_shared<random::Random>();
        let mut game = test_scenario::take_from_sender<Game>(scenario);

        // Reveal all cards
        24u64.do!(|_| {
            solitaire::open_deck_card(&mut game, &random_state, test_scenario::ctx(scenario));
        });

        // Get the top card before rotation
        let top_card_before_rotation = solitaire::get_top_card_of_deck(&game);

        // Rotate the deck
        solitaire::rotate_open_deck_cards(&mut game, test_scenario::ctx(scenario));

        // Get the top card after rotation (should be different)
        let top_card_after_rotation = solitaire::get_top_card_of_deck(&game);

        // The top card should have changed due to rotation
        assert!(top_card_before_rotation != top_card_after_rotation, 0);

        test_scenario::return_to_sender(scenario, game);
        test_scenario::return_shared(random_state);
    };
    scenario_val.end();
}
