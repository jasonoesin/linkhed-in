import React from "react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useActivatedContext } from "../context/Activated";

interface Props {
  children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const data = JSON.parse(localStorage?.getItem("data")!);

  if (!data) return <Navigate to={"/"} />;

  return <>{children}</>;
};

export default ProtectedRoute;
