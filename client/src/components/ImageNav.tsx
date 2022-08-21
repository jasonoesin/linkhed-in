import { HomeIcon } from "@heroicons/react/solid";
import { useNavigate } from "react-router-dom";
import "../styles/ImageNav.scss";

export default function ImageNav(props: any) {
  const nav = useNavigate();
  return (
    <div
      onClick={() => {
        nav(props.link);
      }}
      className="imageNav"
    >
      {props.children}
      <div>{props.text}</div>
    </div>
  );
}
