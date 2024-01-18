import "server-only";

import { Paper } from "@/components/general/Paper";
import { Metadata } from "next";
import React from "react";
import {DifficultySelection} from "@/components/difficultySelection/DifficultySelection";

export const metadata: Metadata = {
  title: "PoC Template for Members",
};

const GamePage = () => {
  console.log("Game Page is on server:", !!process.env.IS_SERVER_SIDE);
  return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-20">
        <DifficultySelection />
      </div>
  )
};

export default GamePage;
