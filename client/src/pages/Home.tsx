import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../components/context/AuthContext";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";
import "../styles/Home.scss";
import InfiniteScroll from "react-infinite-scroll-component";
import { InfinitySpin } from "react-loader-spinner";

const Home = () => {
  return (
    <div className="home">
      <div className="home-container">
        <PostRenderer />
      </div>
    </div>
  );
};

const PostRenderer: any = () => {
  const [posts, setPosts] = useState<any>([]);

  const { getUser } = useAuthContext();

  useEffect(() => {
    refetchData();
  }, []);

  const refetchData = () => {
    axios
      .get(`http://localhost:8080/post`, {
        params: { email: getUser().email },
      })
      .then((res) => {
        if (res.data.length === 0) hasMoreRef.current = false;

        setPosts(res.data);
      });
  };

  const offsetRef = useRef<any>(3);

  const hasMoreRef = useRef<boolean>(true);

  const fetchMore = () => {
    // console.log("Fetching...");
    axios
      .get(`http://localhost:8080/post`, {
        params: {
          email: getUser().email,
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
        }, 1500);
      });
  };

  // console.log("Post :", posts);

  return (
    <>
      <div className="create-post">
        <CreatePost refetchData={refetchData} />
      </div>
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
        {posts.map((data: any) => {
          return <Post refetchData={refetchData} key={data.text} data={data} />;
        })}
      </InfiniteScroll>
    </>
  );
};

export default Home;
