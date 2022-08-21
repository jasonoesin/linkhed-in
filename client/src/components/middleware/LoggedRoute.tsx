import React from "react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useActivatedContext } from "../context/Activated";

interface Props {
  children?: React.ReactNode;
}

const LoggedRoute = ({ children }: Props) => {
  const { activated } = useActivatedContext();

  if (!activated && activated !== undefined)
    return <Navigate to={"/not-activated"} />;

  return <>{children}</>;
};

export default LoggedRoute;
