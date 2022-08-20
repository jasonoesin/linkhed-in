import { XIcon } from "@heroicons/react/solid";
import React from "react";
import "../styles/CreatePostPop.scss";

export default function CreatePostPop({ handleCloseIcon }: any) {
  return (
    <div className="pop">
      <div className="white-box">
        <div className="">Create a Post</div>
        <hr />
        <div className="">
          <XIcon onClick={handleCloseIcon} className="x-icon" />
        </div>
        <div className="cred">
          <div className="img-container">
            <img src="https://picsum.photos/300/300" />
          </div>
          <div className="name">[[Name]]</div>
        </div>

        <textarea placeholder="What do you want to talk about?" />
      </div>
    </div>
  );
}
