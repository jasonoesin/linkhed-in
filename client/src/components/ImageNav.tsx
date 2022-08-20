import { HomeIcon } from "@heroicons/react/solid";
import "../styles/ImageNav.scss";

export default function ImageNav(props: any) {
  return (
    <div className="imageNav">
      <HomeIcon className="home-icon" />
      <div>{props.text}</div>
    </div>
  );
}
