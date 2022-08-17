import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

interface Props {
  children?: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState();

  function getLocalStorage() {
    const temp = localStorage.getItem("data");
    const userStorage = JSON.parse(temp!);
    if (userStorage === undefined || userStorage === null) {
      return false;
    } else {
      return userStorage;
    }
  }

  function setLocalStorage(data: any) {
    localStorage.setItem("data", JSON.stringify(data));
  }

  function update(data: any) {
    setUser(data);
    setLocalStorage(data);
  }

  function getUser() {
    if (user === undefined || user === null) {
      const userStorage = getLocalStorage();
      setUser(userStorage);
      return userStorage;
    }
    return user;
  }

  return (
    <AuthContext.Provider value={{ update, user, getUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
