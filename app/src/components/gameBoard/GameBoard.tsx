"use client";

import { useContext, useState } from "react";
import { Pile as PileProps } from "../../models/pile";
import { Column as ColumnProps } from "../../models/column";
import { Deck as DeckProps } from "../../models/deck";
import { Card } from "../cards/Card";
import { useSolitaireActions } from "@/hooks/useSolitaireActions";
import toast from "react-hot-toast";
import { DndContext } from "@dnd-kit/core";
import Pile from "./Pile";
import Column from "./Column";
import { EmptyDroppable } from "./EmptyDroppable";
import { useSolitaireGameMoves } from "@/hooks/useSolitaireGameMoves";
import { findCardOriginType } from "@/helpers/cardOrigin";
import { cardIdToSvg } from "@/helpers/cardMappings";
import Image from "next/image";
import circleArrow from "../../../public/circle-arrow-icon.svg";
import { LoadingContext } from "@/contexts/LoadingProvider";
import FinishGame from "./FinishGame";
import WonModal from "./WonModal";
import {useEffect} from "react";
import { Game } from "@/models/game";

interface GameProps {
  id: string;
  columns: ColumnProps[];
  deck: DeckProps;
  piles: PileProps[];
}

interface MoveProps {
  moves: number;
  setMoves: any;
}

