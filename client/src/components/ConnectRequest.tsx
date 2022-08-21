import axios from "axios";
import React, { useState } from "react";

export default function ConnectRequest(props: any) {
  const [connected, setCon] = useState(false);

  return (
    <div className="con-request">
      <div className="">
        <img src="https://picsum.photos/300/300" />
      </div>
      <div className="name">{props.name}</div>
      {connected ? (
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
                console.log(res);
                console.log(res.data);
              });
          }}
        >
          Connect
        </button>
      )}
    </div>
  );
}
