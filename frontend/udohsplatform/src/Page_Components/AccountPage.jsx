import { MdWorkspacePremium } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { profilePicURL } from "../utils/imageURLS";
import Loader from "./loader";
import axiosClient from "../utils/axiosSetup";
import { userSelector } from "../reduxFiles/selectors";
import { useSelector } from "react-redux";
import sanitizedData from "../utils/sanitizeDescription";
import {
  getDescription,
  getMonthAndYearOfDate,
} from "../utils/getDescriptionText";

const AccountPage = () => {
  const loggedInUser = useSelector(userSelector);

  const [user, setUser] = useState(null);
  const [userArticles, setUserArticles] = useState([]);
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
          setUser(response.data.profile);
          setUserArticles(response.data.articles);

          if (
            loggedInUser.userData &&
            loggedInUser.userData.id === response.data.profile.id
          ) {
            console.log("In userprofile");
            navigate("/userProfile", { replace: true });
          } else {
            setUserIsLoading(false);
          }
        }
      } catch (e) {
        console.log(e);
        navigate(-1); // Navigate the user back to the previous page
      }
    };

    // Make sure that this runs only when the logged in user is loaded. So that if they are the ones requesting their own account page, we refer them to their userProfile page
    if (id && !loggedInUser.userLoading) {
      getUserAccount();
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
        setName(
          `${user.first_name ? user.first_name : ""} ${
            user.last_name ? user.last_name : ""
          }`
        );
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
        <main className="min-h-screen py-[90px] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-[#a1d06d] via-[#ffffff] to-[#ffffff] dark:from-[#a1d06d] dark:via-[#020617] dark:to-[#020617]">
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

          {userArticles.length ? (
            <section className="my-20">
              <h2 className="text-center font-bold text-2xl uppercase mb-2">
                Articles by {user.first_name || name}
              </h2>

              {userArticles.map((eachArticle) => (
                <div key={eachArticle.id} className="flex justify-center">
                  <div className="flex-[0_1_750px]">
                    <section className="p-4 mt-8 items-center justify-between flex gap-8 max-[730px]:gap-2 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
                      <Link to={`/read/${eachArticle.title}/${eachArticle.id}`}>
                        <div className="hover:underline">
                          <p id="one-line-ellipsis" className="mb-2">
                            <strong>{eachArticle.title}</strong>
                          </p>

                          <p id="two-line-ellipsis">
                            <span
                              dangerouslySetInnerHTML={sanitizedData(
                                getDescription(eachArticle),
                                []
                              )}
                            />
                          </p>
                        </div>
                        <small className="mt-4 -mb-4 block">
                          {getMonthAndYearOfDate(eachArticle.datePosted)}
                        </small>
                      </Link>

                      <Link
                        to={`/read/${eachArticle.title}/${eachArticle.id}`}
                        className="w-[100px] h-[134px] flex-[0_0_100px] min-[550px]:flex-[0_0_150px] min-[730px]:flex-[0_0_200px]"
                      >
                        <img
                          src={
                            eachArticle.heroImage
                              ? profilePicURL + eachArticle.heroImage
                              : "/Hero photo-small.webp"
                          }
                          alt="Hero image"
                          className=" h-full w-full object-cover"
                        />
                      </Link>
                    </section>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <section className="my-20">
              <h2 className="text-center font-bold text-2xl uppercase mb-2">
                Articles by {user.first_name || name}
              </h2>
              <p className="text-center italic">
                {user.first_name || name} has no articles yet.
              </p>
            </section>
          )}
        </main>
      )}
    </>
  );
};

export default AccountPage;
