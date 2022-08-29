import React from "react";
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useActivatedContext } from "../context/Activated";
import { useUserContext } from "../context/UserContext";

interface Props {
  children?: React.ReactNode;
}

const LoggedRoute = ({ children }: Props) => {
  const { activated } = useActivatedContext();
  const nav = useNavigate();

  const { user } = useUserContext();

  useEffect(() => {
    if (!activated && activated !== undefined) nav("./not-activated");
  }, [activated, user]);

  if (!activated && activated !== undefined)
    return <Navigate to={"/not-activated"} />;

  return <>{children}</>;
};

export default LoggedRoute;
