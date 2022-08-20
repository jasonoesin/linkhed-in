import React from "react";
import ConnectInvite from "../components/ConnectInvite";
import "../styles/Network.scss";

export default function Network() {
  return (
    <div className="page">
      <div className="page-container">
        <div className="invitation">
          <div className="title">Invitations</div>
          <div className="example">
            <ConnectInvite />
            <ConnectInvite />
          </div>
        </div>
        <div className="other-user"></div>
      </div>
    </div>
  );
}
