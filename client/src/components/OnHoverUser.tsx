import React from "react";
import { GetProfilePicture } from "./firebase/GetProfilePicture";

export default function OnHoverUser(props: any) {
  const userData = props.data.User;
  return (
    <div className="hover">
      <div className="left">
        <GetProfilePicture url={userData?.profile_url} />
      </div>
      <div className="right">
        <div className="hover-name">{userData?.name}</div>
        <div className="hover-occupation">{userData?.occupation}</div>
        <div className="hover-nick">@{userData?.nick}</div>
      </div>
    </div>
  );
}
