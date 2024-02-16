import ReactDOM from "react-dom";
import Image from "next/image";
import arrowIcon from "../../../public/iconRight.svg";
import { CaretDownIcon, CaretUpIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useSui } from "@/hooks/useSui";
import { useAuthentication } from "@/contexts/Authentication";
import { any, unknown } from "zod";

interface GameFields {
  fields: {
    end_time: string;
    player_moves: string;
    start_time: string;
  };
}

interface Game extends GameFields {
  id: string | undefined;
}

interface Props {
  gameId: string;
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
      try {
        const gamesObject = await suiClient.getOwnedObjects({
          owner: address,
          filter: {
            StructType: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::solitaire::Game`,
          },
          options: {
            showContent: true,
          },
        });
        //console.log("games", games);
        if (gamesObject.data.length !== 0) {
          const endedGames = gamesObject.data.filter((game) => (game.data?.content as unknown as GameFields).fields.end_time !== "0");
          const games = endedGames.map(
            (game) => {
              const fields = game.data?.content as unknown as GameFields;
              const id = game.data?.objectId;
              return { id, ...fields };
            }
          );
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
            {showHistory && (
              <div className="flex flex-col items-center justify-center w-full p-4">
                <div className="flex items-center justify-center p-2 bg-stone-100 rounded-lg w-full gap-6">
                  <div className="flex-grow text-sm font-normal text-zinc-800 opacity-90">
                    Past won games
                  </div>
                  <div className="text-sm font-normal text-zinc-800 opacity-90 w-12 text-right">
                    Moves
                  </div>
                </div>
                <div className="flex flex-col items-center justify-start w-full max-h-[280px] overflow-auto">
                  {games.map((game) => (
                    <div className="group flex items-center justify-center px-2 py-4 gap-8 w-full hover:bg-indigo-100 hover:rounded-lg">
                      <div className="flex-grow text-sm font-normal text-zinc-800 opacity-90 w-full">
                        {formatTimestamp(Number(game.fields.end_time))}
                      </div>
                      <div className="relative w-full text-right">
                        <div className="text-sm font-bold text-neutral-900 opacity-90 w-12 inline-block group-hover:opacity-0">
                          {game.fields.player_moves}
                        </div>
                        <a
                          href={`https://testnet.suivision.xyz/object/${game.id}`}
                          className="absolute inset-0 flex items-center justify-end opacity-0 group-hover:opacity-100 w-full h-full"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="text-blue-700 text-sm font-semibold">
                            Verify on Explorer
                          </span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(typeof timestamp === 'string' ? Number(timestamp) : timestamp);

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short', // 'short' will give you abbreviated month names
    day: 'numeric',
    timeZone: 'UTC'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
  const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
  return `${formattedDate} ${formattedTime} UTC`;
}
