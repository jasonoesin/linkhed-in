import axios from "axios";
import React, {
  createRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
} from "react";
import { InfinitySpin } from "react-loader-spinner";
import "../styles/Comment.scss";
import { useToastContext } from "./context/ToastContext";
import { useUserContext } from "./context/UserContext";
import { GetProfilePicture } from "./firebase/GetProfilePicture";
import linkifyHtml from "linkify-html";
import parse from "html-react-parser";
import { Mention, MentionsInput } from "react-mentions";

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

export default function Comment(props: any) {
  const { user } = useUserContext();
  const { ToastError } = useToastContext();

  const [comment, setComment] = useState<any>([]);

  useEffect(() => {
    refetch();
  }, []);

  const refetch = () => {
    console.log("Fetching");
    axios
      .get(`http://localhost:8080/comment`, {
        params: { post_id: props.data?.post_id, user_id: user?.id },
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
  };

  const updateComment = (data: any) => {
    setComment(
      comment.filter((obj: any) => {
        if (obj.Comment.CommentId === data.CommentId) {
          obj.total_likes = obj.liked
            ? obj.total_likes - 1
            : obj.total_likes + 1;
          obj.liked = !obj.liked;
        }
        return obj;
      })
    );
  };

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
          user_id: user?.id,
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
        }, 1000);
      });
  };

  const [mention, setMention] = useState("");

  const [connected, setConnected] = useState([]);
  const [tagSuggestions, setTags] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/connection/rich`, {
        params: { email: user?.email },
      })
      .then((res) => {
        const data = res.data.map((user: any) => {
          return {
            id: user.nick,
            display: user.nick,
          };
        });
        setConnected(data);
      });

    axios
      .get(`http://localhost:8080/tags`, {
        params: {},
      })
      .then((res) => {
        if (res.data === null) {
          setTags([]);
          return;
        }

        const data = res.data.map((d: any) => {
          return {
            id: d,
            display: d,
          };
        });

        setTags(data);
      });
  }, [user]);

  const tags = useRef<any>();

  const filterText = (str: any) => {
    var split = str.split(" ");

    tags.current = [];

    split = split.map((d: any) => {
      if (d.includes("@") && d.includes("[") && d.includes("]")) {
        return "@" + d.slice(d.indexOf("[") + 1, d.indexOf("]"));
      }

      if (d.includes("#") && d.includes("[") && d.includes("]")) {
        tags.current.push(d.slice(d.indexOf("[") + 1, d.indexOf("]")));
        return "#" + d.slice(d.indexOf("[") + 1, d.indexOf("]"));
      }

      if (d.includes("#")) {
        tags.current.push(d.slice(1, d.length));
        return "#" + d.slice(1, d.length);
      }

      return d;
    });

    var newStr = split.join(" ");

    return newStr;
  };

  return (
    <div className="comment">
      <form
        onSubmit={(e: any) => {
          e.preventDefault();
          const text = filterText(mention);

          if (text === "") {
            ToastError("Comment must have a text content to be posted.");
          } else {
            var json = {
              user_id: user?.id,
              post_id: props.data?.post_id,
              content: text,
              tags: tags.current,
            };

            axios.post(`http://localhost:8080/comment`, json).then((res) => {
              offsetRef.current += 1;
              const newData = {
                Comment: res.data,
                User: user,
                total_likes: 0,
                liked: false,
              };

              const newComments = [newData, ...comment];
              setComment(newComments);
            });
          }
        }}
      >
        <hr />
        <div className="start-comment">
          <GetProfilePicture url={user?.profile_url} />
          <MentionsInput
            placeholder="What's on your mind ?"
            style={{
              margin: "0",
              fontSize: "13px",
              width: "24rem",
              suggestions: {
                list: {
                  backgroundColor: "white",
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: 14,
                },
                item: {
                  padding: "5px 15px",
                  borderBottom: "1px solid rgba(0,0,0,0.15)",
                  "&focused": {
                    backgroundColor: "#cee4e5",
                  },
                },
              },
            }}
            forceSuggestionsAboveCursor={true}
            className="mention-input"
            value={mention}
            onChange={(e) => {
              console.log(filterText(e.target.value));
              setMention(e.target.value);
            }}
          >
            <Mention
              appendSpaceOnAdd={true}
              style={{
                backgroundColor: "#DB7093",
              }}
              markup={"@[__id__]"}
              trigger="@"
              data={connected}
            />
            <Mention
              appendSpaceOnAdd={true}
              style={{
                backgroundColor: "#DEB887",
              }}
              markup={"#[__id__]"}
              trigger="#"
              data={tagSuggestions}
            />
          </MentionsInput>
        </div>
        <button className="comment-button">Post</button>
      </form>

      <CommentRenderer
        post_id={props.data?.post_id}
        suggestions={{ connected, tagSuggestions }}
        updateComment={updateComment}
        comment={comment}
        data={props?.data}
      />
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
    </div>
  );
}

