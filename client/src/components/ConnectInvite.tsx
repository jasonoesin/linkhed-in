import axios from "axios";
import React from "react";
import "../styles/ConnectInvite.scss";
import { useToastContext } from "./context/ToastContext";
import { GetProfilePicture } from "./firebase/GetProfilePicture";

export default function ConnectInvite(props: any) {
  const { ToastSuccess } = useToastContext();
  console.log(props);
  return (
    <div className="connect">
      <div className="connect-pic">
        <GetProfilePicture url={props?.url} />
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
