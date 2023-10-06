import { Link } from "react-router-dom";
import convertEditorJSDataToHTML from "./ConvertEditorJSDataToHTML";
import { userSelector } from "../reduxFiles/selectors";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { profilePicURL } from "../utils/imageURLS";

// eslint-disable-next-line react/prop-types
const Preview = ({ theData, title }) => {
  let user = useSelector(userSelector);
  user = user.userData;

  const [fullName, setFullName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (user) {
      if (user.first_name || user.last_name) {
        setFullName(`${user.first_name} ${user.last_name}`);
      }
      if (user && user.bio) {
        setBio(user.bio);
      }
    }

    if (user && user.profile_pic) {
      setProfilePic(profilePicURL + `${user.profile_pic}`);
    } else {
      setProfilePic("/Profile_Image_Placeholder-small.jpg");
    }
  }, [user]);

  return (
    <main className="min-h-screen  px-4 max-w-[700px] mx-auto">
      <h1 className="text-center font-bold text-2xl min-[500px]:text-3xl mx-6">
        {title ? title : "Your Title"}
      </h1>

      <Link className="my-6 block">
        <figure className="flex items-center ">
          <div className="rounded-full overflow-hidden mr-4 flex-[0_0_40px] h-[40px]">
            <img alt="Profile picture" src={profilePic} />
          </div>

          <figcaption>
            <p id="one-line-ellipsis">{fullName ? fullName : "Your name"}</p>
          </figcaption>
        </figure>

        <small>Published: Publish date</small>
      </Link>

      {convertEditorJSDataToHTML(theData)}

      <figure className="pt-8 pb-16">
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden mr-4">
          <img alt="Profile picture" src={profilePic} />
        </div>

        <figcaption className="mt-4">
          <p className="my-4">
            Written by <strong> {fullName ? fullName : "Your name"}</strong>
          </p>
          <p>{bio ? bio : "Your about will go here"}</p>
        </figcaption>
      </figure>
    </main>
  );
};

export default Preview;
