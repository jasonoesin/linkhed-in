import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext({} as any);

export default function UserProvider({ children }: any) {
  const [user, setUser] = useState();

  const data = JSON.parse(localStorage?.getItem("data")!);

  useEffect(() => {
    if (data)
      axios
        .get(`http://localhost:8080/user`, {
          params: { email: data.email },
        })
        .then((res) => {
          setUser(res.data);
        });
  }, []);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
