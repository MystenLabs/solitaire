import ReactDOM from "react-dom";
import Image from "next/image";
import arrowIcon from "../../../public/iconRight.svg";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { useState } from "react";

interface Props {
  gameId: string;
}

export default function WonModal({ gameId }: Props) {
  const [showHistory, setShowHistory] = useState(false);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 h-screen w-screen bg-black bg-opacity-60 flex flex-col items-center justify-center z-100">
      <div className="p-14 bg-white rounded-3xl shadow flex flex-col justify-center items-center">
        <div className="w-[480px] h-[284px] flex flex-col items-center justify-center gap-8">
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
          <div className="flex items-center justify-between p-4 h-12">
            <div className="text-base font-bold text-center text-black">
              Game history
            </div>
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center justify-center gap-2">
              <div className="text-sm font-semibold text-neutral-900">{!showHistory? "Show" : "Hide"}</div>
              <CaretDownIcon className="w-4 h-4" color={"black"} />
            </button>
          </div>
          {showHistory && <div>History</div>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
