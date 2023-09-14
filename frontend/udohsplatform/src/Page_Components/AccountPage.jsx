import { MdWorkspacePremium } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { profilePicURL } from "../utils/imageURLS";
import Loader from "./loader";
import axiosClient from "../utils/axiosSetup";
import { userSelector } from "../reduxFiles/selectors";
import { useSelector } from "react-redux";

const AccountPage = () => {
  const has_articles = true;

  const loggedInUser = useSelector(userSelector);

  const [user, setUser] = useState(null);
  const [userIsLoading, setUserIsLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getUserAccount = async () => {
      setUserIsLoading(true);
      try {
        // Check if the account requested exist
        const response = await axiosClient.get(`/api/account/${id}`);
        if (response.status === 200) {
          setUser(response.data);

          if (
            loggedInUser.userData &&
            loggedInUser.userData.id === response.data.id
          ) {
            console.log("In userprofile");
            navigate("/userProfile");
          } else {
            setUserIsLoading(false);
          }
        }
      } catch (e) {
        console.log("In catch error");
        console.log(e);
        navigate(-1); // Navigate the user back to the previous page
      }
    };

    // Make sure that this runs only when the logged in user is loaded.
    if (id && !loggedInUser.userLoading) {
      getUserAccount();
    } else if (!Number(id)) {
      console.log("In wrong number");
      navigate(-1); // Navigate the user back to the previous page
    }
  }, [id, loggedInUser, navigate]);

  // Holds the name of the user from the database
  const [name, setName] = useState("");

  // This holds the date and month the user joined
  const [dateJoined, setDateJoined] = useState("");

  useEffect(() => {
    if (user) {
      // This converts the date that the backend will send into a javascript date object, and stores the year and month
      if (user.date_joined) {
        const dateJoined = new Date(user.date_joined);

        setDateJoined(
          `${dateJoined.toLocaleString("en-US", {
            month: "long",
          })}, ${dateJoined.getFullYear()}`
        );
      }

      if (user.first_name || user.last_name) {
        setName(`${user.first_name} ${user.last_name}`);
      } else {
        const editedEmailIndex = user.email.indexOf("@");
        let editedEmail = user.email;
        editedEmail = editedEmail.slice(0, editedEmailIndex);
        setName(editedEmail);
      }
    }
  }, [user]);

  return (
    <>
      {userIsLoading ? (
        <div className="min-h-screen grid place-items-center">
          <Loader />
        </div>
      ) : (
        <main className="min-h-screen py-[90px] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-[#a1d06d] via-[#ffffff] to-[#ffffff] dark:from-[#a1d06d] dark:via-[#242424] dark:to-[#242424]">
          <section className="p-4">
            <figure className="flex items-center flex-col gap-4">
              <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
                <img
                  alt=""
                  src={
                    user && user.profile_pic
                      ? profilePicURL + `${user.profile_pic}`
                      : "/Profile_Image_Placeholder-small.jpg"
                  }
                />
              </div>

              <figcaption className="text-xl text-center">
                <p className="mb-3">
                  <strong> {name} </strong>
                </p>
                <small>Udohs Platform member since {dateJoined}</small>
                {user && user.premium_member && (
                  <strong className="text-[rgb(255,145,0)] dark:text-[#ffd700] block">
                    <MdWorkspacePremium className="inline" />
                    Premium member
                    <MdWorkspacePremium className="inline" />
                  </strong>
                )}
              </figcaption>
            </figure>
          </section>

          <section className="p-4">
            <h2 className="text-center font-bold text-2xl uppercase mb-2">
              About
            </h2>

            {user && user.bio ? (
              <div className="flex justify-center">
                <p className="text-justify max-w-[480px]">{user.bio}</p>
              </div>
            ) : (
              <p className="text-center italic">
                {name} has not added an <q>About Me</q> section yet.
              </p>
            )}
          </section>

          <section className="mt-4">
            <h2 className="text-center font-bold text-2xl uppercase mb-2">
              Articles by {name}
            </h2>

            {has_articles ? (
              <div className="flex justify-center">
                <div className="max-w-[750px]">
                  <section className="p-4 mt-8 items-center flex gap-8 max-[730px]:gap-0 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
                    <div className="">
                      <Link>
                        <figure className="flex items-center">
                          <div className="w-[30px] h-[30px] rounded-full overflow-hidden mr-4">
                            <img
                              alt="Udoh Abasi"
                              src={"/Profile_Image_Placeholder-small.jpg"}
                            />
                          </div>

                          <figcaption>
                            <p>
                              <small>Udoh Abasi</small>
                            </p>
                          </figcaption>
                        </figure>
                      </Link>

                      <Link>
                        <div className="hover:underline">
                          <p id="one-line-ellipsis" className="mb-2">
                            <strong>
                              Gender equality - Project Title Gender equality -
                              Project Title Gender equality - Project Title
                            </strong>
                          </p>

                          <p id="two-line-ellipsis">
                            Description of the post Description of the post
                            Description of the post Description of the post
                            Description of the post Description of the post
                            Description of the post Description of the post
                            Description of the post Description of the post
                            Description of the post Description of the post
                            Description of the post Description of the post
                            Description of the post
                          </p>
                        </div>
                        <small>August 10</small>
                      </Link>
                    </div>

                    <Link className="w-[100px] h-[134px] flex-[0_0_100px] min-[550px]:flex-[0_0_150px] min-[730px]:flex-[0_0_200px]">
                      <img
                        src="/Hero photo-small.webp"
                        alt="Hero image"
                        className=" h-full w-full object-cover"
                      />
                    </Link>
                  </section>
                </div>
              </div>
            ) : (
              <p className="text-center italic">
                Udoh Abasi has no articles yet.
              </p>
            )}
          </section>
        </main>
      )}
    </>
  );
};

export default AccountPage;
