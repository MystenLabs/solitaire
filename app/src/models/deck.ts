// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
export interface Deck {
    cards: String[];
    hidden_cards: number;
    open_cards: number;
    has_revealed_all_cards: boolean;
}