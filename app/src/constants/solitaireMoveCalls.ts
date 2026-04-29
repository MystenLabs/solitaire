// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * Single source of truth for all Move calls needed by the game flow.
 * Keep this list in sync with gameplay transaction builders.
 */
export const SOLITAIRE_GAMEPLAY_FUNCTIONS = [
  "init_normal_game",
  "init_easy_game",
  "from_deck_to_column",
  "from_deck_to_pile",
  "from_column_to_pile",
  "from_column_to_column",
  "from_pile_to_column",
  "open_deck_card",
  "rotate_open_deck_cards",
  "finish_game",
  "delete_unfinished_game",
] as const;

export const getSolitaireMoveCallTargets = (packageAddress: string) =>
  SOLITAIRE_GAMEPLAY_FUNCTIONS.map(
    (fn) => `${packageAddress}::solitaire::${fn}`
  );
