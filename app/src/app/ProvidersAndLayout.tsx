"use client";

// import { LargeScreenLayout } from "@/components/layouts/LargeScreenLayout";
// import { MobileLayout } from "@/components/layouts/MobileLayout";
import { AuthenticationProvider } from "@/contexts/Authentication";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRegisterServiceWorker } from "@/hooks/useRegisterServiceWorker";
import { ChildrenProps } from "@/types/ChildrenProps";
import React from "react";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import logo from "../../public/Symbol.svg";
import wordmark from "../../public/Wordmark.svg";
import stroke from "../../public/Stroke.svg";

export const ProvidersAndLayout = ({ children }: ChildrenProps) => {
  const _ = useRegisterServiceWorker();
  const { isMobile } = useIsMobile();

  return (
    <AuthenticationProvider>
      <main className={`relative min-h-screen w-screen custom-green-gradient `}>
        <Image src={stroke} alt="stroke" className="absolute max-h-screen max-w-screen bottom-0 left-0 m-3"/>
        <div className="absolute bottom-0 right-0 m-6 flex justify-center items-center space-x-2">
        <Image src={logo} alt="logo" className="mb-1"/>
        <Image src={wordmark} alt="MystenLabs"/>
        </div>
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
