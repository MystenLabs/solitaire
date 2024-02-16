import { formatTimestamp } from "@/helpers/formatDate";
import { Game } from "./WonModal";

interface Props {
    games: Game[];
}

export default function GameHistory({ games }: Props) {
    return (
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
                    <div key={game.id} className="group flex items-center justify-center px-2 py-4 gap-8 w-full hover:bg-indigo-100 hover:rounded-lg">
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
    )
}