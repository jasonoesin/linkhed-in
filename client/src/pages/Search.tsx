import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConnectRequest from "../components/ConnectRequest";
import "../styles/Search.scss";

export default function Search() {
  const [users, setUsers] = useState([]);

  const routeParams = useParams();
  useEffect(() => {
    axios
      .get(`http://localhost:8080/search-user`, {
        params: { value: routeParams.query },
      })
      .then((res) => {
        setUsers(res.data);
      });
  }, []);

  return (
    <div className="search-page">
      <div className="search-page-white-box">
        <div className="">People</div>

        {users.length === 0 && <div>No User Matched</div>}

        {users.map(({ id, name, email }) => {
          return <ConnectRequest id={id} key={id + name} name={name} />;
        })}
      </div>
    </div>
  );
}
