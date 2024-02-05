"use client";
import React, { useState } from "react";
import { DifficultySelection } from "@/components/difficultySelection/DifficultySelection";
import google from "../../../../app/public/assets/logos/google_email.svg";
import Image from "next/image";
import { useAuthentication } from "@/contexts/Authentication";
import { Spinner } from "@/components/general/Spinner";
import GameBoard from "@/components/gameBoard/GameBoard";
import {Game} from "@/models/game";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519"
import { fromB64 } from "@mysten/sui.js/utils";
import {useSolitaireActions} from "@/hooks/useSolitaireActions";


const GamePage = () => {
  const [spinning, setSpinning] = useState<boolean>(false);
  const { user, isLoading } = useAuthentication();
  const [game, setGame] = useState<Game | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const { handleExecuteInitEasyGame, handleExecuteInitNormalGame} = useSolitaireActions();

  const onGameCreation = async (mode: 'easy' | 'normal') => {
    setSpinning(true);
    let game: Game | undefined = undefined;
    if (mode === 'easy') {
      game = await handleExecuteInitEasyGame();
    } else if (mode === 'normal') {
      game = await handleExecuteInitNormalGame();
    } else {
      throw new Error('Invalid difficulty mode');
    }
    if (!game) {
      throw new Error('Failed to initialize game');
    }
    setSpinning(false);
    setGame(game);
  }

  if (isLoading || spinning) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen">
      <div className="flex align-bottom pt-10 px-20 justify-between">
        <div className="logo text-white text-[28px] font-bold font-['Mysten Walter Alte']">
          Mysten Solitaire
        </div>
        {game && (
          <div className="flex justify-center items-center gap-x-4 pl-4 pr-1 bg-black bg-opacity-10 rounded-[40px] border border-black border-opacity-10">
              <div className="text-stone-100 text-base font-normal">Moves: {moves}</div>
              <div className="text-stone-100 text-base font-normal">Time: 00:00</div>
              <button className="text-white text-base font-bold font-normal bg-black rounded-[40px] p-2">End game</button>
          </div>
        )}
        <div className="flex gap-2 email pl-2 pr-3.5 py-3 left-0 top-0 rounded-[36px] border border-white border-opacity-40 items-center max-h-12">
          <div>
            <Image src={google} alt={"Logo of google"} />
          </div>
          <div className="text-center text-white text-base font-normal font-['Mysten Walter Alte'] leading-tight">
            {user?.email}
          </div>
        </div>
      </div>
      {!game ? (
        <div className="flex flex-col justify-center items-center mt-32">
          <DifficultySelection onGameCreation={onGameCreation} />
        </div>
      ) : (
        <GameBoard gameId={game.id} />
      )}
    </div>
  );
};

export default GamePage;
