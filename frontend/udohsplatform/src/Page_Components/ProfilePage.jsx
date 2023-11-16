import { MdOutlineDeleteForever, MdWorkspacePremium } from "react-icons/md";
import { Link } from "react-router-dom";
import { AiFillWarning, AiOutlineClose } from "react-icons/ai";
import { BiSave } from "react-icons/bi";
import { LuFileEdit } from "react-icons/lu";
import { useEffect, useState } from "react";
import { hideForm, showForm } from "../utils/showOrHideSignUpAndRegisterForms";
import ImageCropper from "./imageCropper";
import { userSelector } from "../reduxFiles/selectors";
import { useDispatch, useSelector } from "react-redux";
import { profilePicURL } from "../utils/imageURLS";
import Loader from "./loader";
import axiosClient from "../utils/axiosSetup";
import { userAction } from "../reduxFiles/actions";
import EditArticle from "./editArticle";
import sanitizedData from "../utils/sanitizeDescription";
import { getDescription } from "../utils/getDescriptionText";
import getDayMonthAndYearOfDate from "../utils/getDayMonthAndYearOfDate";

const ProfilePage = () => {
  let user = useSelector(userSelector);
  user = user.userData;

  // If the user visited the link 'http://localhost:5173/userProfile', this will be true, but if they navigated from another page (like, while on the home page, they clicked 'Profile'), then this will be false
  let userIsLoading = useSelector(userSelector);
  userIsLoading = userIsLoading.userLoading;

  const [firstNameEdit, setFirstNameEdit] = useState("");
  const [lastNameEdit, setLastNameEdit] = useState("");
  const [bioEdit, setBioEdit] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    if (user && user.last_name) {
      setLastNameEdit(user.last_name);
    }

    if (user && user.first_name) {
      setFirstNameEdit(user.first_name);
    }

    if (user && user.bio) {
      setBioEdit(user.bio);
    }
  }, [user]);

  const [showImageCropperInterface, setShowImageCropperInterface] =
    useState(false);
  const [imageToCrop, setImageToCrop] = useState("");
  const [imageOnInput, setImageOnInput] = useState("");

  // This holds the image that has been cropped by the user.
  const [croppedImage, setCroppedImage] = useState("");

  // This tracks if there was an error in trying to edit the user's profile
  const [editProfileError, setEditProfileError] = useState(false);
  const [editProfileLoading, setEditProfileLoading] = useState(false);

  // This tracks when the 'undo' button is clicked, to undo a delete of an article
  const [articleDeleteUndone, setArticleDeleteUndone] = useState(false);

  // When the delete button on an article is clicked, these functions run to hide or show the the confirmation buttons
  const hideDeleteConfirmation = (id) => {
    document.querySelector("#delete" + id).classList.add("hidden");
  };

  const showDeleteConfirmation = (id) => {
    document.querySelector("#delete" + id).classList.remove("hidden");
  };

  // When the delete button on an article is clicked, these functions run to hide or show the the confirmation buttons
  const hideEditConfirmation = (id) => {
    document.querySelector("#edit" + id).classList.add("hidden");
  };

  const showEditConfirmation = (id) => {
    document.querySelector("#edit" + id).classList.remove("hidden");
  };

  // This useEffect hides the confirmDelete box if it is open.
  // Notice that it is the class fullNamed 'confirmDelete' that is selected. This will make it possible to select all the elements in the list
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelector(".confirmDelete").classList.add("hidden");
      }
    });
  });

  // This function shows/hides the undo popup
  const showUndoPopup = () => {
    const thePopUp = document.querySelector("#deletePopUp");
    thePopUp.classList.remove("hidden");

    setTimeout(() => {
      thePopUp.classList.remove("-bottom-36");
      thePopUp.classList.add("bottom-16");
    }, 1);
  };

  const hideUndoPopup = () => {
    const thePopUp = document.querySelector("#deletePopUp");
    thePopUp.classList.remove("bottom-16");
    thePopUp.classList.add("-bottom-36");

    setTimeout(() => {
      thePopUp.classList.add("hidden");
    }, 500);
  };

  // When an article is deleted, we timed the 'Undo delete' popup to disappear in 5 seconds.
  // This stores the 'setTimeout' ID, so that if the delete is undone, the Timeout will be cleared with 'clearTimeout', using this ID, so that the 'Delete undone' will show for 5 seconds before it disappears
  const [timeOutID, setTimeOutID] = useState(null);

  // This holds the date and month the user joined
  const [dateJoined, setDateJoined] = useState("");

  // Holds the fullName of the user from the database
  const [fullName, setFullName] = useState("");

  // This stores the format of the image the user uploaded (from their device).
  // In cropper.js, the cropped image is always larger in size than the original image. So, to fix this, we have to use the image's format when using ' uploadCanvas.toBlob'
  const [imageFormat, setImageFormat] = useState("");

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
        setFullName(
          `${user.first_name ? user.first_name : ""} ${
            user.last_name ? user.last_name : ""
          }`
        );
      } else {
        const editedEmailIndex = user.email.indexOf("@");
        let editedEmail = user.email;
        editedEmail = editedEmail.slice(0, editedEmailIndex);
        setFullName(editedEmail);
      }
    }
  }, [user]);

  const [uploadCanvas, setUploadCanvas] = useState(null);

  // This function runs to edit the user's profile
  const editProfile = async () => {
    setEditProfileLoading(true);
    setEditProfileError(false);

    // If the user want to edit their profile image
    if (uploadCanvas) {
      uploadCanvas.toBlob(async (blob) => {
        const formData = new FormData();

        const currentDateTime = new Date().toISOString(); // Get current date and time and append to the name of the image. This is a fix for a bug, bcoz the backend deletes the old image and saves the new one. Which will give the old and new image the same name, therefore the frontend will not re-render that new image until you refresh bcoz its the same name

        const slashIndex = imageFormat.indexOf("/"); // Since the extension will be in the format 'image/wep' or 'image/jpg', we get the index of the slash, and then slice from there
        const imageExtension = imageFormat.slice(slashIndex + 1);

        // So, the name of the image will be in the form 'udoh_2023-09-14T03:14:05.752Z.webp'
        formData.append(
          "profile_pic",
          blob,
          `${fullName}_${currentDateTime}.${imageExtension}`
        );

        formData.append("first_name", firstNameEdit);
        formData.append("last_name", lastNameEdit);
        formData.append("bio", bioEdit);

        try {
          const response = await axiosClient.post("api/editProfile", formData, {
            headers: {
              "content-type": "multipart/form-data",
            },
          });
          if (response.status === 200) {
            const data = response.data;
            dispatch(userAction({ userData: data }));
            hideForm("#editProfile");
          }
          setEditProfileLoading(false);
        } catch (error) {
          console.error("Error uploading cropped image:", error);
          setEditProfileError(true);
          setEditProfileLoading(false);
        }
      }, imageFormat); // Set format here to the original image's format otherwise, the cropped image will be larger in size (in mb or kb) than the original image
    } else {
      // So, if the user does not want to change their profile pic, this will run this instead
      try {
        const formData = new FormData();
        formData.append("first_name", firstNameEdit);
        formData.append("last_name", lastNameEdit);
        formData.append("bio", bioEdit);

        const response = await axiosClient.post("api/editProfile", formData);
        if (response.status === 200) {
          const data = response.data;
          dispatch(userAction({ userData: data }));
          hideForm("#editProfile");
        }
        setEditProfileLoading(false);
      } catch (error) {
        console.error("Error sending without image:", error);
        setEditProfileError(true);
        setEditProfileLoading(false);
      }
    }
  };

  // On the "edit profile" pop up, this function runs to display the image there.
  // It checks and uses the image from the backend. If no image has been uploaded yet (by the user), it will use the placeholder image (in the public folder).
  // But if the user just finished cropping an image, then it will use the cropped image instead
  const showCroppedImage = () => {
    if (croppedImage) {
      return croppedImage;
    } else if (user.profile_pic) {
      return profilePicURL + `${user.profile_pic}`;
    } else {
      return "/Profile_Image_Placeholder-small.jpg";
    }
  };

  // Keep track of whether the user's articles has been gotten from the backend
  const [userArticleLoading, setUserArticleLoading] = useState(true);

  // Store the user's article gotten from backend
  const [userArticles, setUserArticles] = useState([]);

  // Since the user's profile data is in our redux store, this useEffect runs to get the articles posted by the user
  useEffect(() => {
    const getUserArticle = async () => {
      try {
        setUserArticleLoading(true);
        const response = await axiosClient.get("/api/userArticles");
        if (response.status === 200) {
          setUserArticles(response.data);
          setUserArticleLoading(false);
        }
      } catch {
        setUserArticleLoading(false);
      }
    };

    if (user) {
      getUserArticle();
    }
  }, [user]);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorDeleting, setErrorDeleting] = useState(false);

  // This holds the deleted article's id, so if the user clicks on the button that says 'Undo delete', it will pick the ID here
  const [deletedArticleID, setDeletedArticleID] = useState("");

  // This function runs to delete an article, when given the ID
  const onDeleteArticle = async (id) => {
    try {
      setErrorDeleting(false);
      setDeleteLoading(true);
      const response = await axiosClient.delete(`/api/deleteArticle/${id}`);
      if (response.status === 200) {
        // Store the deleted article's ID incase the user clicks on 'undo'
        setDeletedArticleID(id);

        hideDeleteConfirmation(id);
        setDeleteLoading(false);

        setArticleDeleteUndone(false);
        showUndoPopup();

        const timeOutID = setTimeout(hideUndoPopup, 10000);
        setTimeOutID(timeOutID);

        setUserArticles(response.data);
      }
    } catch {
      setDeleteLoading(false);
      setErrorDeleting(true);
    }
  };

  const [deleteUndoLoading, setDeleteUndoLoading] = useState(false);
  const [errorUndoDeleting, setErrorUndoDeleting] = useState(false);

  const onUndoDelete = async () => {
    try {
      setDeleteUndoLoading(true);
      setErrorUndoDeleting(false);

      const response = await axiosClient.get(
        `/api/undoDeleteArticle/${deletedArticleID}`
      );
      if (response.status === 200) {
        setUserArticles(response.data);

        // This will make the message that says 'Delete Undone' to show
        setArticleDeleteUndone(true);

        // This will make sure it does not disappear after the previously set Timeout expires
        clearTimeout(timeOutID);

        // Then we set a new TimeOut and store the ID in our useState
        const newTimeOutID = setTimeout(hideUndoPopup, 10000);
        setTimeOutID(newTimeOutID);

        setDeleteUndoLoading(false);
      }
    } catch {
      setDeleteUndoLoading(false);
      setErrorUndoDeleting(true);
    }
  };

  // This useEffect makes sure the EditArticle jsx is hidden (and never loads)  until the user actually clicks the 'Edit Article' button
  const [showEditArticle, setShowEditArticle] = useState(null);

  // This function runs to show up the 'EditArticle' JSX
  const onEditClick = (articleID) => {
    // First, we find the article that the user wants to delete
    const articleToEdit = userArticles.find(
      (eachArticle) => eachArticle.id === articleID
    );

    // Then get the heroImage, mainArticle, articleID and title
    const { id, title, heroImage, theMainArticle } = articleToEdit;

    setShowEditArticle(
      <div className="bg-white dark:bg-[#020617] fixed top-0 left-0 right-0 z-10 overflow-auto w-full h-full">
        <EditArticle
          articleID={id}
          theTitle={title}
          theHeroImage={heroImage}
          theMainArticle={JSON.parse(theMainArticle)}
          hidEditArticle={() => {
            setShowEditArticle(null);
          }}
          setUserArticles={(newArticles) => {
            setUserArticles(newArticles);
          }}
        />
      </div>
    );

    const theBody = document.querySelector("body");
    theBody.classList.add("overflow-hidden");
    theBody.classList.add("h-full");
  };

  return (
    <>
      <title>{fullName} - udohsplatform</title>

      <>
        {userIsLoading || userArticleLoading ? (
          <div className="min-h-screen grid place-items-center">
            <Loader />
          </div>
        ) : (
          <main
            id="profilePage"
            className="min-h-screen py-[90px] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-[#a1d06d] via-[#ffffff] to-[#ffffff] dark:from-[#a1d06d] dark:via-[#020617] dark:to-[#020617]"
          >
            <section className="p-4">
              <figure className="flex items-center flex-col gap-4">
                <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
                  <img
                    alt=""
                    src={
                      user.profile_pic
                        ? profilePicURL + `${user.profile_pic}`
                        : "/Profile_Image_Placeholder-small.jpg"
                    }
                  />
                </div>

                <figcaption className="text-xl text-center">
                  <p className="mb-3">
                    <strong> {fullName} </strong>
                  </p>
                  <small>Udohs Platform member since {dateJoined}</small>
                  {user.premium_member && (
                    <strong className="text-[rgb(255,145,0)] dark:text-[#ffd700] block">
                      <MdWorkspacePremium className="inline" />
                      Premium member
                      <MdWorkspacePremium className="inline" />
                    </strong>
                  )}
                </figcaption>
              </figure>
            </section>

            <div className="text-center my-4">
              <button
                type="button"
                className="px-4 font-bold rounded-br-xl rounded-tl-xl py-2 ring-4 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                onClick={() => {
                  showForm("#editProfile");
                }}
              >
                Edit profile
              </button>

              {/* NOTE: WHEN THE 'Edit profile' BUTTON IS CLICKED, THE <div> THAT WRAPS THE <form> THAT WILL POP UP, STARTS HERE */}
              <div
                id="editProfile"
                className="flex justify-center fixed top-0 left-0 w-full h-full z-10 hidden scale-[0] rounded-full transition-all duration-500 ease-linear"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    editProfile();
                  }}
                  className="fixed overflow-auto w-full pb-16 pt-6 bg-slate-200 dark:bg-black h-full top-0 z-30 p-4 max-w-[700px]"
                >
                  <div className="flex justify-center">
                    <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
                      <img alt="" src={showCroppedImage()} />
                    </div>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="changeProfilePicture"
                      accept="image/*"
                      className="max-w-full hidden"
                      multiple={false}
                      value={imageOnInput}
                      onChange={(e) => {
                        // Check if a file was provided, then check if the file is an image file
                        if (
                          e.target.files.length &&
                          e.target.files[0].type.startsWith("image/")
                        ) {
                          setImageFormat(e.target.files[0].type);
                          setImageToCrop(e.target.files[0]);
                          setShowImageCropperInterface(true);
                        } else {
                          console.log("Invalid file provided");
                        }
                      }}
                    />
                    <label
                      htmlFor="changeProfilePicture"
                      className="block mt-3 underline text-blue-500 cursor-pointer"
                    >
                      Change picture
                    </label>
                  </div>

                  {showImageCropperInterface && (
                    <ImageCropper
                      // Send the image that we want to crop
                      imageToCrop={imageToCrop}
                      // Hide this 'ImageCropper' interface
                      setShowImageCropperInterface={() => {
                        setShowImageCropperInterface(false);
                      }}
                      // Clear the <input type="file" /> field
                      setImageOnInput={() => {
                        setImageOnInput("");
                      }}
                      // Get the cropped image
                      setCroppedImageOnParent={(image) => {
                        setCroppedImage(image);
                      }}
                      // The image canvas that will be manipulated and then have the image sent to the server
                      setUploadCanvas={(canvas) => {
                        setUploadCanvas(canvas);
                      }}
                      // The format of the image (whether image/webp, image/jpeg etc)
                      imageFormat={imageFormat}
                    />
                  )}

                  <div className="flex flex-col-reverse mb-8 relative mt-16">
                    <input
                      type="text"
                      placeholder=" "
                      id="firstName"
                      maxLength={20}
                      required
                      value={firstNameEdit}
                      onChange={(e) => setFirstNameEdit(e.target.value)}
                      className="h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 peer"
                    />

                    <label
                      htmlFor="firstName"
                      className="cursor-text text-gray-500 text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
                    >
                      First Name
                    </label>

                    <small
                      className={`self-start absolute top-10 left-2 ${
                        firstNameEdit.length >= 15 && "text-red-500"
                      }`}
                    >
                      {firstNameEdit.length}/20
                    </small>
                  </div>

                  <div className="flex flex-col-reverse mb-8 relative mt-16">
                    <input
                      type="text"
                      required
                      placeholder=" "
                      maxLength={20}
                      id="lastName"
                      value={lastNameEdit}
                      onChange={(e) => setLastNameEdit(e.target.value)}
                      className="h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 peer"
                    />

                    <label
                      htmlFor="lastName"
                      className="cursor-text text-gray-500 text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
                    >
                      Last Name
                    </label>

                    <small
                      className={`self-start absolute top-10 left-2 ${
                        lastNameEdit.length >= 15 && "text-red-500"
                      }`}
                    >
                      {lastNameEdit.length}/20
                    </small>
                  </div>

                  <div className="flex flex-col-reverse mb-8 relative mt-16">
                    <textarea
                      placeholder=" "
                      required
                      id="about"
                      maxLength={999}
                      value={bioEdit}
                      onChange={(e) => setBioEdit(e.target.value)}
                      className="h-[250px] resize-none rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 peer"
                    ></textarea>

                    <label
                      htmlFor="about"
                      className="cursor-text text-gray-500 text-xl p-1 absolute peer-placeholder-shown:top-[10%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-15%] peer-focus:translate-y-[0] top-[-15%] transition-all duration-500 ease-linear"
                    >
                      About
                    </label>

                    <small
                      className={`self-start absolute -bottom-5 left-2 ${
                        bioEdit.length >= 950 && "text-red-500"
                      }`}
                    >
                      {bioEdit.length}/999
                    </small>
                  </div>

                  {editProfileError && (
                    <p className="text-red-500 text-sm text-center mb-4">
                      <AiFillWarning className="inline text-lg mr-1" />
                      Something went wrong
                    </p>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={editProfileLoading}
                      className="px-4 flex justify-center items-center w-[200px] uppercase font-bold rounded-br-xl rounded-tl-xl py-2 ring-4 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                    >
                      {editProfileLoading ? (
                        <Loader />
                      ) : (
                        <span className="flex justify-center">
                          Save <BiSave className="text-xl ml-2 inline" />
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    aria-label="close"
                    type="button"
                    className="text-4xl absolute right-3 top-3 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
                    onClick={() => {
                      hideForm("#editProfile");
                    }}
                  >
                    <AiOutlineClose />
                  </button>
                </form>
              </div>
            </div>

            <section className="p-4">
              <h2 className="text-center font-bold text-2xl uppercase mb-2">
                About
              </h2>

              {user.bio ? (
                <div className="flex justify-center">
                  <p className="text-justify max-w-[480px]">{user.bio}</p>
                </div>
              ) : (
                <p className="text-center italic">
                  You have not added an <q>About Me</q> section yet.{" "}
                  <button
                    onClick={() => {
                      showForm("#editProfile");
                    }}
                    className="text-blue-500 underline"
                  >
                    Add now
                  </button>
                </p>
              )}
            </section>

            {userArticles.length ? (
              <section className="my-20">
                <h2 className="text-center font-bold text-xl uppercase mb-2">
                  Your Articles
                </h2>

                {userArticles.map((eachArticle) => (
                  <div key={eachArticle.id} className="flex justify-center">
                    <div className="flex-[0_1_750px]">
                      <section className="p-4 mt-8 items-center justify-between flex gap-8 max-[730px]:gap-2 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
                        <Link
                          to={`/read/${eachArticle.title}/${eachArticle.id}`}
                          className="flex-[7_7_0%]"
                        >
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
                          <small className="mt-4 block">
                            {getDayMonthAndYearOfDate(eachArticle.datePosted)}
                          </small>
                        </Link>

                        <div>
                          <button
                            aria-label="Edit article"
                            type="button"
                            title="Edit article"
                            className="text-3xl max-[730px]:ml-2 block mb-4"
                            onClick={() => {
                              showEditConfirmation(eachArticle.id);
                            }}
                          >
                            <LuFileEdit />
                          </button>

                          <div
                            id={`edit${eachArticle.id}`}
                            className="confirmDelete hidden top-0 left-0 fixed w-full h-full"
                            onClick={() => {
                              hideEditConfirmation(eachArticle.id);
                            }}
                          >
                            <article
                              className="fixed rounded-2xl p-8 text-center w-full max-w-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-200 dark:bg-black shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="mb-4 font-bold">
                                Please confirm you want to edit this post
                              </p>

                              <div className="flex justify-around">
                                <button
                                  type="button"
                                  className="px-4 font-bold rounded-xl rounded-tl-xl py-2 ring-2 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                                  onClick={() => {
                                    hideEditConfirmation(eachArticle.id);
                                    onEditClick(eachArticle.id);
                                  }}
                                >
                                  Yes, Edit
                                </button>

                                <button
                                  type="button"
                                  className="px-4 font-bold rounded-xl rounded-tl-xl py-2 ring-2 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                                  onClick={() => {
                                    hideEditConfirmation(eachArticle.id);
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                              <button
                                aria-label="close"
                                type="button"
                                className="text-3xl absolute top-2 right-2 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
                                onClick={() => {
                                  hideEditConfirmation(eachArticle.id);
                                }}
                              >
                                <AiOutlineClose />
                              </button>
                            </article>
                          </div>

                          <button
                            aria-label="delete article"
                            type="button"
                            title="Delete article"
                            className="text-4xl text-red-500 max-[730px]:ml-2 block"
                            onClick={() => {
                              // So, incase there is a timeout, we clear it here
                              clearTimeout(timeOutID);

                              // Then we also hide the pop up that says 'Undo delete'
                              hideUndoPopup();

                              setErrorDeleting(false);
                              setErrorUndoDeleting(false);

                              showDeleteConfirmation(eachArticle.id);
                            }}
                          >
                            <MdOutlineDeleteForever />
                          </button>

                          <div
                            id={`delete${eachArticle.id}`}
                            className="confirmDelete hidden top-0 left-0 fixed w-full h-full"
                            onClick={() => {
                              if (!deleteLoading) {
                                hideDeleteConfirmation(eachArticle.id);
                              }
                            }}
                          >
                            <article
                              className="fixed rounded-2xl p-8 text-center w-full max-w-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-200 dark:bg-black shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="mb-4 font-bold">
                                Are you sure you want to delete this
                                article&#x3f;{" "}
                              </p>

                              <div className="flex justify-around">
                                <button
                                  disabled={deleteLoading}
                                  type="button"
                                  className="px-4 font-bold rounded-xl rounded-tl-xl py-2 ring-2 ring-red-500 hover:bg-red-500 hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                                  onClick={() => {
                                    if (!deleteLoading) {
                                      onDeleteArticle(eachArticle.id);
                                    }
                                  }}
                                >
                                  {deleteLoading ? (
                                    <Loader />
                                  ) : (
                                    <span>Yes</span>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  disabled={deleteLoading}
                                  className="px-4 font-bold rounded-xl rounded-tl-xl py-2 ring-2 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                                  onClick={() => {
                                    if (!deleteLoading) {
                                      hideDeleteConfirmation(eachArticle.id);
                                    }
                                  }}
                                >
                                  No
                                </button>
                              </div>

                              {errorDeleting && (
                                <p className="text-red-500 text-sm font-bold p-4 mt-2">
                                  Error Deleting, Please try again
                                </p>
                              )}

                              <button
                                aria-label="close"
                                type="button"
                                className="text-3xl absolute top-2 right-2 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
                                onClick={() => {
                                  if (!deleteLoading) {
                                    hideDeleteConfirmation(eachArticle.id);
                                  }
                                }}
                              >
                                <AiOutlineClose />
                              </button>
                            </article>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              <section className="my-20">
                <h2 className="text-center font-bold text-2xl uppercase mb-2">
                  Your Articles
                </h2>
                <p className="text-center italic">
                  You have no articles yet.{" "}
                  <Link to="/write" className="text-blue-500 underline">
                    Add one
                  </Link>
                </p>
              </section>
            )}

            <div
              id="deletePopUp"
              className="-bottom-36 hidden fixed font-bold z-50 max-w-[400px] left-1/2 w-full p-4 bg-gray-200 -translate-x-1/2 -translate-y-1/2 dark:bg-black shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] transition-all duration-500 ease-linear"
            >
              {articleDeleteUndone ? (
                <p className="text-center">Delete undone</p>
              ) : (
                <p className="flex justify-around">
                  Article deleted
                  <button
                    type="button"
                    disabled={deleteUndoLoading}
                    className="underline text-blue-400 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (!deleteUndoLoading) {
                        onUndoDelete();
                      }
                    }}
                  >
                    {deleteUndoLoading ? <Loader /> : <span>Undo</span>}
                  </button>
                </p>
              )}

              {errorUndoDeleting && (
                <p className="text-red-500 text-sm font-bold p-4 mt-2">
                  Error undoing that delete, Please try again
                </p>
              )}

              <button
                aria-label="close"
                type="button"
                className="text-2xl absolute top-1 right-1 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
                onClick={() => {
                  if (!deleteUndoLoading) {
                    hideUndoPopup();
                    clearTimeout(timeOutID);
                  }
                }}
              >
                <AiOutlineClose />
              </button>
            </div>

            {showEditArticle}
          </main>
        )}
      </>
    </>
  );
};

export default ProfilePage;
