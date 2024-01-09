#[test_only]
module solitaire::test_solitaire {
    use std::string::{Self};
    use sui::test_scenario::{Self, Scenario};
    use sui::sui::SUI;
    use sui::object::{ID};

    use solitaire::solitaire::{
        Self,
        Game,
        Deck,
        Column,
        Pile,
        ENoMoreHiddenCards,
        ECardNotInDeck,
        ENotKingCard,
        EInvalidPlacement,
        ECannotPlaceOnAce,
        ENotAceCard,
        ECannotPlaceOnKing,
        EColumnIsEmpty,
        ECardNotInColumn,
        EInvalidColumnIndex,
        EInvalidPileIndex,
    };

    // Test address
    const USER: address = @0xCAFE;

}