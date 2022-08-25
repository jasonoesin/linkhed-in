import axios from "axios";
import React, { useState } from "react";
import { GetProfilePicture } from "./firebase/GetProfilePicture";

export default function ConnectRequest(props: any) {
  return (
    <div className="con-request">
      <div className="">
        <GetProfilePicture url={props?.profile_url} />
      </div>
      <div className="name">{props.name}</div>

      {props.isUser ? null : (
        <>
          {props.connected ? (
            <button className="connected">Connected</button>
          ) : (
            <button
              onClick={() => {
                const data = JSON.parse(localStorage?.getItem("data")!);

                const json = {
                  message: "Message Example",
                  from: data.email,
                  target: props.id,
                };

                axios
                  .post(`http://localhost:8080/request-connect`, json)
                  .then((res) => {
                    console.log(res.data);
                  });
              }}
            >
              Connect
            </button>
          )}
        </>
      )}
    </div>
  );
}
