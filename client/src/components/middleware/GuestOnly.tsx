import React from "react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children?: React.ReactNode;
}

const GuestOnly = ({ children }: Props) => {
  const data = JSON.parse(localStorage?.getItem("data")!);

  if (!data) return <>{children}</>;
  return <Navigate to={"/home"} />;
};

export default GuestOnly;
