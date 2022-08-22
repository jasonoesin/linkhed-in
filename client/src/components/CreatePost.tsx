import React, { useState } from "react";
import "../styles/CreatePost.scss";
import CreatePostPop from "./CreatePostPop";

export default function CreatePost(props: any) {
  const [state, setState] = useState(false);

  const handleCloseIcon = () => {
    setState(false);
  };

  return (
    <div className="doc">
      <div className="up">
        <div className="img-container">
          <img src="https://picsum.photos/300/300" />
        </div>
        <div
          onClick={() => {
            setState(true);
          }}
          className="text"
        >
          Start a post
        </div>
      </div>

      {state ? (
        <CreatePostPop
          refetchData={props.refetchData}
          handleCloseIcon={handleCloseIcon}
        />
      ) : null}
    </div>
  );
}
