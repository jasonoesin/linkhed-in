import profile_bg from "../../assets/profile_bg.jpg";

export const GetBackgroundPicture = (props: any) => {
  return (
    <img
      crossOrigin="anonymous"
      src={props.url ? props.url : profile_bg}
      alt=""
    />
  );
};
