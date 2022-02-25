import React, { useEffect, createContext, useContext, useState } from "react";

import assert from "assert";

import { decode as jwtDecode } from "jsonwebtoken";
import { jwtTokenModel } from "./jwtToken";

const serverUrl = process.env.SERVER_URL;
assert(serverUrl, `env.SERVER_URL is missing`);

interface AuthContext {
  viewer: null | jwtTokenModel;
  logout: () => void;
}

const AuthContext = createContext<AuthContext>(null);

export function useJwtAuth() {
  return useContext(AuthContext);
}

export function JwtAuthProvider(props: { children: JSX.Element | JSX.Element[] }) {
  const [viewer, setViewer] = useState<jwtTokenModel>(null);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      setViewer(jwtDecode(jwt) as jwtTokenModel);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);

    function handler(event: StorageEvent) {
      if (event.key === "jwt") {
        setViewer(jwtDecode(event.newValue) as jwtTokenModel);
      }
    }
  }, []);

  const contextValue: AuthContext = { viewer, logout };

  return <AuthContext.Provider value={contextValue} children={props.children} />;

  function logout() {
    localStorage.removeItem("jwt");
    location.reload();
  }
}
