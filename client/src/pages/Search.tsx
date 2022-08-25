import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConnectRequest from "../components/ConnectRequest";
import { useConnectContext } from "../components/context/ConnectContext";
import { useUserContext } from "../components/context/UserContext";
import Post from "../components/Post";
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

  const { connects } = useConnectContext();
  const { user } = useUserContext();

  const [filterPeople, setFilterPeople] = useState(true);
  const [filterPosts, setFilterPosts] = useState(true);

  return (
    <div className="search-page">
      <div className="search-filter">
        Search Filters
        <div className="search-checkbox">
          <div className="">
            <input
              onChange={() => {
                setFilterPeople(!filterPeople);
              }}
              defaultChecked={true}
              type="checkbox"
            />
            <label htmlFor="">People</label>
          </div>
          <div className="">
            <input
              onChange={() => {
                setFilterPosts(!filterPosts);
              }}
              defaultChecked={true}
              type="checkbox"
            />
            <label htmlFor="">Posts</label>
          </div>
        </div>
      </div>

      {filterPeople && (
        <div className="search-page-white-box">
          <div className="">People</div>

          {users.length === 0 && <div>No User Matched</div>}

          {users.map(({ id, name, profile_url }) => {
            return (
              <ConnectRequest
                isUser={id === user?.id ? true : false}
                connected={connects?.includes(id) ? true : false}
                profile_url={profile_url}
                id={id}
                key={id + name}
                name={name}
              />
            );
          })}
        </div>
      )}

      {filterPosts && <SearchPost user={user} />}
    </div>
  );
}

const SearchPost = (props: any) => {
  const [posts, setPosts] = useState([]);
  const routeParams = useParams();

  useEffect(() => {
    if (props.user?.id) refetchData();
  }, [props.user]);

  const refetchData = () => {
    axios
      .get(`http://localhost:8080/post/search`, {
        params: { query: routeParams.query, id: props.user.id },
      })
      .then((res) => {
        console.log(res.data);
        setPosts(res.data);
      });
  };

  return (
    <div className="post-search">
      {posts.map((data: any) => {
        return <Post refetchData={refetchData} key={data.text} data={data} />;
      })}
    </div>
  );
};
