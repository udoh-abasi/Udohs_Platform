import { Link, useNavigate, useParams } from "react-router-dom";
import convertEditorJSDataToHTML from "./ConvertEditorJSDataToHTML";
import { useCallback, useEffect, useState } from "react";
import Loader from "./loader";
import axiosClient from "../utils/axiosSetup";
import { profilePicURL } from "../utils/imageURLS";
import sanitizedData from "../utils/sanitizeDescription";
import {
  AiOutlineLike,
  AiFillLike,
  AiOutlineHeart,
  AiFillHeart,
  AiFillWarning,
  AiOutlineClose,
} from "react-icons/ai";

import { MdOutlineModeComment } from "react-icons/md";
import {
  getDescription,
  getMonthAndYearOfDate,
} from "../utils/getDescriptionText";
import { userSelector } from "../reduxFiles/selectors";
import { useSelector } from "react-redux";
import { showForm } from "../utils/showOrHideSignUpAndRegisterForms";
import Comment from "./comments";

const Read = () => {
  let user = useSelector(userSelector);
  user = user.userData;

  const { title, articleID } = useParams();
  const navigate = useNavigate();

  // This stores the article's writer
  const [articleAuthor, setArticleAuthor] = useState({});

  // This stores other articles written by this same author
  const [otherArticles, setOtherArticles] = useState([]);

  // This stores the main article requested by the user
  const [article, setArticle] = useState({});

  const [pageLoading, setPageLoading] = useState(true);

  const [articleByOtherPoster, setArticleByOtherPoster] = useState([]);

  // This keeps tracks of the total number of comments on the article
  const [total_num_of_comments, set_total_num_of_comments] = useState(0);

  // This sends a request to get the article
  useEffect(() => {
    const getArticle = async () => {
      setPageLoading(true);
      try {
        const response = await axiosClient.get(
          `/api/singleArticle/${title}/${articleID}`
        );
        if (response.status === 200) {
          const data = response.data;

          const {
            requestedArticle,
            otherArticles,
            articlePoster,
            articleByOtherPoster,
            reactionData,
            total_num_comments,
          } = data;

          // NOTE: Here, we got the reaction data, and set them to their proper useStates
          setReactionData(reactionData);
          setTotalNumOfReactions(reactionData.total_num_reactions);
          setAreThereLikes(reactionData.areThereAnyLikes);
          setAreThereLoves(reactionData.areThereAnyLoves);
          if (reactionData.youLiked) {
            setReactionType("like");
          } else if (reactionData.youLoved) {
            setReactionType("love");
          }

          // Set the total number of comments
          set_total_num_of_comments(total_num_comments);

          // This 'articleByOtherPoster' is an array of objects. Each object has the poster and the article the person posted
          setArticleByOtherPoster(articleByOtherPoster);
          setArticleAuthor(articlePoster);
          setArticle(requestedArticle);
          setOtherArticles(otherArticles);
          setPageLoading(false);
        }
      } catch {
        navigate("/read");
      }
    };

    if (title && articleID) {
      getArticle();
    }
  }, [title, articleID, navigate, user]);

  const [dateOfPost, setDateOfPost] = useState("");

  useEffect(() => {
    if (article) {
      const postDate = new Date(article.datePosted);

      setDateOfPost(
        `${postDate.toLocaleString("en-US", {
          month: "long",
        })}, ${postDate.getFullYear()}`
      );
    }
  }, [article]);

  // This useState tracks when a user clicks on the like or love button. It immediately updates the UI as if the user has successfully reacted to the article, before the backend comes and set the right value if the reaction was successful
  const [reactionType, setReactionType] = useState("");

  // Keep track of the total number of reactions
  const [totalNumOfReactions, setTotalNumOfReactions] = useState("");

  // Check if there are likes/love, so we can show the right icons in the UI
  const [areThereLikes, setAreThereLikes] = useState(false);
  const [areThereLoves, setAreThereLoves] = useState(false);

  // When a user sends a request to either like or love an article, this will be true while the request is loading
  const [reactionRequestLoading, setReactionRequestLoading] = useState(false);

  // This useState holds the previous reaction data, incase there was an error in the backend, we can use this as the reaction data in the frontend
  const [reactionData, setReactionData] = useState({});

  // This function send a request to the backend to react to the article
  const sendAddReactionRequest = async (reaction_type) => {
    try {
      setReactionRequestLoading(true);
      const response = await axiosClient.put("/api/addReaction", {
        article_id: article.id,
        reaction_type: `${reaction_type}`,
      });

      if (response.status === 200) {
        const data = response.data;
        setReactionData(data);
        setTotalNumOfReactions(data.total_num_reactions);
        setAreThereLikes(data.areThereAnyLikes);
        setAreThereLoves(data.areThereAnyLoves);

        if (data.youLiked) {
          setReactionType("like");
        } else if (data.youLoved) {
          setReactionType("love");
        }
      } else {
        throw new Error("Invalid response");
      }
      setReactionRequestLoading(false);
    } catch {
      // So, if there was an error in the backend, we want to update the UI to the previous state.
      if (Object.keys(reactionData).length) {
        const data = reactionData;
        setTotalNumOfReactions(data.total_num_reactions);
        setAreThereLikes(data.areThereAnyLikes);
        setAreThereLoves(data.areThereAnyLoves);

        if (data.youLiked) {
          setReactionType("like");
        } else if (data.youLoved) {
          setReactionType("love");
        }
      }
      setReactionRequestLoading(false);
    }
  };

  // This function send a request to the backend to remove a reaction to the article
  const sendRemoveReactionRequest = async () => {
    try {
      setReactionRequestLoading(true);
      const response = await axiosClient.delete(
        `/api/removeReaction/${article.id}`
      );

      if (response.status === 200) {
        const data = response.data;
        setReactionData(data);
        setTotalNumOfReactions(data.total_num_reactions);
        setAreThereLikes(data.areThereAnyLikes);
        setAreThereLoves(data.areThereAnyLoves);

        if (data.youLiked) {
          setReactionType("like");
        } else if (data.youLoved) {
          setReactionType("love");
        }
      } else {
        throw new Error("Invalid response");
      }
      setReactionRequestLoading(false);
    } catch {
      // So, if there was an error in the backend, we want to update the UI to the previous state.
      if (Object.keys(reactionData).length) {
        const data = reactionData;
        setTotalNumOfReactions(data.total_num_reactions);
        setAreThereLikes(data.areThereAnyLikes);
        setAreThereLoves(data.areThereAnyLoves);

        if (data.youLiked) {
          setReactionType("like");
        } else if (data.youLoved) {
          setReactionType("love");
        }
      }
      setReactionRequestLoading(false);
    }
  };

  // When a non-logged-in user request an article, we don't want to automatically tell them that they can't react to the article until they click on a reaction. This useEffect keeps track of when they have clicked on either like/love
  const [userTriedToReact, setUserTriedToReact] = useState(false);

  // This is used to control which reaction type the user wants to see. It can be 'all' (for seeing all users that liked the article), 'like' (for all users that liked the article), and 'love' (for all users that loved the article)
  const [viewReactions, setViewReactions] = useState("all");

  // The users that reacted will be stored here (it is a list of dictionaries. Each containing the reactor and their reaction type)
  const [usersThatReacted, setUsersThatReacted] = useState([]);

  // Keeps track if the request sent to get all  users that reacted is still loading
  const [usersThatReactedLoading, setUsersThatReactedLoading] = useState(true);

  // Checks if there was an error getting all users that reacted
  const [errorGettingUsersThatReacted, setErrorGettingUsersThatReacted] =
    useState(false);

  // The total number of users that reacted will be stored here. (This will be displayed next to the 'All' button in the interface that shows users that reacted)
  const [totalUsersThatReacted, setTotalUsersThatReacted] = useState("");

  // The total number of users that liked the post. (This will be displayed next to the 'like' icon in the interface that shows users that reacted)
  const [totalNumOfLikes, setTotalNumOfLikes] = useState("");

  // The total number of users that loved the post. (This will be displayed next to the 'love' icon in the interface that shows users that reacted)
  const [totalNumOfLoves, setTotalNumOfLoves] = useState("");

  // Since our backend sends 10 results per request, the link to get the next 10 results will be stored here
  const [nextUsersThatReacted, setNextUsersThatReacted] = useState(null);

  // This sends a request to the backend to get users that reacted to the article
  // If it is called with an argument (the argument must be "like" or "love"), it will send a request to get only users that liked or loved respectively
  const getUsersThatReacted = async (reaction_type) => {
    try {
      setUsersThatReactedLoading(true);
      setErrorGettingUsersThatReacted(false);

      let url = "";

      // Check if the reaction_type was set, and if it's either like or love
      if (reaction_type === "like" || reaction_type === "love") {
        url = `/api/getUsersThatReacted/${article.id}?reaction_type=${reaction_type}`;
      } else {
        url = `/api/getUsersThatReacted/${article.id}`;
      }

      const response = await axiosClient.get(url);

      if (response.status === 200) {
        setUsersThatReacted(response.data.results);
        setTotalUsersThatReacted(response.data.total_num_of_reactions);
        setTotalNumOfLoves(response.data.total_num_of_love);
        setTotalNumOfLikes(response.data.total_num_of_likes);
        setNextUsersThatReacted(response.data.next);
      } else {
        throw new Error("Something went wrong");
      }
      setUsersThatReactedLoading(false);
    } catch {
      setUsersThatReactedLoading(false);
      setErrorGettingUsersThatReacted(true);
    }
  };

  // This checks if the next set of 10 users that reacted are loading
  const [nextContentLoading, setNextContentLoading] = useState(false);

  // This function runs to get the next 10 users that reacted.
  const getNextUsersThatReacted = useCallback(async () => {
    if (!nextContentLoading && nextUsersThatReacted) {
      try {
        setNextContentLoading(true);
        setErrorGettingUsersThatReacted(false);

        const response = await axiosClient.get(nextUsersThatReacted);

        if (response.status === 200) {
          setUsersThatReacted([...usersThatReacted, ...response.data.results]);
          setNextUsersThatReacted(response.data.next);
        } else {
          throw new Error("Something went wrong");
        }
        setNextContentLoading(false);
      } catch {
        setNextContentLoading(false);
        setErrorGettingUsersThatReacted(true);
      }
    }
  }, [nextContentLoading, nextUsersThatReacted, usersThatReacted]);

  // This useEffect implements the infinite scrolling, to see other users that reacted when the user scrolls close to the bottom
  useEffect(() => {
    try {
      const handleScroll = () => {
        // NOTE: scrollTop - is how far you are from the top of the window (so, when you scroll to the very top of the page, it is zero)
        // clientHeight - is the actual height of the screen (the viewport, i.e visible area)
        // scrollHeight - is the entire height of the page (including non-visible area)
        // So, scrollTop (when the user scrolls to the bottom page) + clientHeight === scrollHeight

        if (document.querySelector("#reactionContainer")) {
          const { scrollTop, clientHeight, scrollHeight } =
            document.querySelector("#reactionContainer");

          // Check if the item is close to the bottom. The '200' here means, 'check if the user has scrolled 200px close from the bottom'
          if (scrollTop + clientHeight >= scrollHeight - 200) {
            getNextUsersThatReacted();
          }
        }
      };

      if (document.querySelector("#reactionContainer")) {
        document
          .querySelector("#reactionContainer")
          .addEventListener("scroll", handleScroll);
        return () => {
          if (document.querySelector("#reactionContainer")) {
            document
              .querySelector("#reactionContainer")
              .removeEventListener("scroll", handleScroll);
          }
        };
      }
    } catch {
      // Do nothing
    }
  }, [getNextUsersThatReacted]);

  // This make the comment section slide in, from the right
  const showComment = () => {
    const commentOverlay = document.querySelector("#commentOverLay");
    commentOverlay.classList.remove("hidden");

    document.querySelector("body").classList.add("overflow-hidden");

    setTimeout(() => {
      const commentSection = document.querySelector("#comment");
      commentSection.classList.remove("-right-[700px]");
      commentSection.classList.add("right-0");
    }, 0.00001);
  };

  // This makes the comment section slide out, through the right, and is hidden
  const hideComment = () => {
    const commentSection = document.querySelector("#comment");
    commentSection.classList.remove("right-0");
    commentSection.classList.add("-right-[700px]");

    setTimeout(() => {
      const commentOverlay = document.querySelector("#commentOverLay");
      commentOverlay.classList.add("hidden");

      document.querySelector("body").classList.remove("overflow-hidden");
    }, 300);
  };

  return (
    <main className="min-h-screen pt-[5rem] p-4 max-w-[700px] mx-auto">
      {pageLoading ? (
        <div className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] w-full h-full">
          <div className="fixed top-1/2 left-1/2 z-10">
            <Loader />
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-center font-bold text-2xl min-[500px]:text-3xl m-6">
            {article.title}
          </h1>

          <div className="my-6">
            <Link to={`/account/${articleAuthor.id}`} className="block">
              <figure className="flex items-center ">
                <div className="rounded-full overflow-hidden mr-4 flex-[0_0_40px] h-[40px]">
                  <img
                    alt={`${articleAuthor.first_name} ${articleAuthor.last_name}`}
                    src={`${
                      articleAuthor.profile_pic
                        ? profilePicURL + articleAuthor.profile_pic
                        : "/Profile_Image_Placeholder-small.jpg"
                    }`}
                  />
                </div>

                <figcaption>
                  <p id="one-line-ellipsis">
                    {articleAuthor.first_name} {articleAuthor.last_name}
                  </p>
                </figcaption>
              </figure>

              <small>Published: {dateOfPost}</small>
            </Link>
            {article.edited && <small>Edited</small>}
          </div>

          <section>
            <button
              type="button"
              aria-label="See all reactions"
              title="See all reactions"
              className="block w-full text-left"
              onClick={() => {
                // Here, if the current user is the only person that reacted, then the interface to see users that reacted will not show up at all
                if (totalNumOfReactions > 0) {
                  document
                    .querySelector("#allLikes")
                    .classList.remove("hidden");

                  document
                    .querySelector("body")
                    .classList.add("overflow-hidden");
                  setViewReactions("all");

                  getUsersThatReacted();
                }
              }}
            >
              <p className="inline mr-1">
                {areThereLikes && (
                  <AiFillLike
                    className="inline text-blue-500"
                    aria-label="filled love emoji"
                  />
                )}

                {areThereLoves && (
                  <AiFillHeart
                    className="inline text-red-500"
                    aria-label="filled like emoji"
                  />
                )}
              </p>

              {reactionType === "like" || reactionType === "love" ? (
                <p className="inline text-xs">
                  You{" "}
                  {totalNumOfReactions > 1 &&
                    `and ${totalNumOfReactions} others`}
                  {totalNumOfReactions == 1 &&
                    `and ${totalNumOfReactions} other`}
                </p>
              ) : (
                <>
                  {totalNumOfReactions != 0 && (
                    <p className="inline text-xs">{totalNumOfReactions}</p>
                  )}
                </>
              )}
            </button>
          </section>

          <section>
            <div className="mt-4 flex justify-between py-4 rounded-xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
              <p className="inline">
                {reactionType === "like" ? (
                  <button
                    type="button"
                    aria-label="filled like"
                    title="Unlike"
                    onClick={() => {
                      if (
                        user &&
                        Object.keys(user).length &&
                        !reactionRequestLoading
                      ) {
                        setReactionType("");
                        sendRemoveReactionRequest();
                      } else if (!user) {
                        setUserTriedToReact(true);
                      }
                    }}
                  >
                    <AiFillLike
                      className="inline text-blue-500 mr-2 text-3xl"
                      aria-label="filled love emoji"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Unfilled like"
                    title="Like"
                    onClick={() => {
                      if (
                        user &&
                        Object.keys(user).length &&
                        !reactionRequestLoading
                      ) {
                        setReactionType("like");
                        setAreThereLikes("true");
                        sendAddReactionRequest("like");
                      } else if (!user) {
                        setUserTriedToReact(true);
                      }
                    }}
                  >
                    <AiOutlineLike
                      className="inline mr-2 text-3xl"
                      aria-label="filled like emoji"
                    />
                  </button>
                )}

                {reactionType === "love" ? (
                  <button
                    type="button"
                    aria-label="Filled heart"
                    title="Unlove"
                    onClick={() => {
                      if (
                        user &&
                        Object.keys(user).length &&
                        !reactionRequestLoading
                      ) {
                        setReactionType("");
                        sendRemoveReactionRequest();
                      } else if (!user) {
                        setUserTriedToReact(true);
                      }
                    }}
                  >
                    <AiFillHeart
                      className="inline text-red-500 mr-2 text-3xl"
                      aria-label="filled like emoji"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Unfilled heart"
                    title="Love"
                    onClick={() => {
                      if (
                        user &&
                        Object.keys(user).length &&
                        !reactionRequestLoading
                      ) {
                        setReactionType("love");
                        setAreThereLoves("true");
                        sendAddReactionRequest("love");
                      } else if (!user) {
                        setUserTriedToReact(true);
                      }
                    }}
                  >
                    <AiOutlineHeart
                      className="inline mr-2 text-3xl"
                      aria-label="filled like emoji"
                    />
                  </button>
                )}
              </p>

              <button
                id="commentButton"
                type="button"
                className="block"
                title="Comment"
                onClick={() => {
                  showComment();
                }}
              >
                <MdOutlineModeComment className="inline mr-1 text-3xl" />
                <span className="text-xl mr-2">
                  {total_num_of_comments > 0 ? total_num_of_comments : ""}
                </span>
              </button>
            </div>

            {!user && userTriedToReact && (
              <p className="text-xs text-red-500 mb-4 mt-8 text-center">
                <AiFillWarning className="text-2xl max-[370px]:text-lg inline" />
                You need to&nbsp;
                <Link
                  className="uppercase underline font-bold"
                  onClick={() => {
                    showForm("#sign_in");
                  }}
                >
                  Sign in{" "}
                </Link>
                &nbsp;or&nbsp;
                <Link
                  className="uppercase underline font-bold"
                  onClick={() => {
                    showForm("#register_user");
                  }}
                >
                  Register
                </Link>
                &nbsp;to add a reaction and comment.
              </p>
            )}
          </section>

          {convertEditorJSDataToHTML(JSON.parse(article.theMainArticle))}

          <section>
            <button
              type="button"
              aria-label="See all reactions"
              title="See all reactions"
              className="block w-full text-left"
              onClick={() => {
                // Here, if the current user is the only person that reacted, then the interface to see users that reacted will not show up at all
                if (totalNumOfReactions > 0) {
                  document
                    .querySelector("#allLikes")
                    .classList.remove("hidden");

                  document
                    .querySelector("body")
                    .classList.add("overflow-hidden");
                  setViewReactions("all");

                  getUsersThatReacted();
                }
              }}
            >
              <p className="inline mr-1">
                {areThereLikes && (
                  <AiFillLike
                    className="inline text-blue-500"
                    aria-label="filled love emoji"
                  />
                )}

                {areThereLoves && (
                  <AiFillHeart
                    className="inline text-red-500"
                    aria-label="filled like emoji"
                  />
                )}
              </p>

              {reactionType === "like" || reactionType === "love" ? (
                <p className="inline text-xs">
                  You{" "}
                  {totalNumOfReactions > 1 &&
                    `and ${totalNumOfReactions} others`}
                  {totalNumOfReactions == 1 &&
                    `and ${totalNumOfReactions} other`}
                </p>
              ) : (
                <>
                  {totalNumOfReactions != 0 && (
                    <p className="inline text-xs">{totalNumOfReactions}</p>
                  )}
                </>
              )}
            </button>
          </section>

          <section>
            <div className="mt-4 flex justify-between py-4 rounded-xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
              <p className="inline">
                {reactionType === "like" ? (
                  <button
                    type="button"
                    aria-label="filled like"
                    title="Unlike"
                    onClick={() => {
                      if (
                        user &&
                        Object.keys(user).length &&
                        !reactionRequestLoading
                      ) {
                        setReactionType("");
                        sendRemoveReactionRequest();
                      } else if (!user) {
                        setUserTriedToReact(true);
                      }
                    }}
                  >
                    <AiFillLike
                      className="inline text-blue-500 mr-2 text-3xl"
                      aria-label="filled love emoji"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Unfilled like"
                    title="Like"
                    onClick={() => {
                      if (
                        user &&
                        Object.keys(user).length &&
                        !reactionRequestLoading
                      ) {
                        setReactionType("like");
                        setAreThereLikes("true");
                        sendAddReactionRequest("like");
                      } else if (!user) {
                        setUserTriedToReact(true);
                      }
                    }}
                  >
                    <AiOutlineLike
                      className="inline mr-2 text-3xl"
                      aria-label="filled like emoji"
                    />
                  </button>
                )}

                {reactionType === "love" ? (
                  <button
                    type="button"
                    aria-label="Filled heart"
                    title="Unlove"
                    onClick={() => {
                      if (
                        user &&
                        Object.keys(user).length &&
                        !reactionRequestLoading
                      ) {
                        setReactionType("");
                        sendRemoveReactionRequest();
                      } else if (!user) {
                        setUserTriedToReact(true);
                      }
                    }}
                  >
                    <AiFillHeart
                      className="inline text-red-500 mr-2 text-3xl"
                      aria-label="filled like emoji"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Unfilled heart"
                    title="Love"
                    onClick={() => {
                      if (
                        user &&
                        Object.keys(user).length &&
                        !reactionRequestLoading
                      ) {
                        setReactionType("love");
                        setAreThereLoves("true");
                        sendAddReactionRequest("love");
                      } else if (!user) {
                        setUserTriedToReact(true);
                      }
                    }}
                  >
                    <AiOutlineHeart
                      className="inline mr-2 text-3xl"
                      aria-label="filled like emoji"
                    />
                  </button>
                )}
              </p>

              <button
                type="button"
                className="block"
                title="Comment"
                onClick={() => {
                  showComment();
                }}
              >
                <MdOutlineModeComment className="inline mr-1 text-3xl" />
                <span className="text-xl mr-2">
                  {total_num_of_comments > 0 ? total_num_of_comments : ""}
                </span>
              </button>
            </div>

            {!user && userTriedToReact && (
              <p className="text-xs text-red-500 mb-4 mt-8 text-center">
                <AiFillWarning className="text-2xl max-[370px]:text-lg inline" />
                You need to&nbsp;
                <Link
                  className="uppercase underline font-bold"
                  onClick={() => {
                    showForm("#sign_in");
                  }}
                >
                  Sign in{" "}
                </Link>
                &nbsp;or&nbsp;
                <Link
                  className="uppercase underline font-bold"
                  onClick={() => {
                    showForm("#register_user");
                  }}
                >
                  Register
                </Link>
                &nbsp;to add a reaction and comment.
              </p>
            )}
          </section>

          <Link to={`/account/${articleAuthor.id}`}>
            <figure className="pt-8">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden mr-4">
                <img
                  alt={`${articleAuthor.first_name} ${articleAuthor.last_name}`}
                  src={`${
                    articleAuthor.profile_pic
                      ? profilePicURL + articleAuthor.profile_pic
                      : "/Profile_Image_Placeholder-small.jpg"
                  }`}
                />
              </div>

              <figcaption className="mt-4">
                <p className="my-4">
                  Written by{" "}
                  <strong>
                    {articleAuthor.first_name} {articleAuthor.last_name}
                  </strong>
                </p>
                <p className="text-justify">{articleAuthor.bio}</p>
              </figcaption>
            </figure>
          </Link>

          {Object.keys(otherArticles).length ? (
            <section className="my-20">
              <h2 className="text-center font-bold text-2xl uppercase mb-2">
                More from {articleAuthor.first_name}
              </h2>

              {otherArticles.map((eachArticle) => (
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
            <span></span>
          )}

          {Object.keys(articleByOtherPoster).length ? (
            <section className="my-20">
              <h2 className="text-center font-bold text-2xl uppercase mb-2">
                You may also like
              </h2>

              {articleByOtherPoster.map((eachArticle) => {
                const { post, poster } = eachArticle;
                return (
                  <section
                    key={post.id}
                    className="p-4 mt-8 items-center justify-between flex gap-8 max-[730px]:gap-2 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                  >
                    <div>
                      <Link to={`/account/${poster.id}`}>
                        <figure className="flex items-center">
                          <div className="w-[30px] h-[30px] rounded-full overflow-hidden mr-4">
                            <img
                              alt={`${poster.first_name} ${poster.last_name}`}
                              src={
                                poster.profile_pic
                                  ? profilePicURL + poster.profile_pic
                                  : "/Profile_Image_Placeholder-small.jpg"
                              }
                            />
                          </div>

                          <figcaption>
                            <p>
                              <small>
                                {poster.first_name} {poster.last_name}
                              </small>
                            </p>
                          </figcaption>
                        </figure>
                      </Link>

                      <Link to={`/read/${post.title}/${post.id}`}>
                        <div className="hover:underline">
                          <p id="one-line-ellipsis" className="my-2">
                            <strong>{post.title}</strong>
                          </p>

                          <p id="two-line-ellipsis">{getDescription(post)}</p>
                        </div>
                        <small className="mt-4 block">
                          {getMonthAndYearOfDate(post.datePosted)}
                        </small>
                      </Link>
                    </div>

                    <Link
                      to={`/read/${post.title}/${post.id}`}
                      className="w-[100px] h-[134px] flex-[0_0_100px] min-[550px]:flex-[0_0_150px] min-[730px]:flex-[0_0_200px]"
                    >
                      <img
                        src={
                          post.heroImage
                            ? profilePicURL + post.heroImage
                            : "/Hero photo-small.webp"
                        }
                        alt="Hero image"
                        className=" h-full w-full object-cover"
                      />
                    </Link>
                  </section>
                );
              })}
            </section>
          ) : (
            <span></span>
          )}

          <div
            id="allLikes"
            className="hidden top-0 left-0 fixed w-full h-full"
            onClick={() => {
              document.querySelector("#allLikes").classList.add("hidden");
              document
                .querySelector("body")
                .classList.remove("overflow-hidden");
              setViewReactions("all");
            }}
          >
            <article
              className="fixed rounded-2xl p-8 text-center w-full max-w-[400px] h-[80%] overflow-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-200 dark:bg-black shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
              onClick={(e) => e.stopPropagation()}
              id="reactionContainer"
            >
              <section className="flex justify-evenly my-4 border-b-[1px] border-black dark:border-white pb-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewReactions("all");
                    getUsersThatReacted();
                  }}
                  className={`border-b-4  ${
                    viewReactions === "all"
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                >
                  All <span>{totalUsersThatReacted}</span>
                </button>

                {totalNumOfLikes > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewReactions("likes");
                      getUsersThatReacted("like");
                    }}
                    className={`border-b-4 ${
                      viewReactions === "likes"
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <AiFillLike
                      className="inline text-blue-500 text-xl"
                      aria-label="filled love emoji"
                    />{" "}
                    <span>{totalNumOfLikes}</span>
                  </button>
                )}

                {totalNumOfLoves > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewReactions("loves");
                      getUsersThatReacted("love");
                    }}
                    className={`border-b-4  ${
                      viewReactions === "loves"
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <AiFillHeart
                      className="inline text-red-500 text-xl"
                      aria-label="filled love emoji"
                    />{" "}
                    <span>{totalNumOfLoves}</span>
                  </button>
                )}
              </section>

              <section>
                {usersThatReactedLoading ? (
                  <Loader />
                ) : (
                  <>
                    {usersThatReacted.map((eachData) => {
                      const { reactor, reaction_type } = eachData;
                      return (
                        <Link
                          key={reactor.id}
                          to={`/account/${reactor.id}`}
                          className="block my-4"
                          onClick={() => {
                            document
                              .querySelector("#allLikes")
                              .classList.add("hidden");
                            document
                              .querySelector("body")
                              .classList.remove("overflow-hidden");
                            setViewReactions("all");
                          }}
                        >
                          <figure className="grid grid-cols-[auto_minmax(0,100%)]">
                            <div className="relative">
                              <div className="rounded-full overflow-hidden mr-4 w-[40px] h-[40px]">
                                <img
                                  alt={`${reactor.first_name} ${reactor.last_name}`}
                                  src={`${
                                    reactor.profile_pic
                                      ? profilePicURL + reactor.profile_pic
                                      : "/Profile_Image_Placeholder-small.jpg"
                                  }`}
                                />
                              </div>

                              <p className="absolute bottom-3 right-2">
                                {reaction_type === "like" && (
                                  <AiFillLike
                                    className="bg-blue-500 p-1 text-xl text-white rounded-full"
                                    aria-label="filled love emoji"
                                  />
                                )}

                                {reaction_type === "love" && (
                                  <AiFillHeart
                                    className="bg-red-500 p-1 text-xl text-white rounded-full"
                                    aria-label="filled like emoji"
                                  />
                                )}
                              </p>
                            </div>

                            <div className="">
                              <figcaption className="font-bold text-left">
                                <p id="one-line-ellipsis">
                                  {reactor.first_name} {reactor.last_name}
                                </p>
                              </figcaption>

                              <figcaption className="text-xs text-left">
                                <p id="two-line-ellipsis">{reactor.bio}</p>
                              </figcaption>
                            </div>
                          </figure>
                        </Link>
                      );
                    })}

                    <div id="seeMore">
                      {nextUsersThatReacted && (
                        <div className="flex justify-center mt-10">
                          <button
                            type="button"
                            onClick={() => {
                              if (nextUsersThatReacted) {
                                getNextUsersThatReacted();
                              }
                            }}
                            disabled={nextContentLoading}
                            className="px-2 flex justify-center items-center w-[150px] font-bold rounded-br-xl rounded-tl-xl py-1 ring-4 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                          >
                            {nextContentLoading ? (
                              <Loader />
                            ) : (
                              <span className="flex justify-center">
                                See more
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {errorGettingUsersThatReacted && (
                      <p className="text-red-500 text-sm text-center p-2 my-4">
                        <AiFillWarning className="inline text-lg mr-1" />
                        Something went wrong. Please reload the page to try
                        again.
                      </p>
                    )}
                  </>
                )}
              </section>

              <button
                aria-label="close"
                type="button"
                className="text-3xl absolute top-2 right-2 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
                onClick={() => {
                  document.querySelector("#allLikes").classList.add("hidden");
                  document
                    .querySelector("body")
                    .classList.remove("overflow-hidden");
                  setViewReactions("all");
                }}
              >
                <AiOutlineClose />
              </button>
            </article>
          </div>

          <div
            id="commentOverLay"
            className="hidden z-10 top-0 left-0 fixed w-full h-full"
            onClick={() => {
              hideComment();
            }}
          >
            <Comment
              hideComment={hideComment}
              total_num_comments={total_num_of_comments}
              set_total_num_of_comments={set_total_num_of_comments}
              article_id={article.id}
            />
          </div>
        </>
      )}
    </main>
  );
};

export default Read;
