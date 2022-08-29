import React from "react";
import s from "../styles/Messaging.module.scss";
import { GetProfilePicture } from "./firebase/GetProfilePicture";

export default function UserChatProfile(props: any) {
  return (
    <div
      className={
        props.current?.conversation_id === props.data?.conversation_id
          ? s.user_chat_profile_selected
          : s.user_chat_profile
      }
    >
      <div className={s.image}>
        <GetProfilePicture url={props.data?.profile_url} />
      </div>
      <div className={s.name}>{props.data.name}</div>
    </div>
  );
}
