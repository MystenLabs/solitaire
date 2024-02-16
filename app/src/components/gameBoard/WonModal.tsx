import ReactDOM from "react-dom";
import Image from "next/image";
import arrowIcon from "../../../public/iconRight.svg";
import { CaretDownIcon, CaretUpIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useSui } from "@/hooks/useSui";
import { useAuthentication } from "@/contexts/Authentication";
import GameHistory from "./GameHistory";


interface Props {
  gameId: string;
}

interface GameFields {
  fields: {
    end_time: string;
    player_moves: string;
    start_time: string;
  };
}

export interface Game extends GameFields {
  id: string | undefined;
}

export default function WonModal({ gameId }: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const { suiClient } = useSui();
  const {
    user: { address },
  } = useAuthentication();
  const { enokiFlow } = useAuthentication();

  useEffect(() => {
    const getGame = async () => {
      const allData = [];
      try {
        let { nextCursor, hasNextPage, data } = await suiClient.getOwnedObjects(
          {
            owner: address,
            filter: {
              StructType: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::Game`,
            },
            options: {
              showContent: true,
            },
          }
        );

        allData.push(...data);

        while (!!hasNextPage) {
          const resp = await suiClient.getOwnedObjects({
            owner: address,
            filter: {
              StructType: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::Game`,
            },
            options: {
              showContent: true,
            },
            ...(!!hasNextPage && { cursor: nextCursor }),
          });
          hasNextPage = resp.hasNextPage;
          nextCursor = resp.nextCursor;
          data = resp.data;
          allData.push(...data);
        }
        if (allData.length !== 0) {
          const endedGames = allData.filter(
            (game) =>
              (game.data?.content as unknown as GameFields).fields.end_time !==
              "0"
          );
          const games = endedGames.map((game) => {
            const fields = game.data?.content as unknown as GameFields;
            const id = game.data?.objectId;
            return { id, ...fields };
          });
          setGames(games);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getGame();
  }, [address]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 h-screen w-screen bg-black bg-opacity-60 flex flex-col items-center justify-center z-100">
      <div className="p-14 bg-white rounded-3xl shadow flex flex-col justify-center items-center">
        <div className="w-[480px] flex flex-col items-center justify-center gap-8">
          <div className="flex flex-col items-center justify-center h-[202px] gap-4 w-full">
            <div className="text-2xl font-bold text-center text-black">
              Congratulations, you won!
            </div>
            <div className="flex items-center justify-center w-full py-6 gap-4">
              <div className="flex flex-col items-start justify-center flex-grow gap-1">
                <div className="text-sm font-normal text-neutral-600 opacity-90">
                  Moves
                </div>
                <div className="text-base font-bold text-right text-neutral-900 opacity-90">
                  55
                </div>
              </div>
              <a
                href={"https://testnet.suivision.xyz/object/" + gameId}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <div className="text-base font-semibold text-neutral-900">
                  Verify on Sui Explorer
                </div>
                <Image
                  className="w-4 h-4"
                  src={arrowIcon}
                  alt="external-link"
                />
              </a>
            </div>
            <button
              className="flex items-center justify-center px-5 py-4 w-full bg-rose-600 rounded-lg"
              onClick={() => window.location.reload()}
            >
              <div className="text-base font-bold text-white">Play again</div>
            </button>
          </div>
          <div className="flex flex-col w-full border border-zinc-300 rounded-lg">
            <button
              className="flex items-center p-4 justify-between h-12"
              onClick={() => setShowHistory(!showHistory)}
            >
              <div className="text-base font-bold text-center text-black">
                Game history
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-sm font-semibold text-neutral-900">
                  {!showHistory ? "Show" : "Hide"}
                </div>
                {!showHistory ? (
                  <CaretDownIcon className="w-4 h-4" color={"black"} />
                ) : (
                  <CaretUpIcon className="w-4 h-4" color={"black"} />
                )}
              </div>
            </button>
            {showHistory && <GameHistory games={games} />}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
