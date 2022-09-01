import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConnectInvite from "../components/ConnectInvite";
import { useToastContext } from "../components/context/ToastContext";
import { useUserContext } from "../components/context/UserContext";
import { GetProfilePicture } from "../components/firebase/GetProfilePicture";
import "../styles/Network.scss";

export default function Network() {
  const [conReq, setConReq] = useState<any[]>([]);

  const data = JSON.parse(localStorage?.getItem("data")!);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/request-connect`, {
        params: { email: data.email },
      })
      .then((res) => {
        setConReq(res.data);
      });
  }, []);

  const handleRequest = (id: any) => {
    var tempArr = conReq.filter((obj) => {
      return obj.id !== id;
    });
    setConReq(tempArr);
  };

  return (
    <div className="page">
      <div className="page-container">
        <div className="invitation">
          <div className="title">Invitations</div>
          <div className="example">
            {conReq.length === 0 && <div>No Connection Request Matched</div>}

            {conReq.map(({ id, name, profile_url }) => {
              return (
                <ConnectInvite
                  url={profile_url ? profile_url : null}
                  id={id}
                  key={id + name}
                  name={name}
                  handleRequest={handleRequest}
                />
              );
            })}
          </div>
        </div>
        <div className="other-user">
          <div className="text">Users You Might Know</div>
          <Avatar />
        </div>
      </div>
    </div>
  );
}

const Avatar = (props: any) => {
  const [users, setUsers] = useState<any>([]);
  const { user } = useUserContext();

  useEffect(() => {
    axios
      .get(`http://localhost:8080//user/recommend`, {
        params: { email: user?.email },
      })
      .then((res) => {
        if (res.data === "") {
          setUsers([]);
          return;
        }
        setUsers(res.data);
      });
  }, [user]);

  return (
    <>
      {users.length === 0 && <div>No Recommendation Matched</div>}

      {users &&
        users.map((u: any) => {
          return <UserAvatar data={u} />;
        })}
    </>
  );
};

const UserAvatar = (props: any) => {
  const nav = useNavigate();
  return (
    <div
      onClick={() => {
        nav("../profile/" + props.data?.nick);
      }}
      className="user-avatar"
    >
      <GetProfilePicture url={props.data?.profile_url} />
      <div className="user-avatar-desc">
        <div className="user-avatar-desc-name">{props.data?.name}</div>
        <div className="user-avatar-desc-occupation">
          {props.data?.occupation}
        </div>
      </div>
    </div>
  );
};
