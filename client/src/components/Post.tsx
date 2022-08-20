import { AnnotationIcon, ShareIcon, ThumbUpIcon } from "@heroicons/react/solid";
import React from "react";
import "../styles/Post.scss";

export default function Post(props: any) {
  return (
    <div className="post">
      <div className="post-up">
        <div className="post-up-left">
          <img src="https://picsum.photos/300/300" />
        </div>

        <div className="post-up-right">
          <div className="post-up-right-name">[[Name]]</div>
        </div>
      </div>
      <div className="post-text">Example Text</div>

      {/* Example image */}
      <div className="post-image">
        <img src="https://picsum.photos/400/400" />
      </div>

      <div className="post-footer-up">
        <div className="left">
          <ThumbUpIcon className="thumbs" />
          <div className="like-count">69</div>
        </div>
        <div className="right">
          <div className="comment-count">300 Comment</div>
          <div className="share-count">300 Shares</div>
        </div>
      </div>
      <div className="post-footer-down">
        <div className="like">
          <ThumbUpIcon className="icons" />
          <div>Like</div>
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
