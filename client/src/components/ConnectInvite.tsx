import axios from "axios";
import React from "react";
import "../styles/ConnectInvite.scss";
import { useToastContext } from "./context/ToastContext";

export default function ConnectInvite(props: any) {
  const { ToastSuccess } = useToastContext();
  return (
    <div className="connect">
      <div className="connect-pic">
        <img src="https://picsum.photos/300/300" />
      </div>
      <div className="connect-desc">
        <div className="connect-desc-name">{props.name}</div>
      </div>
      <div className="connect-button">
        <div
          onClick={() => {
            const data = JSON.parse(localStorage?.getItem("data")!);
            const json = {
              current: data.email,
              from: props.id,
            };

            axios
              .post(`http://localhost:8080/decline-connection`, json)
              .then((res) => {
                props.handleRequest(props.id);
                ToastSuccess("Connection Request Declined !");
              });
          }}
          className="ignore"
        >
          Ignore
        </div>
        <div
          onClick={() => {
            const data = JSON.parse(localStorage?.getItem("data")!);
            const json = {
              current: data.email,
              from: props.id,
            };

            axios
              .post(`http://localhost:8080/accept-connection`, json)
              .then((res) => {
                props.handleRequest(props.id);
                ToastSuccess("Connection Request Accepted !");
              });
          }}
          className="accept"
        >
          Accept
        </div>
      </div>
    </div>
  );
}
