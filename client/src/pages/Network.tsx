import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConnectInvite from "../components/ConnectInvite";
import { useToastContext } from "../components/context/ToastContext";
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
        <div className="other-user"></div>
      </div>
    </div>
  );
}
