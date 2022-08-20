import React from "react";
import "../styles/ConnectInvite.scss";

export default function ConnectInvite() {
  return (
    <div className="connect">
      <div className="connect-pic">
        <img src="https://picsum.photos/300/300" />
      </div>
      <div className="connect-desc">
        <div className="connect-desc-name">Jason Oesin</div>
      </div>
      <div className="connect-button">
        <div className="ignore">Ignore</div>
        <div className="accept">Accept</div>
      </div>
    </div>
  );
}