export default function GameBoard({ game, move }: { game: GameProps, move: MoveProps}) {
  const [deck, setDeck] = useState<DeckProps>({
    hidden_cards: game.deck.hidden_cards,
    open_cards: 0,
    cards: [],
  });
  const [piles, setPiles] = useState<PileProps[]>(game.piles);
  const [columns, setColumns] = useState<ColumnProps[]>(game.columns);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [wonModal, setWonModal] = useState<boolean>(false);
  const { isMoveLoading, setIsMoveLoading } = useContext(LoadingContext);

  const {
    handleFromDeckToPile,
    handleFromDeckToColumn,
    handleFromColumnToPile,
    handleFromColumnToColumn,
    handleFromPileToColumn,
    handleOpenDeckCard,
    handleRotateOpenDeckCards,
    handleFinishGame,
    getGameObjectDetails,
  } = useSolitaireActions();

  const {
    updateColumnToColumnMove,
    updateColumnToPileMove,
    updatePileToColumnMove,
    updateDeckToColumnMove,
    updateDeckToPileMove,
  } = useSolitaireGameMoves();

  // If the user leaves the page, the on-chain game will be deleted.
  useEffect(() => {
    async function handleUnload(e: BeforeUnloadEvent) {
      if (wonModal === false) {
        e.preventDefault();
      }
      return (e.returnValue = ""); // Trick to return the value on assignment
    }
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    }
  }, []);

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || !active || active.id === over.id) {
      return;
    }
    const cardOriginType = findCardOriginType(active.id, piles, columns, deck);
    const cardDestinationType = findCardOriginType(
      over.id,
      piles,
      columns,
      deck
    );
    if (cardOriginType === "column" && cardDestinationType === "column") {
      const move = updateColumnToColumnMove(active, over, columns, setColumns);
      if (move) columnToColumn(move.from, move.card, move.to);
    } else if (cardOriginType === "column" && cardDestinationType === "pile") {
      const move = updateColumnToPileMove(
        active,
        over,
        columns,
        setColumns,
        piles,
        setPiles
      );
      if (move) columnToPile(move.from, move.to);
    } else if (cardOriginType === "pile" && cardDestinationType === "column") {
      const move = updatePileToColumnMove(
        active,
        over,
        piles,
        setPiles,
        columns,
        setColumns
      );
      if (move) pileToColumn(move.from, move.to);
    } else if (cardOriginType === "deck" && cardDestinationType === "column") {
      const move = updateDeckToColumnMove(
        active,
        over,
        deck,
        setDeck,
        columns,
        setColumns
      );
      if (move) deckToColumn(move.to);
    } else if (cardOriginType === "deck" && cardDestinationType === "pile") {
      const move = updateDeckToPileMove(
        active,
        over,
        deck,
        setDeck,
        piles,
        setPiles
      );
      if (move) deckToPile(move.to);
    }
  }

  const handleFailedTransaction = async () => {
    const onchainGame = await getGameObjectDetails(game.id);
          const newGame = new Game(onchainGame);
          setDeck((prevDeck) => {
            return {
              ...prevDeck,
              hidden_cards: newGame.deck.hidden_cards,
              open_cards: prevDeck.open_cards,
              cards: newGame.deck.cards,
            }
          });
          setColumns(newGame.columns);
          setPiles(newGame.piles);
  }

  const clickDeck = async () => {
    if (!deck.hidden_cards && deck.cards.length === deck.open_cards) {
      setDeck((prevDeck) => ({
        ...prevDeck,
        hidde_cards: prevDeck.hidden_cards,
        open_cards: 0,
        cards: [...prevDeck.cards],
      }));
      return;
    }
    setIsMoveLoading(true);
    if (deck.hidden_cards !== 0) {
      try {
        const newCard = await handleOpenDeckCard(game.id);
        setDeck((prevDeck) => ({
          ...prevDeck, // Spread the previous deck to copy its properties
          hidden_cards: prevDeck.hidden_cards - 1, // Subtract 1 from hidden_cards
          open_cards: prevDeck.open_cards + 1, // Add 1 to open_cards
          cards: [...prevDeck.cards, newCard], // Add newCard to the end of cards array
        }));
        move.setMoves((prevMoves: number) => prevMoves + 1);
      } catch (e) {
        toast.error("Transaction Failed");
        // Fetch onchain Game and set the state again
        try {
          await handleFailedTransaction();
        } catch (fetchError) {
          console.error("Failed to fetch game", fetchError);
          toast.error("Failed to update game");
    }
      }
    } else {
      try {
        const res = await handleRotateOpenDeckCards(game.id);
        setDeck((prevDeck) => {
          const rotatedCard = prevDeck.cards.splice(0, 1)[0];
          return {
            ...prevDeck,
            hidden_cards: 0,
            open_cards: prevDeck.open_cards + 1,
            cards: [...prevDeck.cards, rotatedCard],
          };
        });
        move.setMoves((prevMoves: number) => prevMoves + 1);
      } catch (e) {
        toast.error("Transaction Failed");
        try {
          await handleFailedTransaction();
        } catch (fetchError) {
          console.error("Failed to fetch game", fetchError);
          toast.error("Failed to update game");
    }
      }
    }
    setIsMoveLoading(false);
  };

  const deckToPile = async (pileIndex: number) => {
    setIsMoveLoading(true);
    try {
      await handleFromDeckToPile(game.id, pileIndex);
      move.setMoves((prevMoves: number) => prevMoves + 1);
    } catch (e) {
      toast.error("Transaction Failed");
      try {
        await handleFailedTransaction();
      } catch (fetchError) {
        console.error("Failed to fetch game", fetchError);
        toast.error("Failed to update game");
  }
    } finally {
      setIsMoveLoading(false);
      checkIfFinished();
    }
  };

  const deckToColumn = async (columnIndex: number) => {
    setIsMoveLoading(true);
    try {
      await handleFromDeckToColumn(game.id, columnIndex);
      move.setMoves((prevMoves: number) => prevMoves + 1);
    } catch (e) {
      toast.error("Transaction Failed");
      try {
        await handleFailedTransaction();
      } catch (fetchError) {
        console.error("Failed to fetch game", fetchError);
        toast.error("Failed to update game");
  }
    } finally {
      setIsMoveLoading(false);
    }
  };

  const columnToPile = async (columnIndex: number, pileIndex: number) => {
    setIsMoveLoading(true);
    try {
      const newCard = await handleFromColumnToPile(
        game.id,
        columnIndex,
        pileIndex
      );
      move.setMoves((prevMoves: number) => prevMoves + 1);
      if (newCard) {
        setColumns((prevColumns) =>
          prevColumns.map((column, index) => {
            if (index === columnIndex) {
              return {
                ...column,
                hidden_cards: column.hidden_cards - 1,
                cards: [...column.cards, newCard],
              };
            } else {
              return column;
            }
          })
        );
      }
    } catch (e) {
      toast.error("Transaction Failed");
      try {
        await handleFailedTransaction();
      } catch (fetchError) {
        console.error("Failed to fetch game", fetchError);
        toast.error("Failed to update game");
  }
    } finally {
      setIsMoveLoading(false);
      checkIfFinished();
    }
  };

  const columnToColumn = async (
    fromColumnIndex: number,
    card: number,
    toColumnIndex: number
  ) => {
    setIsMoveLoading(true);
    try {
      const newCard = await handleFromColumnToColumn(
        game.id,
        fromColumnIndex,
        card,
        toColumnIndex
      );
      move.setMoves((prevMoves: number) => prevMoves + 1);
      if (newCard) {
        setColumns((prevColumns) =>
          prevColumns.map((column, index) => {
            if (index === fromColumnIndex) {
              return {
                ...column,
                hidden_cards: column.hidden_cards - 1,
                cards: [...column.cards, newCard],
              };
            } else {
              return column;
            }
          })
        );
      }
    } catch (e) {
      toast.error("Transaction Failed");
      try {
        await handleFailedTransaction();
      } catch (fetchError) {
        console.error("Failed to fetch game", fetchError);
        toast.error("Failed to update game");
  }
    } finally {
      setIsMoveLoading(false);
    }
  };

  const pileToColumn = async (pileIndex: number, columnIndex: number) => {
    setIsMoveLoading(true);
    try {
      await handleFromPileToColumn(game.id, pileIndex, columnIndex);
      move.setMoves((prevMoves: number) => prevMoves + 1);
    } catch (e) {
      toast.error("Transaction Failed");
      try {
        await handleFailedTransaction();
      } catch (fetchError) {
        console.error("Failed to fetch game", fetchError);
        toast.error("Failed to update game");
  }
    } finally {
      setIsMoveLoading(false);
    }
  };

  const finishGame = async () => {
    try {
      await handleFinishGame(game.id);
      setWonModal(true);
    } catch (e) {
      toast.error("Transaction Failed");
    }
  };

  const checkIfFinished = () => {
    if (piles.every((pile) => pile.cards.length === 13)) {
      setIsFinished(true);
    }
  };

  const openCards = () => {
    return (
      <>
        {deck.open_cards > 1 && (
          <Card
            id={Number(deck.cards[deck.cards.length - 2])}
            draggable={false}
          >
            <div style={{ marginTop: "-140%" }}>
              <Card id={Number(deck.cards[deck.cards.length - 1])} />
            </div>
          </Card>
        )}
        {deck.open_cards === 1 && (
          <Card id={Number(deck.cards[deck.cards.length - 1])} />
        )}
      </>
    );
  };

  const deckRotated = () => {
    return (
      <div className="relative">
        <div
          className="aboslute top-0 h-[166px] min-w-[120px]"
          style={{ rotate: "-5deg" }}
        >
          <Image src={cardIdToSvg(-1)} alt={`Hidden Card`} />
        </div>
        <div
          className="absolute top-0 h-[166px] min-w-[120px]"
          style={{ rotate: "3deg" }}
        >
          <Image src={cardIdToSvg(-1)} alt={`Hidden Card`} />
        </div>
        <div
          className={`${
            isMoveLoading ? "cursor-wait" : "cursor-pointer"
          } absolute top-0 h-[166px] min-w-[120px]`}
          style={{ rotate: "none" }}
        >
          <Image src={cardIdToSvg(-1)} alt={`Hidden Card`} />
        </div>
      </div>
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd} autoScroll={false}>
      <div className="px-60 h-full w-full flex flex-col items-center space-y-7 pt-14 gap-y-36">
        <ul className="w-full h-200 flex justify-between items-center">
          {/* Set up card deck */}
          <button
            className={isMoveLoading ? "cursor-wait" : ""}
            key={"cardDeck"}
            onClick={clickDeck}
            disabled={isMoveLoading}
          >
            {!!deck.hidden_cards || deck.open_cards !== deck.cards.length ? (
              deckRotated()
            ) : deck.cards.length !== 0 ? (
              <button className="flex justify-center items-center w-[120px] h-[166px]">
                <Image
                  src={circleArrow}
                  alt={"circle-arrow"}
                  width={80}
                  height={120}
                />
              </button>
            ) : (
              <div className="w-[120px] h-[166px]"></div>
            )}
          </button>

          {/* Place where the open deck cards are being displayed */}
          <li className="min-w-[120px] h-[166px]" key={"openCard"}>
            {openCards()}
          </li>

          {/* Empty placeholder */}
          <li className="w-[120px] h-[166px] flex-shrink-0"></li>

          {/* Set up piles */}
          {piles.map((pile, index) => (
            <li key={index}>
              <EmptyDroppable id={`empty-pile-droppable-${index}`}>
                <Pile pile={pile} />
              </EmptyDroppable>
            </li>
          ))}
        </ul>
        <ul className="w-full flex justify-between  ">
          {columns.map((column, index) => (
            <li key={index}>
              <EmptyDroppable
                index={index}
                id={`empty-column-droppable-${index}`}
              >
                <Column column={column} index={index} />
              </EmptyDroppable>
            </li>
          ))}
        </ul>
        {isFinished && <FinishGame finishGame={finishGame} />}
        {wonModal && <WonModal gameId={game.id} moves={move.moves}/>}
      </div>
    </DndContext>
  );
}
