import React from "react";
import Image from "next/image";
import infoLogo from "../../public/info.svg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export const InfoIcon = () => {
  return (
    <>
      <div className="absolute bottom-0 left-0 p-20">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-[40px] h-[40px] relative bg-white hover:bg-gray-100 h-rounded-[10px] border-[1px] border-[#CCCCCC] opacity-80"
            >
              <Image src={infoLogo}
                     alt="Info"
                     fill={true}
              />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] h-1/2">
            <DialogHeader>
              <DialogTitle>Game Rules</DialogTitle>
            </DialogHeader>
            <ScrollArea>
              <div className="space-y-[10px] text-black text-opacity-80 text-sm">
                <div>
                  In this on-chain version of Klondike solitaire, the player creates a game whose rules are entirely
                  governed by the smart contract.
                </div>
                <div>
                  The player has the ability to choose between two modes: Normal and Easy.
                  Normal mode is the original Klondike solitaire, and Easy mode is a game with all the Aces placed on
                  the
                  piles.
                </div>
                <div>
                  After initiating the game, the player has to place all the cards starting from Ace to King of
                  each suit to the respective pile. The allowed moves are opening one deck card each time, placing a
                  card from deck to column or a pile, placing a card from column to a different column or a pile and
                  placing a card from pile to column. When the player manages to place all cards to the 4 piles, he
                  needs to click the button “View Results” to register the win onchain and be able to view the history
                  of past games.
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
