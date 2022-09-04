import { PhotographIcon, VideoCameraIcon, XIcon } from "@heroicons/react/solid";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "../styles/CreatePostPop.scss";
import { useAuthContext } from "./context/AuthContext";
import storage from "../../firebase-config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useUserContext } from "./context/UserContext";
import { GetProfilePicture } from "./firebase/GetProfilePicture";
import linkifyHtml from "linkify-html";
import * as linkify from "linkifyjs";
import parse from "html-react-parser";
import { MentionsInput, Mention } from "react-mentions";
import { useToast } from "react-toastify";
import { useToastContext } from "./context/ToastContext";
import { useConnectContext } from "./context/ConnectContext";

export default function CreatePostPop({ handleCloseIcon, refetchData }: any) {
  const [selectedImage, setSelectedImage] = useState<any | null>();
  const [selectedVideo, setSelectedVideo] = useState<any | null>();

  const { getUser } = useAuthContext();
  const { user } = useUserContext();

  const imageChange = (e: any) => {
    if (selectedVideo) removeSelectedVideo();

    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const videoChange = (e: any) => {
    if (selectedImage) removeSelectedImage();

    if (e.target.files && e.target.files.length > 0) {
      setSelectedVideo(e.target.files[0]);
    }
  };

  const removeSelectedVideo = () => {
    setSelectedVideo(null);
  };

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

  const [mention, setMention] = useState("");

  const { ToastError } = useToastContext();

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
            <GetProfilePicture url={user?.profile_url} />
          </div>
          <div className="name">{user?.name}</div>
        </div>
        <MentionsInput
          placeholder="What's on your mind ?"
          style={{
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
            filterText(e.target.value);
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
        {selectedImage && (
          <div className="preview">
            <img src={URL.createObjectURL(selectedImage)} alt="Image" />
            <XIcon onClick={removeSelectedImage} className="x-icon" />
          </div>
        )}
        {selectedVideo && (
          <div className="preview">
            <video autoPlay>
              <source src={URL.createObjectURL(selectedVideo)} />
            </video>
            <XIcon onClick={removeSelectedVideo} className="x-icon" />
          </div>
        )}
        <div className="icons">
          <div className="">
            <PhotographIcon className="photo-icon" />
            <input accept="image/*" type="file" onChange={imageChange} />
          </div>
          <div className="">
            <VideoCameraIcon className="photo-icon" />
            <input accept="video/*" type="file" onChange={videoChange} />
          </div>
        </div>

        <button
          onClick={() => {
            if (mention === "") {
              ToastError("You must at enter a text content!");
              return;
            }

            var json = {
              text: filterText(mention),
              email: getUser().email,
              tags: tags.current,
            };

            console.log(tags.current);

            axios.post(`http://localhost:8080/post`, json).then((res) => {
              if (selectedImage || selectedVideo) {
                const storageRef = ref(
                  storage,
                  `/${res.data.post_id}/${
                    selectedImage ? selectedImage.name : selectedVideo.name
                  }`
                );
                const uploadTask = uploadBytesResumable(
                  storageRef,
                  selectedImage ? selectedImage : selectedVideo
                ).then((s) => {
                  getDownloadURL(s.ref).then((downloadURL) => {
                    var json = {
                      post_id: res.data.post_id,
                      text: filterText(mention),
                      email: getUser().email,
                      tags: tags.current,
                      asset: downloadURL,
                      asset_type: selectedImage ? "image" : "video",
                    };

                    axios
                      .patch(`http://localhost:8080/post`, json)
                      .then((res) => {
                        handleCloseIcon();
                        refetchData();
                      });
                  });
                });
              } else {
                handleCloseIcon();
                refetchData();
              }
            });
          }}
          className="create-post  "
        >
          Create Post
        </button>
      </div>
    </div>
  );
}
