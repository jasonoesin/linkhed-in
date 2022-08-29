import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUserContext } from "./UserContext";

const ActivatedContext = createContext({} as any);

export default function Activated({ children }: any) {
  const [activated, setActivated] = useState();

  const data = JSON.parse(localStorage?.getItem("data")!);
  const loc = useLocation();

  useEffect(() => {
    if (data)
      axios
        .get(`http://localhost:8080/validate`, {
          params: { email: data.email },
        })
        .then((res) => {
          setActivated(res.data);
        });
  }, [loc]);

  return (
    <ActivatedContext.Provider value={{ activated }}>
      {children}
    </ActivatedContext.Provider>
  );
}

export function useActivatedContext() {
  return useContext(ActivatedContext);
}
