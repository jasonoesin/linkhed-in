import { AnnotationIcon, ShareIcon, ThumbUpIcon } from "@heroicons/react/solid";
import axios from "axios";
import React from "react";
import "../styles/Post.scss";
import { useAuthContext } from "./context/AuthContext";
import { GetProfilePicture } from "./firebase/GetProfilePicture";

export default function Post(props: any) {
  const { getUser } = useAuthContext();
  return (
    <div className="post">
      <div className="post-up">
        <div className="post-up-left">
          <GetProfilePicture url={props.data.User.profile_url} />
        </div>

        <div className="post-up-right">
          <div className="post-up-right-name">{props.data?.User?.name}</div>
        </div>
      </div>
      <div className="post-text">{props.data?.text}</div>

      {/* Example image */}

      {props.data?.asset_type === "image" && (
        <div className="post-image">
          <img src={props.data?.asset} />
        </div>
      )}

      {props.data?.asset_type === "video" && (
        <div className="post-video">
          <video controls>
            <source src={props.data?.asset} />
          </video>
        </div>
      )}

      <div className="post-footer-up">
        <div className="left">
          <ThumbUpIcon className="thumbs" />
          <div className="like-count">{props.data?.total_likes}</div>
        </div>
        <div className="right">
          <div className="comment-count">0 Comment</div>
          <div className="share-count">0 Shares</div>
        </div>
      </div>
      <div className="post-footer-down">
        <div className="like">
          {props.data?.liked ? (
            <div
              onClick={() => {
                var json = {
                  email: getUser().email,
                  post_id: props.data?.post_id,
                };

                axios
                  .post(`http://localhost:8080/post/unlike`, json)
                  .then((res) => {
                    console.log(res.data);
                    props.refetchData();
                  });
              }}
            >
              <ThumbUpIcon className="icons liked" />
              <div>Unlike</div>
            </div>
          ) : (
            <div
              onClick={() => {
                var json = {
                  email: getUser().email,
                  post_id: props.data?.post_id,
                };

                axios
                  .post(`http://localhost:8080/post/like`, json)
                  .then((res) => {
                    console.log(res.data);
                    props.refetchData();
                  });
              }}
            >
              <ThumbUpIcon className="icons" />
              <div>Like</div>
            </div>
          )}
        </div>
        <div className="comment">
          <AnnotationIcon className="icons" />
          <div>Comment</div>
        </div>
        <div className="share">
          <ShareIcon className="icons" />
          <div className="">Share</div>
        </div>
      </div>
    </div>
  );
}
