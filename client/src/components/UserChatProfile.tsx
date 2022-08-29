import React from "react";
import s from "../styles/Messaging.module.scss";

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
        <img src="https://picsum.photos/300/300" />
      </div>
      <div className={s.name}>{props.data.name}</div>
    </div>
  );
}
