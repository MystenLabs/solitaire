"use client";

import React, { useEffect } from "react";
import { useAuthentication } from "@/contexts/Authentication";
import { useRouter } from "next/navigation";
import { Spinner } from "../general/Spinner";
import Link from "next/link";
import Image from "next/image";

export const LoginForm = () => {
  const router = useRouter();
  const [authURL, setAuthURL] = React.useState<string | null>(
    null
  );
  const { user, isLoading: isAuthLoading, enokiFlow } = useAuthentication();

  useEffect(() => {
    generateAuthURLs();
  }, [enokiFlow]);

  const generateAuthURLs = async () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const customRedirectUri = `${protocol}//${host}/auth`;
    const authURL = await enokiFlow.createAuthorizationURL({
      provider: "google",
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirectUrl: customRedirectUri,
      extraParams: {
        scope: ["openid", "email", "profile"],
      },
    });
    setAuthURL(authURL);
    return authURL;
  };

  useEffect(() => {
    if (user.role !== 'anonymous' && !isAuthLoading) {
      router.push(`/game`);
    }
  }, [user, isAuthLoading]);

  if (isAuthLoading || user.role !== 'anonymous') {
    return <Spinner />;
  }

  return (
    <div className="space-y-5">
      {!!authURL && (
        <div className="flex flex-col md:flex-row space-x-3 items-center justify-center">
          <Link
            href={authURL}
            className="flex justify-center items-center space-x-2 px-3 py-2 bg-gray-100 text-black w-[200px] rounded-lg"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            <div>Sign In</div>
          </Link>
        </div>
      )}
    </div>
  );
};
