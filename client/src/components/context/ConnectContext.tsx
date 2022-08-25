import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const ConnectContext = createContext({} as any);

export default function ConnectProvider({ children }: any) {
  const [connects, setConnects] = useState();

  const data = JSON.parse(localStorage?.getItem("data")!);

  useEffect(() => {
    if (data)
      axios
        .get(`http://localhost:8080/connection`, {
          params: { email: data.email },
        })
        .then((res) => {
          setConnects(res.data);
        });
  }, []);

  return (
    <ConnectContext.Provider value={{ connects }}>
      {children}
    </ConnectContext.Provider>
  );
}

export function useConnectContext() {
  return useContext(ConnectContext);
}
