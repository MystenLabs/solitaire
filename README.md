# ♠️ ♥️ Solitaire  ♣️ ♦️

### Introduction

The following documentation goes through an example implementation of the popular game Solitaire on Sui. This guide walks through its components, providing a detailed look at the module's functions, structures, constants, and their significance in the overall gameplay mechanism.

The Blockchain-based Single Player Solitaire Game is designed to provide a decentralized and secure gaming experience for enthusiasts of the classic Solitaire card game. Leveraging blockchain technology ensures transparency, immutability, fairness and transaction speed in the gaming process. This use case outlines the key features and benefits of integrating Solitaire with Sui for a single-player gaming experience.

### Gameplay

In this on-chain version of Klondike solitaire, the player creates a game whose rules are entirely governed by the smart contract. 
The player has the ability to choose between two modes: Normal mode which is the original Klondike solitaire and Easy mode which is a game with all the Aces placed on the piles.
After initiating the game, the player has to place all the cards starting from Ace to King of each suit to the respective pile. The allowed moves are opening one deck card each time, placing a card from deck to column or a pile, placing a card from column to a different column or a pile and placing a card from pile to column. When the player manages to place all cards to the 4 piles, he needs to click the button “View Results” to register the win onchain and be able to view the history of past games.

### Smart Contracts

The smart contract of Solitaire consists of one module `solitaire.move` which includes all the rules and the state of the game.

**Constants:**
Those constants are some indexes that serve as a reference for solitaire rules enforcing

```rust
    const CARD_COUNT: u64 = 52;
    const PILE_COUNT: u64 = 4;
    const COLUMN_COUNT: u64 = 7;
    const CLUBS_INDEX: u64 = 0;
    const SPADES_INDEX: u64 = 13;
    const HEARTS_INDEX: u64 = 26;
    const DIAMONDS_INDEX: u64 = 39;
```

**Structs:**
As mentioned above the entire game is an onchain object which is represented by the `Game` struct:

```rust
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
```

The `Deck` object starts with all the cards hidden, and each time a card is revealed, it is added in the card vector of the Deck, with the `open_deck_card` function. Once all cards are revealed, the function `rotate_open_deck_cards` is used to get the next card.

The piles vector consists of the 4 piles and each `Pile` object has the cards that are placed on top of it. 
The columns vector consists of the 7 columns and each `Column` object has a number of hidden_cards and a vector with the cards that are placed on it.
The `available_cards` vector contains all the cards that are not revealed yet.
**Game as Owned Object:**
Each game created with the function `init_normal_game` or `init_easy_game` is a single owned object by the account who invokes one of those functions. With that approach we ensure that move transactions are executed with low latency since we take advantage of the fast path. 

**Randomisation:**

Until a native solution is provided for accessing random values, we are using the [clock module](https://docs.sui.io/guides/developer/sui-101/access-time) that utilizes an on-chain clock when we need to pick a single random card. 
There is a limitation that we can get a clock value only once per transaction block. 

This means that if we need to have more than one random number (i.e. more than one random card pick such in game initialization), we had to create our own pseudorandom function: `pseudo_random(seed: **u64**)`. 

### Frontend

In the development of our frontend, we have leveraged Next.js alongside React, as well as the [Sui TypeScript SDK](https://github.com/MystenLabs/sui/tree/main/sdk/typescript) to facilitate interactions with the smart contract. 
To enhance the user experience, we have integrated the game rules directly within the frontend interface. 
This  approach ensures that users are guided through legal gameplay, preventing potential transaction errors whenever an illegal move is attempted.

### System Overview

A C4 diagram is available to visually represent all the aforementioned components and their interactions here: [https://github.com/MystenLabs/solitaire/tree/main/docs](https://github.com/MystenLabs/solitaire/tree/main/docs).
To access the diagram you can either:

1. Copy+paste the contents of **[workspace.dsl](https://github.com/MystenLabs/solitaire/blob/main/docs/workspace.dsl)** to the [structurizr’s DSL](https://structurizr.com/dsl)  
2. Run `docker compose up` and access the diagram on `localhost:8080`
