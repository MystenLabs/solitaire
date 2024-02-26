import React from "react";
import { LoadingButton } from "./LoadingButton";
import { useRequestSui } from "@/hooks/useRequestSui";
import { formatSUIAmount } from "@/helpers/formatSUIAmount";
import Image from "next/image";
import { useBalance } from "@/contexts/BalanceContext";
import BigNumber from "bignumber.js";

export const Balance = () => {
  const { isLoading, handleRequestSui } = useRequestSui();
  const { balance } = useBalance();

  return (
    <div className="flex items-center space-x-2">
      <div className="border-custom-border flex h-10 items-center space-x-2 rounded-[36px] border-[1px] bg-[inherit] px-[10px]">
        <Image src="/general/sui.svg" alt="plus" width={10} height={10} />
        <div className="flex space-x-1 text-sm font-semibold text-white text-opacity-90">
          <span>{formatSUIAmount(balance)} </span>
          <span className="hidden md:block">SUI</span>
        </div>
      </div>
      {balance <= BigNumber(0.5) && (
        <LoadingButton
          onClick={handleRequestSui}
          isLoading={isLoading}
          className="border-custom-border flex items-center space-x-0 rounded-[36px] border-[1px] bg-[inherit] px-[10px] hover:bg-[#12BF77] md:space-x-2"
          spinnerClassName="!w-5 !h-5"
        >
          <Image src="/general/plus.svg" alt="plus" width={20} height={20} />
          <div className="hidden font-semibold md:block">Top up</div>
        </LoadingButton>
      )}
    </div>
  );
};
