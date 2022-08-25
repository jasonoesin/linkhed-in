import profile from "../../assets/profile_pic.jpg";

export const GetProfilePicture = (props: any) => {
  return <img src={props.url ? props.url : profile} alt="" />;
};
