import React, { useState } from "react";
import "../styles/CreatePost.scss";
import { useUserContext } from "./context/UserContext";
import CreatePostPop from "./CreatePostPop";
import { GetProfilePicture } from "./firebase/GetProfilePicture";

export default function CreatePost(props: any) {
  const [state, setState] = useState(false);

  const handleCloseIcon = () => {
    setState(false);
  };

  const { user } = useUserContext();

  return (
    <div className="doc">
      <div className="up">
        <div className="img-container">
          <GetProfilePicture
            url={user?.profile_url ? user.profile_url : null}
          />
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
