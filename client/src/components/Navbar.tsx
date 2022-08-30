import React, { useEffect, useRef, useState } from "react";

import "../styles/Navbar.scss";
import ImageNav from "./ImageNav";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  BriefcaseIcon,
  ChatIcon,
  GlobeIcon,
  HomeIcon,
} from "@heroicons/react/solid";
import { useUserContext } from "./context/UserContext";
import { GetProfilePicture } from "./firebase/GetProfilePicture";

const Profile = () => {
  const [pop, setPop] = useState(false);
  const nav = useNavigate();

  let curr = useRef<any>();

  const { user } = useUserContext();

  useEffect(() => {
    let handler = (e: any) => {
      if (curr?.current == undefined) return;
      if (!curr?.current?.contains(e.target)) setPop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  return (
    <>
      <div ref={curr}>
        <div
          onClick={() => {
            setPop((pop) => !pop);
          }}
          className=""
        >
          <ImageNav text={"Me🡇"}>
            <GetProfilePicture url={user?.profile_url} />
          </ImageNav>
        </div>

        {pop && (
          <div className="profile-bar">
            <div className="Name">{user?.name}</div>
            <div
              onClick={() => {
                nav("./profile/" + user?.nick);
              }}
              className="profile"
            >
              My Profile
            </div>
            <div
              onClick={() => {
                localStorage.removeItem("data");
                nav("/");
              }}
              className="sign-out"
            >
              Sign Out
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default function Navbar() {
  const nav = useNavigate();

  return (
    <div className="nav-container">
      <div className="navbar">
        <div className="left">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            data-supported-dps="24x24"
            fill="currentColor"
            className="mercado-match"
            width="48"
            height="48"
            focusable="false"
          >
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
          </svg>
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as any).value !== "") {
                nav("/search/" + (e.target as HTMLInputElement).value);
                location.reload();
              }
            }}
            type="text"
          />
        </div>

        <div className="right">
          <ImageNav link={"/home"} text={"Home"}>
            <HomeIcon className="icon" />
          </ImageNav>
          <ImageNav link={"/network"} text={"My Network"}>
            <GlobeIcon className="icon" />
          </ImageNav>
          <ImageNav link={"/job"} text={"Jobs"}>
            <BriefcaseIcon className="icon" />
          </ImageNav>
          <ImageNav link={"/messaging"} text={"Messaging"}>
            <ChatIcon className="icon" />
          </ImageNav>
          <ImageNav link={"/notification"} text={"Notification"}>
            <BellIcon className="icon" />
          </ImageNav>
          <Profile />
        </div>
      </div>
    </div>
  );
}
