import "server-only";
import { Paper } from "@/components/general/Paper";
import { LoginForm } from "@/components/forms/LoginForm";
import { Metadata } from "next";
import Image from "next/image";
import logo from "../../public/SymbolRed 1.svg";

export const metadata: Metadata = {
  title: "Solitaire | Mysten Labs",
  description: "Play klondike style solitaire on the web3!",
};

export default function Home() {
  console.log("page.tsx is on server:", !!process.env.IS_SERVER_SIDE);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen space-y-10">
      <Paper className="flex flex-col justify-center gap-10 items-center max-w-[600px] mx-auto">
        <div className="flex space-x-1">
          <Image src={logo} alt="Logo" />
          <h2 className="text-xl text-MystenRed font-extrabold">Mysten Labs</h2>
        </div>
        <h3 className="font-bold text-xl text-center">
          Sign In to Play Mysten Solitaire
        </h3>
        <p className="max-w-[300px] text-xs text-center font-normal">
          Dive into the world of strategic moves and captivating gameplay in
          this Klondike style Solitaire game. Whether you are here to beat your
          high score or just starting, your next game awaits. Log in and let the
          cards fall where they may!
        </p>
        <LoginForm />
      </Paper>
      <div className="flex flex-col justify-center items-center">
        <p className="text-white text-xs font-normal">
          Learn more about MystenLabs at
        </p>
        <a
          href="https://mystenlabs.com"
          className="text-white text-xs font-semibold underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          mystenlabs.com
        </a>
      </div>
    </div>
  );
}