const CommentRenderer = forwardRef((props: any, ref) => {
  return (
    <>
      {props.comment &&
        props.comment.map((data: any, index: any) => {
          return (
            <CommentComponent
              post_id={props?.post_id}
              suggestions={props.suggestions}
              updateComment={props.updateComment}
              key={index}
              comment={data.Comment}
              user={data.User}
              total_likes={data.total_likes}
              liked={data.liked}
            />
          );
        })}
    </>
  );
});

const CommentComponent = forwardRef((props: any, ref) => {
  const [onReply, setOnReply] = useState<any>();
  const { user } = useUserContext();
  const { ToastError } = useToastContext();

  const [replies, setReplies] = useState<any>([]);

  useEffect(() => {
    refetchReplies();
  }, []);

  const refetchReplies = () => {
    offsetRef.current = 1;

    axios
      .get(`http://localhost:8080/reply`, {
        params: { comment_id: props.comment?.CommentId, user_id: user?.id },
      })
      .then((res) => {
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

        setReplies(res.data);
      });
  };

  const updateReply = (data: any) => {
    setReplies(
      replies.filter((obj: any) => {
        if (obj.Reply.ReplyId === data.reply_id)
          obj.total_likes = obj.liked
            ? obj.total_likes - 1
            : obj.total_likes + 1;
        obj.liked = !obj.liked;

        return obj;
      })
    );
  };

  const offsetRef = useRef<any>(1);
  const [next, setNext] = useState<any>(true);
  const [isFetching, setFetching] = useState<any>(false);

  const fetchMore = () => {
    console.log("Fetching...");
    setNext(false);
    setFetching(true);
    axios
      .get(`http://localhost:8080/reply`, {
        params: {
          comment_id: props.comment?.CommentId,
          offset: offsetRef.current,
          user_id: user?.id,
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

          setReplies([
            ...replies,
            ...res.data.map((data: any) => {
              return data;
            }),
          ]);
          offsetRef.current += 3;
          setFetching(false);
          setNext(true);
        }, 1000);
      });
  };

  const [mention, setMention] = useState("");

  const tags = useRef<any>();

  const filterText = (str: any) => {
    var split = str.split(" ");

    tags.current = [];

    split = split.map((d: any) => {
      if (d.includes("@") && d.includes("[") && d.includes("]")) {
        return "@" + d.slice(d.indexOf("[") + 1, d.indexOf("]"));
      }

      if (d.includes("#") && d.includes("[") && d.includes("]")) {
        tags.current.push(d.slice(d.indexOf("[") + 1, d.indexOf("]")));
        return "#" + d.slice(d.indexOf("[") + 1, d.indexOf("]"));
      }

      if (d.includes("#")) {
        tags.current.push(d.slice(1, d.length));
        return "#" + d.slice(1, d.length);
      }

      return d;
    });

    var newStr = split.join(" ");

    return newStr;
  };

  return (
    <>
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
            {props?.comment?.content &&
              parse(richText(props?.comment?.content))}
          </div>
          <div className="comment-bottom">
            <div className="bottom-left">
              {!props.liked && (
                <div
                  onClick={() => {
                    const json = {
                      comment_id: props?.comment?.CommentId,
                      user_id: user?.id,
                    };
                    axios
                      .post(`http://localhost:8080/comment/like`, json)
                      .then((res) => {
                        props.updateComment(res.data);
                      });
                  }}
                  className="like"
                >
                  Like
                </div>
              )}
              {props.liked && (
                <div
                  onClick={() => {
                    const json = {
                      comment_id: props?.comment?.CommentId,
                      user_id: user?.id,
                    };
                    axios
                      .post(`http://localhost:8080/comment/unlike`, json)
                      .then((res) => {
                        props.updateComment(res.data);
                      });
                  }}
                  className="like"
                >
                  Unlike
                </div>
              )}
              <div
                onClick={() => {
                  setOnReply(!onReply);
                }}
                className="reply"
              >
                Reply
              </div>
            </div>
            <div className="bottom-right">
              <div className="total-like">{props.total_likes} Likes</div>
              <div className="total-reply">0 Replies</div>
            </div>
          </div>
        </div>
      </div>
      {replies &&
        replies.map((data: any, index: any) => {
          return (
            <Reply
              post_id={props?.post_id}
              updateReply={updateReply}
              current={user}
              setOnReply={setOnReply}
              key={index}
              data={data}
            />
          );
        })}
      {replies && next && (
        <button
          type="button"
          onClick={() => {
            fetchMore();
          }}
          className="loadmore more-reply"
        >
          Load More Replies
        </button>
      )}
      {isFetching && (
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <InfinitySpin width="200" color="#808080" />
        </div>
      )}

      {onReply && (
        <form
          action=""
          onSubmit={(e: any) => {
            e.preventDefault();
            const text = filterText(mention);

            if (text === "") {
              ToastError("Comment must have a text content to be posted.");
            } else {
              var json = {
                user_id: user?.id,
                comment_id: props.comment?.CommentId,
                content: text,
                post_id: props?.post_id,
                tags: tags.current,
              };

              axios.post(`http://localhost:8080/reply`, json).then((res) => {
                offsetRef.current += 1;
                const newData = {
                  Reply: res.data,
                  User: user,
                  likes: false,
                  total_likes: 0,
                };
                setReplies([...replies, newData]);
              });
            }
          }}
          className="start-comment start-reply"
        >
          <div className="top">
            <GetProfilePicture url={user?.profile_url} />

            <MentionsInput
              placeholder="What's on your mind ?"
              style={{
                margin: "0",
                fontSize: "13px",
                width: "24rem",
                suggestions: {
                  list: {
                    backgroundColor: "white",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 14,
                  },
                  item: {
                    padding: "5px 15px",
                    borderBottom: "1px solid rgba(0,0,0,0.15)",
                    "&focused": {
                      backgroundColor: "#cee4e5",
                    },
                  },
                },
              }}
              forceSuggestionsAboveCursor={true}
              className="mention-input"
              value={mention}
              onChange={(e) => {
                console.log(filterText(e.target.value));
                setMention(e.target.value);
              }}
            >
              <Mention
                appendSpaceOnAdd={true}
                style={{
                  backgroundColor: "#DB7093",
                }}
                markup={"@[__id__]"}
                trigger="@"
                data={props.suggestions?.connected}
              />
              <Mention
                appendSpaceOnAdd={true}
                style={{
                  backgroundColor: "#DEB887",
                }}
                markup={"#[__id__]"}
                trigger="#"
                data={props.suggestions?.tagSuggestions}
              />
            </MentionsInput>

            {/* <textarea id="text" /> */}
          </div>

          <button className="comment-button">Reply</button>
        </form>
      )}
    </>
  );
});

