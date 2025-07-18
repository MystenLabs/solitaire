import { SuiClient } from "@mysten/sui/client";
import BigNumber from "bignumber.js";

/// Get the SUI balance of an address
export const getBalance = async (address: string): Promise<BigNumber> => {
  const url = process.env.NEXT_PUBLIC_SUI_NETWORK!;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUI_NETWORK is not set");
  }
  const client = new SuiClient({ url });
  return await client.getBalance({ owner: address }).then((response) => {
    return BigNumber(response.totalBalance);
  });
};
