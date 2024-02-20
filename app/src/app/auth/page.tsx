"use client";

import { useAuthentication } from "@/contexts/Authentication";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

// bad practice but is not exported from @mysten/enoki
import { ZkLoginSession } from "@mysten/enoki/dist/cjs/EnokiFlow"
import { Spinner } from "@/components/general/Spinner";

const AuthPage = () => {
  const { enokiFlow, handleLoginAs, setIsLoading } = useAuthentication();
  const [enokiActive, setEnokiActive] = useState(false);

  useEffect(() => {
    if (enokiActive) return;
    setEnokiActive(true);
  }, [enokiFlow]);

  useEffect(() => {
    setIsLoading(true);
    const hash = window.location.hash;
    enokiFlow
      .handleAuthCallback(hash)
      .then(async (res: any) => {
        console.log({ res });
        const session = await enokiFlow.getSession();
        const keypair = await enokiFlow.getKeypair();
        const address = keypair.toSuiAddress();
        const jwt = session?.jwt;
        const decodedJwt: any = jwtDecode(jwt!);
        handleLoginAs({
          firstName: decodedJwt["given_name"],
          lastName: decodedJwt["family_name"],
          role: "player",
          email: decodedJwt["email"],
          picture: decodedJwt["picture"],
          address,
          zkLoginSession: session as ZkLoginSession,
        });
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.log({ err });
        setIsLoading(false);
      });
  }, [enokiActive]);

  return <Spinner />;
};

export default AuthPage;
