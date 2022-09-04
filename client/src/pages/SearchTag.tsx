import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { InfinitySpin } from "react-loader-spinner";
import { useParams } from "react-router-dom";
import ConnectRequest from "../components/ConnectRequest";
import { useConnectContext } from "../components/context/ConnectContext";
import { useUserContext } from "../components/context/UserContext";
import Post from "../components/Post";
import "../styles/Search.scss";

export default function SearchTag() {
  useEffect(() => {}, []);

  const { user } = useUserContext();

  return <div className="search-page">{<SearchPostTag user={user} />}</div>;
}

const SearchPostTag = (props: any) => {
  const [posts, setPosts] = useState<any>([]);
  const routeParams = useParams();

  useEffect(() => {
    if (props.user?.id) refetchData();
  }, [props.user]);

  const refetchData = () => {
    axios
      .get(`http://localhost:8080/post/search/tag`, {
        params: { tag: routeParams.tag, id: props.user.id },
      })
      .then((res) => {
        if (res.data.length === 0) hasMoreRef.current = false;

        setPosts(res.data);
      });
  };

  // Infinite Scroll

  const offsetRef = useRef<any>(3);

  const hasMoreRef = useRef<boolean>(true);

  const fetchMore = () => {
    console.log("Fetching...");
    axios
      .get(`http://localhost:8080/post/search/tag`, {
        params: {
          tag: routeParams.tag,
          email: props.user?.email,
          offset: offsetRef.current,
          limit: 3,
        },
      })
      .then((res) => {
        setTimeout(() => {
          if (res.data.length === 0) hasMoreRef.current = false;

          setPosts([
            ...posts,
            ...res.data.map((data: any) => {
              return data;
            }),
          ]);
          offsetRef.current += 3;
        }, 1000);
      });
  };

  return (
    <div className="post-search">
      <InfiniteScroll
        style={{
          overflow: "none",
        }}
        className="infinite"
        dataLength={posts.length}
        next={fetchMore}
        hasMore={hasMoreRef.current}
        loader={
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <InfinitySpin width="200" color="#808080" />
          </div>
        }
      >
        {posts &&
          posts.map((data: any, index: any) => {
            return <Post refetchData={refetchData} key={index} data={data} />;
          })}
      </InfiniteScroll>
    </div>
  );
};
