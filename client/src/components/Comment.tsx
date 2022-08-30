import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import "../styles/Comment.scss";
import { useToastContext } from "./context/ToastContext";
import { useUserContext } from "./context/UserContext";
import { GetProfilePicture } from "./firebase/GetProfilePicture";

export default function Comment(props: any) {
  const { user } = useUserContext();
  const { ToastError } = useToastContext();

  const [comment, setComment] = useState<any>([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/comment`, {
        params: { post_id: props.data?.post_id },
      })
      .then((res) => {
        if (!res.data) {
          setNext(false);
          return;
        }
        if (res.data?.length === 0) {
          setNext(false);
          return;
        }
        setComment(res.data);
      });
  }, []);

  const offsetRef = useRef<any>(3);
  const [next, setNext] = useState<any>(true);
  const [isFetching, setFetching] = useState<any>(false);

  const fetchMore = () => {
    console.log("Fetching...");
    setNext(false);
    setFetching(true);
    axios
      .get(`http://localhost:8080/comment`, {
        params: {
          post_id: props.data?.post_id,
          offset: offsetRef.current,
        },
      })
      .then((res) => {
        setTimeout(() => {
          if (res.data === null || res.data === undefined) {
            setNext(false);
            setFetching(false);
            return;
          }
          if (res.data.length === 0) {
            setNext(false);
            setFetching(false);

            return;
          }

          console.log(res.data);

          setComment([
            ...comment,
            ...res.data.map((data: any) => {
              return data;
            }),
          ]);
          offsetRef.current += 3;
          setFetching(false);
          setNext(true);
        }, 1500);
      });
  };

  return (
    <form
      onSubmit={(e: any) => {
        e.preventDefault();
        const text = e.target.text.value;

        if (text === "") {
          ToastError("Comment must have a text content to be posted.");
        } else {
          var json = {
            user_id: user?.id,
            post_id: props.data?.post_id,
            content: text,
          };

          axios.post(`http://localhost:8080/comment`, json).then((res) => {
            offsetRef.current += 1;
            const newData = {
              Comment: res.data,
              User: user,
            };

            setComment([newData, ...comment]);
          });
        }
      }}
      className="comment"
    >
      <hr />
      <div className="start-comment">
        <GetProfilePicture url={user?.profile_url} />
        <textarea id="text" />
      </div>
      <button className="comment-button">Post</button>
      <CommentRenderer comment={comment} data={props?.data} />
      {next && (
        <button
          type="button"
          onClick={() => {
            fetchMore();
          }}
          className="loadmore"
        >
          Load More Comments
        </button>
      )}
      {isFetching && (
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <InfinitySpin width="200" color="#808080" />
        </div>
      )}
    </form>
  );
}

const CommentRenderer = (props: any) => {
  return (
    <>
      {props.comment &&
        props.comment.map((data: any, index: any) => {
          return (
            <CommentComponent
              key={index}
              comment={data.Comment}
              user={data.User}
            />
          );
        })}
      {/* 
      <Reply />
      <Reply /> */}
    </>
  );
};

const CommentComponent = (props: any) => {
  return (
    <div className="comment-component">
      <div className="left">
        <div className="comment-pic">
          <GetProfilePicture url={props.user?.profile_url} />
        </div>
      </div>
      <div className="right">
        <div className="comment-content">
          <div className="name">{props?.user?.name}</div>
          <div className="occupation">{props?.user?.occupation}</div>
          {props?.comment?.content}
          {/* similique incidunt ipsa. Lorem ipsum dolor sit, amet consectetur
          adipisicing elit. Commodi amet quo nihil, tempore dolore beatae
          blanditiis modi repudiandae optio debitis libero dignissimos ipsam.
          Recusandae sunt ab doloremque pariatur aliquam harum. Veniam maiores
          repellat quam voluptatum earum, similique et perferendis modi alias
          eos sapiente pariatur molestias temporibus, porro voluptates sit
          blanditiis quisquam? Voluptate, blanditiis! Deleniti eaque, sint
          accusantium deserunt repellat ipsum. */}
        </div>
        <div className="comment-bottom">
          <div className="bottom-left">
            <div className="like">Like</div>
            <div className="reply">Reply</div>
          </div>
          <div className="bottom-right">
            <div className="total-like">0 Likes</div>
            <div className="total-reply">0 Replies</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reply = (props: any) => {
  return (
    <div className="reply">
      <div className="comment-component">
        <div className="left">
          <div className="comment-pic">
            <img src="https://picsum.photos/300" alt="" />
          </div>
        </div>
        <div className="right">
          <div className="comment-content">
            <div className="name">Name</div>
            <div className="occupation">Occupation</div>
            Sunt ab similique incidunt ipsa.
          </div>
          <div className="comment-bottom">
            <div className="bottom-left">
              <div className="like">Like</div>
              <div className="reply">Reply</div>
            </div>
            <div className="bottom-right">
              <div className="total-like">0 Likes</div>
              <div className="total-reply">0 Replies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
