import { AnnotationIcon, ShareIcon, ThumbUpIcon } from "@heroicons/react/solid";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Post.scss";
import Comment from "./Comment";
import { useAuthContext } from "./context/AuthContext";
import { GetProfilePicture } from "./firebase/GetProfilePicture";
import OnHoverUser from "./OnHoverUser";

export default function Post(props: any) {
  const { getUser } = useAuthContext();
  const [onComment, setOnComment] = useState(false);

  const [hovered, setHovered] = useState(false);
  const nav = useNavigate();
  return (
    <div className="post">
      {hovered && (
        <div
          onClick={() => {
            nav("../profile/" + props.data.User.nick);
          }}
          onMouseEnter={() => {
            setHovered(true);
          }}
          onMouseLeave={() => {
            setHovered(false);
          }}
        >
          <OnHoverUser data={props.data} />
        </div>
      )}
      <div
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
        className="post-up"
      >
        <div className="post-up-left">
          <GetProfilePicture url={props.data?.User?.profile_url} />
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
        <div
          onClick={() => {
            setOnComment(!onComment);
          }}
          className="comment"
        >
          <AnnotationIcon className="icons" />
          <div>Comment</div>
        </div>
        <div className="share">
          <ShareIcon className="icons" />
          <div className="">Share</div>
        </div>
      </div>
      {onComment && <Comment data={props.data} />}
    </div>
  );
}
