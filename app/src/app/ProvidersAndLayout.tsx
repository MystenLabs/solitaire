"use client";

import { AuthenticationProvider } from "@/contexts/Authentication";
import { useRegisterServiceWorker } from "@/hooks/useRegisterServiceWorker";
import { ChildrenProps } from "@/types/ChildrenProps";
import React from "react";
import { Toaster } from "react-hot-toast";
import table from "../../public/Table.svg";

export const ProvidersAndLayout = ({ children }: ChildrenProps) => {
  const _ = useRegisterServiceWorker();

  return (
    <AuthenticationProvider>
      <main
        className={`min-h-screen w-screen`}
        style={{
          backgroundImage: `url(${table.src})`, // Set the table image as background
          backgroundSize: "cover", 
          backgroundPosition: "bottom", 
          backgroundRepeat: "no-repeat",
        }}
      >
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 5000,
          }}
        />
      </main>
    </AuthenticationProvider>
  );
};
