import EditorJS from "@editorjs/editorjs";
import { useEffect, useRef, useState } from "react";
import Loader from "./loader";
import { BsPencilSquare } from "react-icons/bs";
import { VscPreview } from "react-icons/vsc";
import ImageCropper_WritePage from "./imageCropper_WritePage";
import editorJSConfiguration from "../utils/editorJSConfig";
import {
  AiFillWarning,
  AiOutlineClose,
  AiOutlineFileDone,
} from "react-icons/ai";
import { BiCheck, BiCopy, BiSolidErrorAlt } from "react-icons/bi";
import { FiImage } from "react-icons/fi";
import Preview from "./Preview";
import axiosClient from "../utils/axiosSetup";
import { userSelector } from "../reduxFiles/selectors";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { showForm } from "../utils/showOrHideSignUpAndRegisterForms";
import { frontendURL } from "../utils/imageURLS";
import { MdCelebration } from "react-icons/md";
import Confetti from "react-confetti";

/*
 Documentation for EditorJS - https://github.com/editor-js/awesome-editorjs
*/

const MyEditor = () => {
  let user = useSelector(userSelector);
  user = user.userData;
  // user = { bio: 1, first_name: 2, last_name: 3 };

  // This gets EditorJS data from local-storage if available
  const getStoreDraftDataFromLocalStorage = () => {
    const storedJsonString = localStorage.getItem("draftData");

    if (storedJsonString) {
      // Parse the JSON string back into an object
      const retrievedObject = JSON.parse(storedJsonString);

      return retrievedObject;
    } else {
      return null;
    }
  };

  const [editorLoading, setEditorLoading] = useState(true);
  const [theEditor, setTheEditor] = useState(null);

  // This stores the format of the image the user uploaded (from their device).
  // In cropper.js, the cropped image is always larger in size than the original image. So, to fix this, we have to use the image's format when using ' uploadCanvas.toBlob'
  const [imageFormat, setImageFormat] = useState("");

  const [showImageCropperInterface, setShowImageCropperInterface] =
    useState(false);
  const [imageToCrop, setImageToCrop] = useState("");

  const [uploadCanvas, setUploadCanvas] = useState(null);

  const [imageOnInput, setImageOnInput] = useState("");

  const [croppedImage, setCroppedImage] = useState("");

  const [title, setTitle] = useState("");

  const [viewMode, setViewMode] = useState("write");

  // Used to fix issue of the editor rendering twice, because strict-mode is set to true
  const isReady = useRef(false);

  // This stores the data in the draft
  const [draftData, setDraftData] = useState();

  // This controls if the user should see 'add hero image' interface
  const [showAddHero, setShowAddHero] = useState(false);

  // This disables the 'Post' button
  const [postDisable, setPostDisable] = useState(true);

  // This disables the 'Post Now' button
  const [postNowDisable, setPostNowDisable] = useState(true);

  // This controls when the user clicks on 'Post Now' button, and the backend is currently processing the post
  const [postNowLoading, setPostNowLoading] = useState(false);

  const [errorPosting, setErrorPosting] = useState(false);

  // This checks if the user has up to 10 posts and is a free member
  const [maxPostsExceeded, setMaxPostsExceeded] = useState(false);

  // This checks if the user has already posted an article with that title
  const [titleAlreadyExist, setTitleAlreadyExist] = useState(false);

  // This useRef just makes sure the user makes up to 10 changes before showing the popup message that says 'Saved to draft'
  const noOfChanges = useRef(0);

  // This useState watches when the 'Post' button is clicked
  const [postButtonIsClick, setPostButtonIsClick] = useState(false);

  // This stores the link of the user's article, after a successful write
  const [articleLink, setArticleLink] = useState("");

  // This controls if the copy button is clicked or not
  const [copied, setCopied] = useState(false);

  // This useEffect makes sure the copy button is shown again after 5 seconds
  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 5000);
    }
  }, [copied]);

  // This makes sure that the popup message that says 'Saved to draft' appears just once
  const showSavedToDraft = useRef(true);

  // This checks when the maximum number of posts has been exceeded
  useEffect(() => {
    if (user) {
      if (user.no_of_post >= 10 && !user.premium_member) {
        setMaxPostsExceeded(true);
      } else {
        setMaxPostsExceeded(false);
      }
    }
  }, [user]);

  // This function shows/hides the popup message that says 'Saved to draft'
  const showSavedToDraftMessage = () => {
    const thePopUp = document.querySelector("#messagePopUp");
    thePopUp.classList.remove("hidden");

    setTimeout(() => {
      thePopUp.classList.add("bottom-16");
      thePopUp.classList.remove("-bottom-36");
    }, 0.05);
  };

  useEffect(() => {
    const draftData = getStoreDraftDataFromLocalStorage();
    setDraftData(draftData);
  }, []);

  const hideSavedToDraftMessage = () => {
    const thePopUp = document.querySelector("#messagePopUp");
    thePopUp.classList.remove("bottom-16");
    thePopUp.classList.add("-bottom-36");

    setTimeout(() => {
      thePopUp.classList.add("hidden");
    }, 500);
  };

  // This useEffect stores the user's data in local-storage.
  useEffect(() => {
    if (draftData) {
      const jsonString = JSON.stringify(draftData);
      // Store the JSON string in local storage under a key
      localStorage.setItem("draftData", jsonString);

      // Store the title in localStorage as well
      localStorage.setItem("theTitle", title);

      if (showSavedToDraft.current) {
        if (noOfChanges.current >= 10) {
          showSavedToDraftMessage(); // Show the popup message that says 'Saved to draft'
          showSavedToDraft.current = false; // Make sure this block is not executed again
          setTimeout(hideSavedToDraftMessage, 10000); // After 1 minute, we hide the popup message that says 'Saved to draft'
        }
        noOfChanges.current += 1;
      }
    }
  }, [draftData, showSavedToDraft, title]);

  // This useEffect gets the 'Title' of the article and saves it in local-storage
  useEffect(() => {
    const previouslyAddedTitle = localStorage.getItem("theTitle");
    if (previouslyAddedTitle) {
      setTitle(previouslyAddedTitle);
    }
  }, []);

  // Initialize the editorJS
  useEffect(() => {
    if (!isReady.current) {
      const editor = new EditorJS(
        editorJSConfiguration(getStoreDraftDataFromLocalStorage, setDraftData)
      );
      setTheEditor(editor);

      // Check when the editor is ready, then stop the loading

      editor.isReady.then(() => {
        setEditorLoading(false);
      });
    }

    isReady.current = true;
  }, []);

  // Calls the editor.save() to save the editorjs data and send to the backend
  const saveEditor = () => {
    if (theEditor && uploadCanvas) {
      setPostNowLoading(true);
      setPostNowDisable(true);
      setErrorPosting(false);
      setMaxPostsExceeded(false);
      setTitleAlreadyExist(false);
      // First we save the EditorJS data and get the output
      theEditor
        .save()
        .then((outputData) => {
          uploadCanvas.toBlob(async (blob) => {
            try {
              const formData = new FormData();

              const currentDateTime = new Date().toISOString(); // Get current date and time and append to the name of the image. This is a fix for a bug, bcoz the backend deletes the old image and saves the new one. Which will give the old and new image the same name, therefore the frontend will not re-render that new image until you refresh bcoz its the same name

              const slashIndex = imageFormat.indexOf("/"); // Since the extension will be in the format 'image/wep' or 'image/jpg', we get the index of the slash, and then slice from there
              const imageExtension = imageFormat.slice(slashIndex + 1);

              // So, the name of the image will be in the form 'udoh_2023-09-14T03:14:05.752Z.webp'
              formData.append(
                "heroImage",
                blob,
                `${title}_${currentDateTime}.${imageExtension}`
              );

              formData.append("title", title);

              // Stringify the EditorJS output data and send the string to the backend
              const jsonString = JSON.stringify(outputData);

              formData.append("theMainArticle", jsonString);

              const response = await axiosClient.post(
                "api/userData",
                formData,
                {
                  headers: {
                    "content-type": "multipart/form-data",
                  },
                }
              );
              if (response.status === 201) {
                const data = response.data;
                setArticleLink(`${frontendURL}${data}`);
                localStorage.removeItem("draftData");
                localStorage.removeItem("theTitle");
              }
              setPostNowLoading(false);
              setPostNowDisable(false);
            } catch (error) {
              if (error.request.status === 406) {
                setMaxPostsExceeded(true);
                setPostNowLoading(false);
                setPostNowDisable(false);
              } else if (error.request.status === 409) {
                setTitleAlreadyExist(true);
                setPostNowLoading(false);
                setPostNowDisable(false);
              } else {
                setPostNowLoading(false);
                setPostNowDisable(false);
                setErrorPosting(true);
              }
            }
          }, imageFormat);
        })
        .catch(() => {
          setPostNowLoading(false);
          setPostNowDisable(false);
          setErrorPosting(true);
        });
    }
  };

  const showCroppedImage = () => {
    if (croppedImage) {
      return croppedImage;
    }
  };

  // This useEffect makes sure the 'Post' button is disabled at the right time
  useEffect(() => {
    if (postButtonIsClick) {
      if (
        title &&
        draftData &&
        draftData.blocks.length !== 0 &&
        user &&
        user.bio &&
        user.last_name &&
        user.first_name
      ) {
        setPostDisable(false);
      } else {
        setPostDisable(true);
      }
    } else {
      if (title && draftData && draftData.blocks.length !== 0) {
        setPostDisable(false);
      } else {
        setPostDisable(true);
      }
    }
  }, [title, draftData, user, postButtonIsClick]);

  // This useEffect makes sure the 'Post Now' button is disabled
  useEffect(() => {
    if (
      user &&
      user.bio &&
      user.last_name &&
      user.first_name &&
      uploadCanvas &&
      croppedImage &&
      title &&
      draftData &&
      draftData.blocks.length !== 0
    ) {
      setPostNowDisable(false);
    } else {
      setPostNowDisable(true);
    }
  }, [title, draftData, uploadCanvas, croppedImage, user]);

  // Controls if the confetti should show, to congratulate the user
  const [showConfetti, setShowConfetti] = useState(true);

  // Turn off the confetti after 1 minute
  useEffect(() => {
    if (articleLink) {
      setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
    }
  }, [articleLink]);

  // Added so that confetti will respond to resize of the screen
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // This keeps track of the previous position that the user is
  const [previousScrollPosition, setPreviousScrollPosition] = useState(0);

  // This tracks if the user is scrolling up or down
  const [scrollDir, setScrollDir] = useState("");

  // This useEffect adds an event listener to listen to scroll events
  useEffect(() => {
    // Check if the user is currently scrolling up or down
    const checkScroll = () => {
      if (window.scrollY < previousScrollPosition) {
        setScrollDir("up");
      } else {
        setScrollDir("down");
      }
    };

    window.addEventListener("scroll", () => {
      setPreviousScrollPosition(window.scrollY);
      checkScroll();
    });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", () => {
        setPreviousScrollPosition(window.scrollY);
        checkScroll();
      });
    };
  }, [previousScrollPosition]);

  // This hides/shows the <div> that has the 'Write' and 'Preview' text
  const hideWritePreview = () => {
    const writePreviewId = document.querySelector("#WritePreview");
    writePreviewId.classList.remove("top-16");
    writePreviewId.classList.add("-top-36");
  };

  const showWritePreview = () => {
    const writePreviewId = document.querySelector("#WritePreview");
    writePreviewId.classList.remove("-top-36");
    writePreviewId.classList.add("top-16");
  };

  // This useEffect monitors the scroll-Direction and the previous-scroll-position and then hide or show the <div> that has the 'Write' and 'Preview' text
  useEffect(() => {
    if (scrollDir === "down" && previousScrollPosition >= 203) {
      hideWritePreview();
    } else {
      showWritePreview();
    }
  }, [previousScrollPosition, scrollDir]);

  return (
    <>
      {!articleLink ? (
        <main className="min-h-screen pt-20">
          {editorLoading && (
            <div className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] w-full h-full">
              <div className="fixed top-1/2 left-1/2 z-10">
                <Loader />
              </div>
            </div>
          )}

          <div
            id="WritePreview"
            className="flex justify-center pt-10 fixed w-full top-16 bg-white dark:bg-[#020617] z-50 transition-all duration-300 ease-linear"
          >
            <section className="min-[400px]:text-xl min-[500px]:text-2xl flex justify-between mb-4 p-4 flex-[0_1_670px]">
              <button
                className={`px-4 rounded-br-xl rounded-tl-xl py-2 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]'
            ${viewMode == "write" ? "ring-4 font-bold" : "ring-1"}
            `}
                type="button"
                onClick={() => {
                  setViewMode("write");
                }}
              >
                <span>
                  Write <BsPencilSquare className="inline" />
                </span>
              </button>

              <button
                className={`px-4 rounded-br-xl rounded-tl-xl py-2 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]'
            ${viewMode == "preview" ? "ring-4 font-bold" : "ring-1"}
            `}
                type="button"
                onClick={() => {
                  setViewMode("preview");
                }}
              >
                <span>
                  Preview <VscPreview className="inline" />
                </span>
              </button>
            </section>
          </div>

          <section
            className={`${viewMode === "write" ? "block" : "hidden"} pt-28`}
          >
            <form className="bg-white text-black px-4 pt-6 min-[645px]:px-14 flex justify-center">
              <div className="flex-[0_1_650px] flex flex-col-reverse relative mt-8">
                <input
                  type="text"
                  required
                  placeholder=" "
                  id="title"
                  value={title}
                  onChange={(e) => {
                    if (titleAlreadyExist) {
                      setTitleAlreadyExist(false); // Added incase the titleAlreadyExist error message had shown
                    }
                    setTitle(e.target.value);
                  }}
                  className="h-10 rounded-xl bg-white ring-2 ring-[#81ba40] p-1 peer"
                />

                <label
                  htmlFor="title"
                  className="text-gray-500 cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
                >
                  Title&nbsp;<span className="text-red-500">&#42;</span>
                </label>
              </div>
            </form>

            <div
              id="editorJS"
              className="bg-white text-black p-4 min-[645px]:px-14"
            ></div>

            {showAddHero && (
              <>
                <div className="flex justify-center">
                  <div className="flex-[0_1_650px] p-4">
                    {croppedImage ? (
                      <div className="flex justify-center">
                        <div className="w-[200px] h-[200px] overflow-hidden">
                          <img alt="" src={showCroppedImage()} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-center font-bold text-lg">
                          Lastly, please add a hero image
                        </h2>
                        <p className="text-justify">
                          This will not appear on your story. It will only
                          appear on our &#8220;All Articles&#8221; page, to make
                          your story more inviting to readers.
                        </p>
                      </>
                    )}

                    <div>
                      <input
                        type="file"
                        id="heroImage"
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
                        htmlFor="heroImage"
                        className="flex justify-center items-center gap-2 mt-3 text-center cursor-pointer w-full p-4 bg-white-200 dark:bg-[#020617] shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                      >
                        <FiImage className="inline text-xl" />{" "}
                        <span>
                          {croppedImage
                            ? "Change hero image"
                            : "Add a hero image"}
                        </span>
                      </label>
                    </div>
                  </div>

                  {showImageCropperInterface && (
                    <ImageCropper_WritePage
                      // Send the image that we want to crop
                      imageToCrop={imageToCrop}
                      // Hide this 'ImageCropper' interface
                      setShowImageCropperInterface={() => {
                        setShowImageCropperInterface(false);
                      }}
                      // Clear the <input type="file" /> field (fix for profile image page)
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
                </div>
              </>
            )}

            {maxPostsExceeded && (
              <p className="text-sm max-[370px]:text-xs text-red-500 mb-8 text-center mt-2">
                <AiFillWarning className="text-2xl max-[370px]:text-lg inline" />
                Maximum number of posts exceeded. Please visit the&nbsp;
                <Link
                  className="uppercase underline font-bold"
                  to="/membership"
                >
                  Membership
                </Link>{" "}
                page to unlock unlimited access.
              </p>
            )}

            {postButtonIsClick &&
              (!user || !user.bio || !user.last_name || !user.first_name) && (
                <div className="p-4 -mb-16">
                  {!user && (
                    <p className="text-center text-sm max-[370px]:text-xs text-red-500 mb-8">
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
                      &nbsp;to continue.
                    </p>
                  )}

                  {user &&
                    (!user.bio || !user.last_name || !user.first_name) && (
                      <>
                        <p className="text-center">
                          Your story is ready to go live, however, the world
                          needs to know the writer of this brilliant story:
                        </p>

                        <p className="text-sm max-[370px]:text-xs text-red-500 mb-8 text-center mt-2">
                          <AiFillWarning className="text-2xl max-[370px]:text-lg inline" />
                          Please visit the&nbsp;
                          <Link
                            className="uppercase underline font-bold"
                            to="/userProfile"
                          >
                            Profile
                          </Link>{" "}
                          page and click on &quot;Edit Profile&quot; to update
                          your information.&nbsp;
                        </p>
                      </>
                    )}
                </div>
              )}

            {!showAddHero && (
              <div className="flex justify-center mb-16 mt-6 p-4">
                <button
                  type="submit"
                  disabled={postDisable}
                  onClick={() => {
                    if (!postDisable) {
                      if (!postButtonIsClick) {
                        setPostButtonIsClick(true);
                      }

                      if (
                        user &&
                        user.bio &&
                        user.first_name &&
                        user.last_name
                      ) {
                        setShowAddHero(true);
                      }
                    }
                  }}
                  className="w-full max-w-[400px] font-bold uppercase relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
                  <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md group-disabled:bg-gray-500"></span>
                  <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 group-disabled:bg-gray-500"></span>
                  <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center group-disabled:text-gray-700 dark:group-disabled:text-gray-700">
                    <>Post</>
                  </span>
                </button>
              </div>
            )}

            {showAddHero && (
              <div className="flex justify-center mb-16 mt-6 p-4">
                <button
                  type="submit"
                  disabled={postNowDisable}
                  onClick={() => {
                    if (!postNowDisable) {
                      saveEditor();
                    }
                  }}
                  className="w-full max-w-[400px] font-bold uppercase relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
                  <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md group-disabled:bg-gray-500"></span>
                  <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 group-disabled:bg-gray-500"></span>
                  <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center group-disabled:text-gray-700 dark:group-disabled:text-gray-700">
                    {postNowLoading ? <Loader /> : <>Post now</>}
                  </span>
                </button>
              </div>
            )}

            {errorPosting && (
              <p className="p-4 text-red-500 text-center font-bold -mt-16 text-sm">
                <BiSolidErrorAlt className="inline text-2xl" /> Something went
                wrong and we could not post your story. Please try again later
              </p>
            )}

            {titleAlreadyExist && (
              <p className="text-sm max-[370px]:text-xs text-red-500 mb-8 text-center -mt-16 p-3">
                <AiFillWarning className="text-2xl max-[370px]:text-lg inline" />
                You already have an article with this title. Change the title or
                go to&nbsp;
                <Link
                  className="uppercase underline font-bold"
                  to="/userProfile"
                >
                  Profile
                </Link>{" "}
                page and delete or edit the already existing article with this
                title.
              </p>
            )}

            <div
              id="messagePopUp"
              className="-bottom-36 hidden rounded-2xl fixed font-bold z-50 max-w-[400px] right-0 w-full p-4 bg-[#020617] -translate-y-1/2 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] transition-all duration-500 ease-linear"
            >
              <p className="text-center text-green-400 flex flex-col text-sm">
                <span className="text-base">
                  {" "}
                  <AiOutlineFileDone className="inline text-3xl" /> Saved to
                  draft!
                </span>{" "}
                <span className="text-white">
                  {" "}
                  You can exit this page, come back later and you will pick up
                  from where you left off
                </span>
              </p>

              <button
                aria-label="close"
                type="button"
                className="text-2xl absolute top-1 right-1 text-[#81ba40] dark:text-[#a1d06d] cursor-pointer"
                onClick={() => {
                  hideSavedToDraftMessage();
                }}
              >
                <AiOutlineClose />
              </button>
            </div>
          </section>

          <section
            className={`${viewMode === "preview" ? "block" : "hidden"} pt-36`}
          >
            <Preview theData={draftData} title={title} />
          </section>
        </main>
      ) : (
        <>
          <div className="z-50 fixed top-0 left-0">
            <Confetti
              numberOfPieces={200}
              width={windowDimensions.width}
              height={windowDimensions.height}
              gravity={0.05} // Controls how fast the confetti should fall
              recycle={showConfetti} // Controls if the confetti will keep showing or not
            />
          </div>

          <main className="min-h-screen mb-10 justify-center flex text-center bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-[#a1d06d] via-[#ffffff] to-[#ffffff] dark:from-[#a1d06d] dark:via-[#020617] dark:to-[#020617]">
            <div className="flex flex-col min-h-screen gap-8 p-4 max-w-[650px]">
              <h1 className="pt-[90px] text-[9vw] font-bold text-center text-[#81ba40] dark:text-[#70dbb8] min-[870px]:text-[75px]">
                Congratulations!
              </h1>

              <h2 className="font-bold uppercase text-2xl text-center">
                <strong className="text-[rgb(255,145,0)] dark:text-[#ffd700] block my-8 max-[450px]:text-xl">
                  <MdCelebration className="inline" />
                  Your story is live!
                  <MdCelebration className="inline" />
                </strong>
              </h2>
              <p className="text-center text-lg">
                Below is a link to your story. You can share with your friends
                to read, like and comment.
              </p>

              <div className="p-4 py-10 relative shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
                <Link
                  className="underline text-center text-lg break-all"
                  to={`${articleLink}`}
                >
                  {articleLink}
                </Link>

                <div className="bg-gray-700 p-1 rounded-xl absolute top-1 right-1 text-[#70dbb8] font-bold">
                  {!copied ? (
                    <button
                      type="button"
                      onClick={async () => {
                        // When the button is clicked, copy the text to the clipboard
                        await navigator.clipboard.writeText(articleLink);
                        setCopied(true);
                      }}
                    >
                      Copy
                      <BiCopy className="inline text-lg ml-1" />
                    </button>
                  ) : (
                    <p>
                      Copied
                      <BiCheck className="inline text-green-400 text-2xl" />
                    </p>
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </>
  );
};

export default MyEditor;
