import CreatePost from "../components/CreatePost";
import Post from "../components/Post";
import "../styles/Home.scss";

const Home = () => {
  return (
    <div className="home">
      <div className="home-container">
        <div className="create-post">
          <CreatePost />
        </div>
        {/* Example Post */}
        <Post />
      </div>
    </div>
  );
};

export default Home;
