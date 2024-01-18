"use client";

// import { LargeScreenLayout } from "@/components/layouts/LargeScreenLayout";
// import { MobileLayout } from "@/components/layouts/MobileLayout";
import { AuthenticationProvider } from "@/contexts/Authentication";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRegisterServiceWorker } from "@/hooks/useRegisterServiceWorker";
import { ChildrenProps } from "@/types/ChildrenProps";
import React from "react";
import { Toaster } from "react-hot-toast";
import table from "../../public/Table.svg";

export const ProvidersAndLayout = ({ children }: ChildrenProps) => {
  const _ = useRegisterServiceWorker();
  const { isMobile } = useIsMobile();

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
        {/* {!!isMobile && <MobileLayout>{children}</MobileLayout>}
        {!isMobile && <LargeScreenLayout>{children}</LargeScreenLayout>} */}
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
