import { Loader2 } from "lucide-react";
import React from "react";
import clsx from "clsx";

export const Spinner = ({ fullHeight = false }: { fullHeight?: boolean }) => {
  return (
    <div
      className={clsx("flex justify-center items-center", {
        "h-screen": fullHeight,
      })}
    >
      <Loader2 className="w-7 h-7 text-primary animate-spin" />
    </div>
  );
};
