import { MdOutlineDeleteForever, MdWorkspacePremium } from "react-icons/md";
import { Link } from "react-router-dom";
import { AiFillWarning, AiOutlineClose } from "react-icons/ai";
import { BiSave } from "react-icons/bi";
import { useEffect, useState } from "react";
import { hideForm, showForm } from "../utils/showOrHideSignUpAndRegisterForms";
import ImageCropper from "./imageCropper";
import { userSelector } from "../reduxFiles/selectors";
import { useDispatch, useSelector } from "react-redux";
import { profilePicURL } from "../utils/imageURLS";
import Loader from "./loader";
import axiosClient from "../utils/axiosSetup";
import { userAction } from "../reduxFiles/actions";

const ProfilePage = () => {
  const has_articles = true;

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

  const id = "id";

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
    document.querySelector("#" + id).classList.add("hidden");
  };

  const showDeleteConfirmation = (id) => {
    document.querySelector("#" + id).classList.remove("hidden");
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
    }, 0.05);
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
        setFullName(`${user.first_name} ${user.last_name}`);
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
                    setUploadCanvas={(canvas) => {
                      setUploadCanvas(canvas);
                    }}
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
                    className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
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
                    className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
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
                    className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[10%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-15%] peer-focus:translate-y-[0] top-[-15%] transition-all duration-500 ease-linear"
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
                {fullName} has not added an <q>About Me</q> section yet.
              </p>
            )}
          </section>

          <section className="mt-4">
            <h2 className="text-center font-bold text-2xl uppercase mb-2">
              Articles by {fullName}
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

                    <div>
                      <button
                        aria-label="delete article"
                        type="button"
                        title="Delete article"
                        className="text-4xl text-red-500 max-[730px]:ml-2"
                        onClick={() => {
                          showDeleteConfirmation(id);
                        }}
                      >
                        <MdOutlineDeleteForever />
                      </button>

                      <div
                        id={id}
                        className="confirmDelete hidden top-0 left-0 fixed w-full h-full"
                        onClick={() => {
                          hideDeleteConfirmation(id);
                        }}
                      >
                        <article
                          className="fixed rounded-2xl p-8 text-center w-full max-w-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-200 dark:bg-black shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="mb-4 font-bold">
                            Are you sure you want to delete this article&#x3f;
                          </p>

                          <div className="flex justify-around">
                            <button
                              type="button"
                              className="px-4 font-bold rounded-xl rounded-tl-xl py-2 ring-2 ring-red-500 hover:bg-red-500 hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                              onClick={() => {
                                hideDeleteConfirmation(id);
                                showUndoPopup();
                                setArticleDeleteUndone(false);

                                const timeOutID = setTimeout(
                                  hideUndoPopup,
                                  5000
                                );
                                setTimeOutID(timeOutID);
                              }}
                            >
                              Yes
                            </button>

                            <button
                              type="button"
                              className="px-4 font-bold rounded-xl rounded-tl-xl py-2 ring-2 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                              onClick={() => {
                                hideDeleteConfirmation(id);
                              }}
                            >
                              No
                            </button>
                          </div>
                          <button
                            aria-label="close"
                            type="button"
                            className="text-3xl absolute top-2 right-2 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
                            onClick={() => {
                              hideDeleteConfirmation(id);
                            }}
                          >
                            <AiOutlineClose />
                          </button>
                        </article>
                      </div>
                    </div>

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
                            className="underline text-blue-400"
                            onClick={() => {
                              setArticleDeleteUndone(true);
                              clearTimeout(timeOutID);

                              setTimeout(hideUndoPopup, 5000);
                            }}
                          >
                            Undo
                          </button>
                        </p>
                      )}

                      <button
                        aria-label="close"
                        type="button"
                        className="text-2xl absolute top-1 right-1 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
                        onClick={() => {
                          hideUndoPopup();
                        }}
                      >
                        <AiOutlineClose />
                      </button>
                    </div>
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

export default ProfilePage;
