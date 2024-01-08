!constant SYSTEM_NAME "Solitaire dApp"

workspace {
    model {
        user = person "User" "A user having a wallet that supports Sui."

        game = softwareSystem "${SYSTEM_NAME}" "Allows users to play solitaire on the Sui network." {
            group "Frontend" {
                webappComp = container "Web Application" "Delivers the UI as a single page application." "next.js"
                singlePageApplicationCont = container "Single-Page-Application" "A single page application were the player interacts with the game." "React" {
                    authenticator = component "Authenticator" "Handles the user's transaction authentication." "zklogin"
                    gameBoard = component "Game Board" "Allows the user to interact with the game board and the cards." "React, Sui TS-SDK" {
                        tags "game board"
                    }
                    assets = component "Assets" "Contains card icons, poker table look and other designs." "PNG, JPEG, SVG" {
                        tags "assets"
                    }
                    tags "SPA"
                }
            }
            group "Web3 Layer" {
                smartContractCont = container "Smart Contract" "Contains all the game logic/rules. Each player move is a call to the smart contract." "Sui Move" {
                    tags "smart contract"
                    //
                    solitaireModule = component "Solitaire Module" "Contains the game logic/rules."

                    group "Game modes" {
                        normalMode = component "init_normal_game(...)" "Produces a Game object with a shuffled Deck and empty Piles."
                        easyMode = component "init_easy_game(...)" "Produces a Game which has all the Aces placed on the Piles."
                    }

                    group "Game state" {
                        gameStruct = component "Game Struct" "Contains the game's state: The Player address, Deck, the Piles, the Columns, etc."
                        deckStruct = component "Deck Struct" "Contains 24 cards that are not yet in the game (they are hidden); new cards are pulled from here."
                        pileStruct = component "Pile Struct" "The game's goal: To win, each Pile (of cards) should be ordered from Ace to King of the same suit."
                        columnStruct = component "Column Struct" "The game's main area: The Columns. Each Column can contain a stack of cards, which are ordered from King to Ace, alternating between red and black."
                    }

                    group "Game actions" {
                        fromDeckToColumn = component "from_deck_to_column(...)" "Moves a card from the Deck to a Column."
                        fromDeckToPile = component "from_deck_to_pile(...)" "Moves a card from the Deck to a Pile."
                        fromColumnToPile = component "from_column_to_pile(...)" "Moves a card from a Column to a Pile."
                        fromColumnToColumn = component "from_column_to_column(...)" "Moves a card from a Column to another Column."
                        fromPileToColumn = component "from_pile_to_column(...)" "Moves a card from a Pile to a Column."
                    }

                }
            }
        }

        # Context level relationships
        user -> game "Plays"

        # Component level relationships
        user -> singlePageApplicationCont "Signs in, starts/ends game, moves cards around"
        user -> webappComp "Requests page from" "HTTP"
        webappComp -> singlePageApplicationCont "Delivers to the user's browser" "HTTP"
        singlePageApplicationCont -> smartContractCont "Makes move calls"
        authenticator -> gameBoard "Authenticates transactions of"
        assets -> gameBoard "Get displayed on"

        user -> authenticator "Signs in with"
        user -> gameBoard "Plays on"

        gameBoard -> smartContractCont "Makes move calls to"

        # Smart contract's component relationships
        gameBoard -> solitaireModule "Makes move calls to"
        solitaireModule -> normalMode "Uses to initialize a game object"
        solitaireModule -> easyMode "Uses to initialize a game object"
        normalMode -> gameStruct "Generates"
        easyMode -> gameStruct "Generates"

        // Struct ownership
        gameStruct -> deckStruct "Owns"
        gameStruct -> pileStruct "Owns"
        gameStruct -> columnStruct "Owns"

        // Function calls
        fromDeckToColumn -> deckStruct "Modifies"
        fromDeckToColumn -> columnStruct "Modifies"

        fromDeckToPile -> deckStruct "Modifies"
        fromDeckToPile -> pileStruct "Modifies"

        fromColumnToPile -> columnStruct "Modifies"
        fromColumnToPile -> pileStruct "Modifies"

        fromColumnToColumn -> columnStruct "Modifies"

        fromPileToColumn -> pileStruct "Modifies"
        fromPileToColumn -> columnStruct "Modifies"
    }

    views {
        systemContext game "GameContextView" {
            include *
            autolayout lr
        }

        container game "GameContainerView" {
            include *
            autolayout
        }

        component singlePageApplicationCont "SinglePageApplicationComponentView" {
            include *
            autolayout
        }

        component smartContractCont "SmartContractComponentView" {
            include *
        }

        styles {
            element "SPA" {
                shape WebBrowser
            }
            element "assets" {
                shape Folder
            }
            element "game board" {
                background #107C10
                color #FFFFFF
            }
        }

        themes default
    }

}