const Reply = (props: any) => {
  const reply = props.data?.Reply;
  const user = props.data?.User;

  return (
    <div className="reply">
      <div className="comment-component">
        <div className="left">
          <div className="comment-pic">
            <GetProfilePicture url={user?.profile_url} />
          </div>
        </div>
        <div className="right">
          <div className="comment-content">
            <div className="name">{user?.name}</div>
            <div className="occupation">{user?.occupation}</div>
            {reply?.content && parse(richText(reply?.content))}
          </div>
          <div className="comment-bottom">
            <div className="bottom-left">
              {!props.data.liked && (
                <div
                  onClick={() => {
                    const json = {
                      reply_id: reply.ReplyId,
                      user_id: props?.current?.id,
                    };

                    axios
                      .post(`http://localhost:8080/reply/like`, json)
                      .then((res) => {
                        props.updateReply(res.data);
                      });
                  }}
                  className="like"
                >
                  Like
                </div>
              )}
              {props.data.liked && (
                <div
                  onClick={() => {
                    const json = {
                      reply_id: reply.ReplyId,
                      user_id: props?.current?.id,
                    };

                    axios
                      .post(`http://localhost:8080/reply/unlike`, json)
                      .then((res) => {
                        props.updateReply(res.data);
                      });
                  }}
                  className="like"
                >
                  Unlike
                </div>
              )}

              <div
                onClick={() => {
                  props.setOnReply(true);
                }}
                className="reply"
              >
                Reply
              </div>
            </div>
            <div className="bottom-right">
              <div className="total-like">{props?.data?.total_likes} Likes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
