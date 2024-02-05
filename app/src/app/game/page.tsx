"use client";

import React, { useState } from "react";
import { DifficultySelection } from "@/components/difficultySelection/DifficultySelection";
import { useAuthentication } from "@/contexts/Authentication";
import { Spinner } from "@/components/general/Spinner";
import GameBoard from "@/components/gameBoard/GameBoard";
import {AccountDropdown} from "@/components/user/accountDropdown";

const GamePage = () => {
  const { user, isLoading, enokiFlow } = useAuthentication();
  const [gameId, setGameId] = useState<string | null>("123");
  const [moves, setMoves] = useState<number>(0);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen">
      <div className="flex align-bottom pt-10 px-20 justify-between">
        <div className="logo text-white text-[28px] font-bold font-['Mysten Walter Alte']">
          Mysten Solitaire
        </div>
        {gameId && (
          <div className="flex justify-center items-center gap-x-4 pl-4 pr-1 bg-black bg-opacity-10 rounded-[40px] border border-black border-opacity-10">
              <div className="text-stone-100 text-base font-normal">Moves: {moves}</div>
              <div className="text-stone-100 text-base font-normal">Time: 00:00</div>
              <button className="text-white text-base font-bold font-normal bg-black rounded-[40px] p-2">End game</button>
          </div>
        )}
        <AccountDropdown user={user} enokiFlow={enokiFlow} />
      </div>
      {!gameId ? (
        <div className="flex flex-col justify-center items-center mt-32">
          <DifficultySelection />
        </div>
      ) : (
        <GameBoard gameId={gameId} />
      )}
    </div>
  );
};

export default GamePage;
