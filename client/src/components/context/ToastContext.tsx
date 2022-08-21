import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TContext = createContext({} as any);

export default function ToastContext({ children }: any) {
  const ToastError = (msg: string) => {
    toast.error(msg, {
      position: "bottom-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const ToastSuccess = (msg: string) => {
    toast.success(msg, {
      position: "bottom-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <TContext.Provider value={{ ToastError, ToastSuccess }}>
      <ToastContainer />
      {children}
    </TContext.Provider>
  );
}

export function useToastContext() {
  return useContext(TContext);
}
