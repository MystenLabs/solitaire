"use client";
import React, { useContext, useState } from "react";
import { DifficultySelection } from "@/components/difficultySelection/DifficultySelection";
import { useAuthentication } from "@/contexts/Authentication";
import { Spinner } from "@/components/general/Spinner";
import GameBoard from "@/components/gameBoard/GameBoard";
import {Game} from "@/models/game";
import {useSolitaireActions} from "@/hooks/useSolitaireActions";
import {AccountDropdown} from "@/components/user/accountDropdown";
import { LoadingContext } from "@/contexts/LoadingProvider";


const GamePage = () => {
  const [spinning, setSpinning] = useState<boolean>(false);
  const { user, isLoading, enokiFlow } = useAuthentication();
  const [game, setGame] = useState<Game | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const {
    handleExecuteInitEasyGame,
    handleExecuteInitNormalGame,
    handleDeleteUnfinishedGame,
  } = useSolitaireActions();
  const { isMoveLoading } = useContext(LoadingContext);

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
    console.log(game.id);
    setGame(game);
  }

  if (isLoading || spinning) {
    return <Spinner />;
  }

  return (
    <div className={`min-h-screen overflow-hidden ${isMoveLoading ? 'cursor-wait' : 'cursor-default'}`}>
      <div className="flex align-bottom pt-10 px-20 justify-between">
        <div className="logo text-white text-[28px] font-bold font-['Mysten Walter Alte']">
          Mysten Solitaire
        </div>
        {game && (
          <div className="flex justify-center items-center gap-x-10 pl-4 pr-1 bg-black bg-opacity-10 rounded-[40px] border border-black border-opacity-10">
              <div className="text-stone-100 text-base font-normal">Moves: {moves}</div>
              <button onClick={
                async () => {
                  setSpinning(true);
                  try {
                    console.log('Deleting unfinished game');
                    await handleDeleteUnfinishedGame(game.id);
                    setGame(null);
                    setMoves(0);
                  } catch (e) {
                    console.debug(e)
                  }
                  setSpinning(false);
                }
              } className={`${isMoveLoading ? 'cursor-wait' : ''} text-white text-base font-bold bg-black rounded-[40px] p-2`}>
                End game
              </button>
          </div>
        )}
        <AccountDropdown user={user} enokiFlow={enokiFlow} />
      </div>
      {!game ? (
        <div className="flex flex-col justify-center items-center mt-32">
          <DifficultySelection onGameCreation={onGameCreation} />
        </div>
      ) : (
        <GameBoard game={game.elements} move={{moves, setMoves}} />
      )}
    </div>
  );
};

export default GamePage;
