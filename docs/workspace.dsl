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
    }

    views {
        systemContext game "Context" {
            include *
            autolayout lr
        }

        container game "Container" {
            include *
            autolayout
        }

        component singlePageApplicationCont "Component" {
            include *
            autolayout
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