import axios from "axios";
import { useEffect, useState } from "react";
import { useAuthContext } from "../components/context/AuthContext";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";
import "../styles/Home.scss";

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
  const [posts, setPosts] = useState([]);

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
        setPosts(res.data);
      });
  };

  return (
    <>
      <div className="create-post">
        <CreatePost refetchData={refetchData} />
      </div>
      {posts.map((data: any) => {
        return <Post refetchData={refetchData} key={data.text} data={data} />;
      })}
    </>
  );
};

export default Home;
