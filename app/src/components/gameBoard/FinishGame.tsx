import ReactDOM from "react-dom";

interface Props {
  finishGame: () => void;
}

export default function FinishGame({ finishGame }: Props) {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 h-screen w-screen bg-black bg-opacity-60 flex flex-col items-center justify-center gap-6 z-100">
      <div className="flex flex-col justify-center items-center gap-2.5">
        <p className="text-white font-bold text-lg">Game Completed!</p>
        <p className="text-stone-100 text-base font-normal">
          Click the button below to register your win onchain and view the
          results.
        </p>
      </div>
      <button
        onClick={finishGame}
        className="bg-black px-5 py-4 bg-black rounded-lg justify-center items-center gap-2 inline-flex"
      >
        <div className="text-white text-base font-bold">View Results</div>
      </button>
    </div>,
    document.body
  );
}
