/* eslint-disable react/prop-types */
import {
  AiFillHeart,
  AiFillWarning,
  AiOutlineClose,
  AiOutlineHeart,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import EditorJS from "@editorjs/editorjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdOutlineDeleteForever } from "react-icons/md";
import Loader from "./loader";
import { showForm } from "../utils/showOrHideSignUpAndRegisterForms";
import axiosClient from "../utils/axiosSetup";
import { profilePicURL } from "../utils/imageURLS";
import { sanitizedData } from "./ConvertEditorJSDataToHTML";
import { userSelector } from "../reduxFiles/selectors";
import { useSelector } from "react-redux";

const Comment = ({
  hideComment,
  total_num_comments,
  set_total_num_of_comments,
  article_id,
}) => {
  const reactionType = "love";

  let user = useSelector(userSelector);
  user = user.userData;

  // Used to fix issue of the editor rendering twice, because strict-mode is set to true
  const isReady = useRef(false);

  const [theEditorJS, setTheEditorJS] = useState(null);
  const [editorLoading, setEditorLoading] = useState(false);

  // This keeps track of the editorJS data
  const [enteredComment, setEnteredComment] = useState({});

  // When the user's comment is successful, we set this to true, so the user will not send another request with an empty comment text
  // const [enteredCommentCleared, setEnteredCommentCleared] = useState(true);

  // Initialize the editorJS
  useEffect(() => {
    if (!isReady.current) {
      const editor = new EditorJS({
        /**
         * Id of Element that should contain Editor instance
         */
        holder: "editor_js",

        inlineToolbar: ["bold", "italic"],

        // eslint-disable-next-line no-unused-vars
        onChange: (event, api) => {
          // Here, we accessed the saver event and then save the data and store the saved data in a useState
          event.saver.save().then((data) => {
            setEnteredComment(data);
          });
        },

        // Makes the field gain focus on page load
        // autofocus: true,

        placeholder: "What are your thoughts?",

        data: null,
      });

      setTheEditorJS(editor);

      // Check when the editor is ready, then stop the loading

      editor.isReady.then(() => {
        setEditorLoading(false);
      });
    }

    isReady.current = true;
  }, []);

  const [createCommentLoading, setCreateCommentLoading] = useState(false);
  const [errorCreatingNewComment, setErrorCreatingNewComment] = useState(false);

  // This stores all the comments to be displayed on the page
  const [comments, setComments] = useState([]);

  // This sends a request to create a new comment
  const createNewComment = async () => {
    try {
      setCreateCommentLoading(true);
      setErrorCreatingNewComment(false);
      const response = await axiosClient.post("/api/createComment", {
        article_id,
        comment: JSON.stringify(enteredComment),
      });
      if (response.status === 200) {
        const data = response.data;

        // Update total number of comments in parent element
        set_total_num_of_comments(data.total_num_comments);

        // Update the comment, but make sure the new created comment comes first
        setComments([data.commentData, ...comments]);

        // When a user successfully add a comment, we want to clear the EditorJS, so we used this, and to clear the data. NOTICE the text is set to an empty string.
        theEditorJS.render({
          key: "clearEditor",
          time: 1699169448286,
          blocks: [
            {
              type: "paragraph",
              data: {
                text: "",
              },
            },
          ],
          version: "2.28.0",
        });

        // With this, the user can send another request to the backend, because 'blocks' length is not empty, so we 'setEnteredComment' below to the data (which kas a key), so we can check if that 'key' exist, and make the user not send a request to the backend
        setEnteredComment({
          key: "clearEditor",
          time: 1699169448286,
          blocks: [
            {
              type: "paragraph",
              data: {
                text: "",
              },
            },
          ],
          version: "2.28.0",
        });
      } else {
        throw new Error("Something is wrong");
      }

      setCreateCommentLoading(false);
    } catch {
      setCreateCommentLoading(false);
      setErrorCreatingNewComment(true);
    }
  };

  const [errorGettingAllComments, setErrorGettingAllComments] = useState(false);
  const [nextCommentLink, setNextCommentLink] = useState(null);

  // This sends a request to get all the comments made on the article
  const getAllComment = useCallback(async () => {
    try {
      setCreateCommentLoading(true);
      setErrorGettingAllComments(false);
      const response = await axiosClient.get(`/api/allComments/${article_id}`);
      if (response.status === 200) {
        const data = response.data;

        // Update total number of comments in parent element
        set_total_num_of_comments(data.total_num_comments);

        // Set up the link to get the next 10 comments
        setNextCommentLink(data.nextCommentLink);

        // Update the comment
        setComments([...data.commentData]);
      } else {
        throw new Error("Something is wrong");
      }

      setCreateCommentLoading(false);
    } catch {
      setCreateCommentLoading(false);
      setErrorGettingAllComments(true);
    }
  }, [article_id, set_total_num_of_comments]);

  // This useEffect runs to add an event listener to the 'Comment' button on the parent element (i.e the Read.jsx)
  // This is done because, on the click of a 'Comment' button on the parent element, we want to execute a function that is defined in this child element
  useEffect(() => {
    document
      .querySelector("#commentButton")
      .addEventListener("click", getAllComment);

    return () => {
      if (document.querySelector("#commentButton")) {
        document
          .querySelector("#commentButton")
          .addEventListener("click", getAllComment);
      }
    };
  }, [getAllComment]);

  // Returns the <p> for the comment
  const returnParagraph = (text, id) => {
    const allowed_tags = ["b", "i"];
    return (
      <p key={id}>
        <span dangerouslySetInnerHTML={sanitizedData(text, allowed_tags)} />
      </p>
    );
  };

  // This converts the EditorJS data to HTML. It ensures only <p> blocks are treated
  const convertEditorJSDataToHTMLForComment = (theData) => {
    try {
      const dataBlock = theData.blocks;

      const theMap = dataBlock.map((eachData) => {
        const { id, type, data } = eachData;

        switch (type) {
          case "paragraph": {
            const text = data.text;

            if (text.trim()) {
              return returnParagraph(text, id);
            }
            return;
          }

          default:
            break;
        }
      });

      return theMap;
    } catch (e) {
      console.log("Error with the data from EditorJS", e);
    }
  };

  // This function runs to display the date a comment was made. In the format (November 5 2023)
  const getDayMonthAndYearOfDate = (date) => {
    try {
      const postDate = new Date(date);

      return `${postDate.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
      })}, ${postDate.getFullYear()}`;
    } catch {
      // Do nothing
    }
  };

  // When the delete button on a comment is clicked, these functions run to hide or show the the confirmation dialogue box
  const hideCommentDeleteConfirmation = (id) => {
    document.querySelector("#deleteConfirmation" + id).classList.add("hidden");
  };

  const showCommentDeleteConfirmation = (id) => {
    document
      .querySelector("#deleteConfirmation" + id)
      .classList.remove("hidden");
  };

  // Holds the name of the user from the database
  const [name, setName] = useState("");

  // This is added, incase a user that has NOT set their first_name nor last_name, wants to comment
  useEffect(() => {
    if (user) {
      if (user.first_name || user.last_name) {
        setName(
          `${user.first_name ? user.first_name : ""} ${
            user.last_name ? user.last_name : ""
          }`
        );
      } else {
        const atIndex = user.email.indexOf("@");
        const fullStopIndex = user.email.indexOf(".");
        const editedEmailIndex =
          fullStopIndex < atIndex ? fullStopIndex : atIndex;

        let editedEmail = user.email;
        editedEmail = editedEmail.slice(0, editedEmailIndex);
        setName(editedEmail);
      }
    }
  }, [user]);

  // This keeps track whether a non logged in user has clicked the 'Add comment' button
  const [userTriedToComment, setUserTriedToComment] = useState(false);

  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);
  const [errorDeletingComment, setErrorDeletingComment] = useState(false);

  // This function runs to delete a comment
  const deleteComment = async (comment_id) => {
    try {
      setDeleteCommentLoading(true);
      setErrorDeletingComment(false);

      const response = await axiosClient.delete(
        `/api/deleteComment/${comment_id}/${article_id}`
      );

      if (response.status === 200) {
        const data = response.data;

        // So, if the comment has been deleted successfully, the backend sends the deleted comment's id
        // So, we grab that id, and then filter through our list of comments and drop the comment with that id
        const newComments = comments.filter((commentData) => {
          const { comment } = commentData;
          return comment.id != String(data.deletedCommentID);
        });

        // Then we update comments on our page
        setComments(newComments);

        // Then we reduce the total number of comments by one (1)
        set_total_num_of_comments(total_num_comments - 1);
      }

      setDeleteCommentLoading(false);
      hideCommentDeleteConfirmation(comment_id);
    } catch {
      setDeleteCommentLoading(false);
      setErrorDeletingComment(true);
    }
  };

  return (
    <section
      onClick={(e) => {
        e.stopPropagation();
      }}
      id="comment"
      className="p-4 fixed top-0 -right-[700px] w-[90%] max-w-[400px] overflow-auto  h-full z-10 bg-gray-200 dark:bg-[#020617] transition-all duration-500 ease-linear"
    >
      <h2 className="text-center my-8 font-bold uppercase">
        Comments{" "}
        <span>{total_num_comments > 0 ? `(${total_num_comments})` : ""}</span>
      </h2>

      <section className="pb-4 px-2 pt-1 mb-8 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
        <div className="block my-4">
          <figure className="grid grid-cols-[auto_minmax(0,100%)] items-center">
            <div className="relative">
              <div className="rounded-full overflow-hidden mr-4 w-[40px] h-[40px]">
                <img
                  alt={`${name}`}
                  src={`${
                    user && user.profile_pic
                      ? profilePicURL + user.profile_pic
                      : "/Profile_Image_Placeholder-small.jpg"
                  }`}
                />
              </div>
            </div>

            <figcaption className="font-bold text-left">
              <p id="one-line-ellipsis">{name}</p>
            </figcaption>
          </figure>
        </div>

        <div
          id="editor_js"
          className="bg-white text-black mb-8 rounded-bl-3xl rounded-tr-3xl"
        ></div>

        {errorCreatingNewComment && (
          <p className="text-red-500 text-xs my-2 mb-4 text-center">
            <AiFillWarning className="text-2xl max-[370px]:text-lg inline" />
            Something went wrong and we could not add your comment
          </p>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            disabled={
              createCommentLoading ||
              !(enteredComment.blocks && enteredComment.blocks.length) ||
              enteredComment.key
            }
            className="px-4 text-xs font-bold rounded-br-xl rounded-tl-xl py-2 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed ring-4 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
            onClick={() => {
              if (
                user &&
                !createCommentLoading &&
                enteredComment.blocks &&
                enteredComment.blocks.length &&
                !enteredComment.key
              ) {
                createNewComment();
              } else if (!user && !userTriedToComment) {
                setUserTriedToComment(true);
              }
            }}
          >
            {createCommentLoading ? <Loader /> : <span>Add Comment</span>}
          </button>
        </div>

        {!user && userTriedToComment && (
          <p className="text-xs text-red-500 mb-4 mt-8 text-center">
            <AiFillWarning className="text-2xl max-[370px]:text-lg inline" />
            You need to&nbsp;
            <Link
              className="uppercase underline font-bold"
              onClick={() => {
                showForm("#sign_in");
                hideComment();
              }}
            >
              Sign in{" "}
            </Link>
            &nbsp;or&nbsp;
            <Link
              className="uppercase underline font-bold"
              onClick={() => {
                showForm("#register_user");
                hideComment();
              }}
            >
              Register
            </Link>
            &nbsp;to add a comment.
          </p>
        )}
      </section>

      {comments.map((eachComment) => {
        const { comment, commenter } = eachComment;
        return (
          <article
            key={comment.id}
            className="p-2 mb-8 rounded-3xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
          >
            <Link
              to={`/account/${commenter.id}`}
              className="block my-4"
              onClick={() => {
                hideComment();
                document
                  .querySelector("body")
                  .classList.remove("overflow-hidden");
              }}
            >
              <figure className="grid grid-cols-[auto_minmax(0,100%)]">
                <div className="relative">
                  <div className="rounded-full overflow-hidden mr-4 w-[40px] h-[40px]">
                    <img
                      alt={`${commenter.first_name} ${commenter.last_name}`}
                      src={`${
                        commenter.profile_pic
                          ? profilePicURL + commenter.profile_pic
                          : "/Profile_Image_Placeholder-small.jpg"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <figcaption className="font-bold text-left">
                    <p id="one-line-ellipsis">
                      {commenter.first_name ? commenter.first_name : ""}{" "}
                      {commenter.last_name ? commenter.last_name : ""}
                    </p>
                  </figcaption>

                  <figcaption className="text-xs text-left">
                    <p id="two-line-ellipsis">
                      {getDayMonthAndYearOfDate(comment.dateCommented)}
                    </p>
                  </figcaption>
                </div>
              </figure>
            </Link>

            <div className="text-justify mb-3 text-sm">
              {convertEditorJSDataToHTMLForComment(JSON.parse(comment.comment))}
            </div>

            <div className="flex justify-between items-center">
              <div>
                {reactionType === "lov" ? (
                  <button
                    type="button"
                    aria-label="Filled heart"
                    title="Unlove"
                    // onClick={() => {
                    //   if (
                    //     user &&
                    //     Object.keys(user).length &&
                    //     !reactionRequestLoading
                    //   ) {
                    //     setReactionType("");
                    //     sendRemoveReactionRequest();
                    //   } else if (!user) {
                    //     setUserTriedToReact(true);
                    //   }
                    // }}
                  >
                    <AiFillHeart
                      className="inline text-red-500 text-2xl"
                      aria-label="filled like emoji"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Unfilled heart"
                    title="Love"
                    // onClick={() => {
                    //   if (
                    //     user &&
                    //     Object.keys(user).length &&
                    //     !reactionRequestLoading
                    //   ) {
                    //     setReactionType("love");
                    //     setAreThereLoves("true");
                    //     sendAddReactionRequest("love");
                    //   } else if (!user) {
                    //     setUserTriedToReact(true);
                    //   }
                    // }}
                  >
                    <AiOutlineHeart
                      className="inline text-xl"
                      aria-label="filled like emoji"
                    />
                  </button>
                )}{" "}
                <span>
                  {comment.total_num_comments_likes > 0
                    ? comment.total_num_comments_likes
                    : ""}
                </span>
              </div>

              {user && user.id === commenter.id && (
                <button
                  aria-label="delete article"
                  type="button"
                  title="Delete article"
                  className="text-red-500"
                  // onClick={() => {
                  //   // So, incase there is a timeout, we clear it here
                  //   clearTimeout(timeOutID);

                  //   // Then we also hide the pop up that says 'Undo delete'
                  //   hideUndoPopup();

                  //   setErrorDeleting(false);
                  //   setErrorUndoDeleting(false);

                  //   showDeleteConfirmation(eachArticle.id);
                  // }}
                  onClick={() => {
                    showCommentDeleteConfirmation(comment.id);
                  }}
                >
                  <MdOutlineDeleteForever className="inline text-2xl" />
                </button>
              )}
            </div>

            <div
              id={`deleteConfirmation${comment.id}`}
              className="confirmDelete z-10 hidden top-0 left-0 fixed w-full h-full"
              onClick={() => {
                hideCommentDeleteConfirmation(comment.id);
              }}
            >
              <article
                className="fixed rounded-2xl p-8 text-center w-full max-w-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-200 dark:bg-black shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="mb-4 font-bold">
                  Delete this comment&#x3f;{" "}
                  <span className="block text-red-500">
                    {" "}
                    This action cannot be undone
                  </span>
                </p>

                <div className="flex justify-around">
                  <button
                    disabled={deleteCommentLoading}
                    type="button"
                    className="px-4 font-bold rounded-xl disabled:cursor-not-allowed rounded-tl-xl py-2 ring-2 ring-red-500 hover:bg-red-500 hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                    onClick={() => {
                      if (!deleteCommentLoading) {
                        deleteComment(comment.id);
                      }
                    }}
                  >
                    {deleteCommentLoading ? <Loader /> : <span>Yes</span>}
                  </button>

                  <button
                    type="button"
                    // disabled={deleteLoading}
                    className="px-4 font-bold rounded-xl rounded-tl-xl py-2 ring-2 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                    onClick={() => {
                      hideCommentDeleteConfirmation(comment.id);
                    }}
                  >
                    No
                  </button>
                </div>

                {errorDeletingComment && (
                  <p className="text-red-500 text-xs font-bold p-4 mt-2">
                    Error Deleting, Please try again
                  </p>
                )}

                <button
                  aria-label="close"
                  type="button"
                  className="text-3xl absolute top-2 right-2 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
                  onClick={() => {
                    hideCommentDeleteConfirmation(comment.id);
                  }}
                >
                  <AiOutlineClose />
                </button>
              </article>
            </div>
          </article>
        );
      })}

      {errorGettingAllComments && (
        <p className="text-red-500 text-xs my-2 mb-4 text-center">
          <AiFillWarning className="text-2xl max-[370px]:text-lg inline" />
          Something went wrong and we could not get comments
        </p>
      )}

      <button
        aria-label="close"
        type="button"
        className="text-3xl absolute top-2 right-2 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
        onClick={() => {
          hideComment();
        }}
      >
        <AiOutlineClose />
      </button>
    </section>
  );
};

export default Comment;
