import "server-only";

import { Paper } from "@/components/general/Paper";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "PoC Template for Members",
};

const GamePage = () => {
  console.log("Game Page is on server:", !!process.env.IS_SERVER_SIDE);
  return (
    <div>
      This is the game page
    </div>
  )
};

export default GamePage;
