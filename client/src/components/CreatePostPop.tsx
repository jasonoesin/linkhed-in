import { PhotographIcon, VideoCameraIcon, XIcon } from "@heroicons/react/solid";
import axios from "axios";
import React, { useRef, useState } from "react";
import "../styles/CreatePostPop.scss";
import { useAuthContext } from "./context/AuthContext";
import storage from "../../firebase-config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export default function CreatePostPop({ handleCloseIcon, refetchData }: any) {
  const [selectedImage, setSelectedImage] = useState<any | null>();
  const [selectedVideo, setSelectedVideo] = useState<any | null>();

  const { user, getUser } = useAuthContext();

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

  const area = useRef<any>();

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
        <textarea ref={area} placeholder="What do you want to talk about?" />
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
            if (area.current.value === "") return;

            var json = {
              text: area.current.value,
              email: getUser().email,
            };

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
                      text: area.current.value,
                      email: getUser().email,
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
