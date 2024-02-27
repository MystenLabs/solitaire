"use client";
import { ModeVisual } from "@/components/difficultySelection/difficultyModes/modeVisual";
import easy_mode_visual from "../../../public/assets/difficultyModesVisuals/easy_mode_visual.svg";
import normal_mode_visual from "../../../public/assets/difficultyModesVisuals/normal_mode_visual.svg";
import { useAuthentication } from "@/contexts/Authentication";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { getBalance } from "@/helpers/getBalance";
import { SuiClient } from "@mysten/sui.js/client";
import toast from "react-hot-toast";
import { Spinner } from "../general/Spinner";

export const DifficultySelection = ({
  onGameCreation,
}: {
  onGameCreation: (mode: "easy" | "normal") => void;
}) => {
  const { user } = useAuthentication();
  const [isLoading, setIsLoading] = useState(false);
  const [enoughBalance, setEnoughBalance] = useState<boolean>(true);
  const hasEnoughBalance = (balance: BigNumber) => {
    return balance.isGreaterThanOrEqualTo(
      new BigNumber(process.env.MINIMUM_BALANCE_TO_PLAY ?? 1500000000),
    );
  };
  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance(user.address);
      setEnoughBalance(hasEnoughBalance(balance));
    };

    fetchBalance();
  }, [user.address]);

  const handleClickTopUp = async () => {
    document.body.style.cursor = "wait";
    setIsLoading(true);
    const response = await fetch("https://pocs-faucet.vercel.app/api/faucet", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Enoki-api-key": process.env.NEXT_PUBLIC_ENOKI_API_KEY!,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")!)["zkLoginSession"]["jwt"]}`,
      },
    });
    const body = await response.json();
    if (response.ok) {
      const client = new SuiClient({
        url: process.env.NEXT_PUBLIC_SUI_NETWORK!,
      });
      await client.waitForTransactionBlock({
        digest: body.txDigest,
      });
      toast.success("Top up successful!");
      setEnoughBalance(hasEnoughBalance(await getBalance(user.address)));
    } else {
      toast.error(`Top up failed: ${body.error}`);
    }
    document.body.style.cursor = "default";
    setIsLoading(false);
  };
  console.log("HAS ENOUGH BALANCE", enoughBalance);
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
          onClick={async () => {
            onGameCreation("easy");
          }}
          disabled={!enoughBalance}
        >
          <ModeVisual
            level={"Easy"}
            description={"Start with all aces placed"}
            mode={easy_mode_visual}
          />
        </button>
        <button
          onClick={async () => {
            onGameCreation("normal");
          }}
          disabled={!enoughBalance}
        >
          <ModeVisual
            level={"Normal"}
            description={"Start with aces in deck"}
            mode={normal_mode_visual}
          />
        </button>
      </div>
      {!enoughBalance && (
        <div className="flex flex-col justify-center">
          <p className="mb-1 font-light text-gray-500">
            Looks like you do not have enough balance to play.
          </p>
          <button
            className={`mb-10 rounded-md ${isLoading ? "bg-gray-300" : "bg-black"} p-2 text-white`}
            onClick={handleClickTopUp}
          >
            {isLoading && <Spinner />}
            {!isLoading && <>💧Click here to topup!</>}
          </button>
        </div>
      )}
    </div>
  );
};
