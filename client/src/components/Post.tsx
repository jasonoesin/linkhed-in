import { AnnotationIcon, ShareIcon, ThumbUpIcon } from "@heroicons/react/solid";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Post.scss";
import Comment from "./Comment";
import { useAuthContext } from "./context/AuthContext";
import { GetProfilePicture } from "./firebase/GetProfilePicture";
import OnHoverUser from "./OnHoverUser";
import parse from "html-react-parser";
import linkifyHtml from "linkify-html";
import * as linkify from "linkifyjs";

export default function Post(props: any) {
  const { getUser } = useAuthContext();
  const [onComment, setOnComment] = useState(false);

  const [hovered, setHovered] = useState(false);
  const nav = useNavigate();

  const richText = (str: any) => {
    var split = str.split(" ");

    split = split.map((d: any) => {
      if (d.charAt(0) === "@") {
        return `<a href ="/profile/${d.slice(
          1,
          d.length
        )}" className="rich-text-at"> ${d} </a>`;
      }

      if (d.charAt(0) === "#") {
        return `<a href ="/search/tag/${d.slice(
          1,
          d.length
        )}" className="rich-text-hash-tag"> ${d} </a>`;
      }

      return d;
    });

    split.join(" ");

    const newStr = split.join(" ");

    const options = {
      attributes: null,
      className: "rich-text-url",
      defaultProtocol: "http",
      events: null,
      format: (value: any, type: any) => value,
      formatHref: (href: any, type: any) => href,
      ignoreTags: [],
      nl2br: false,
      rel: null,
      tagName: "a",
      target: null,
      truncate: 0,
      validate: true,
    };

    return linkifyHtml(newStr, options);
  };

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
      <div className="post-text">
        {props.data?.text ? parse(richText(props.data?.text)) : null}
      </div>

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
          <div className="comment-count">
            {props.data?.total_comment} Comment
          </div>
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
                    // console.log(res.data);
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
                    // console.log(res.data);
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
