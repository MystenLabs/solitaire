// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
"use client";
import { ModeVisual } from "@/components/difficultySelection/difficultyModes/modeVisual";
import easy_mode_visual from "../../../public/assets/difficultyModesVisuals/easy_mode_visual.svg";
import normal_mode_visual from "../../../public/assets/difficultyModesVisuals/normal_mode_visual.svg";

export const DifficultySelection = ({
  onGameCreation,
}: {
  onGameCreation: (mode: "easy" | "normal") => void;
}) => {
  const startGame = (mode: "easy" | "normal") => {
    onGameCreation(mode);
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-10 backdrop-blur-2xl">
      <p
        className={
          "title font-inter mb-10 pt-14 text-center text-2xl font-bold text-black"
        }
      >
        Choose Your Difficulty
      </p>
      <div className={"modes-container grid grid-cols-2 gap-5 pb-14"}>
        <button
          onClick={ () => {
            startGame("easy");
          }}
        >
          <ModeVisual
            level={"Easy"}
            description={"Start with all aces placed"}
            mode={easy_mode_visual}
          />
        </button>
        <button
          onClick={ () => {
            startGame("normal");
          }}
        >
          <ModeVisual
            level={"Normal"}
            description={"Start with aces in deck"}
            mode={normal_mode_visual}
          />
        </button>
      </div>
    </div>
  );
};
