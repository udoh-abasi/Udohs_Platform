/* eslint-disable react/prop-types */
import EditorJS from "@editorjs/editorjs";
import { useEffect, useRef, useState } from "react";
import Loader from "./loader";
import { BsPencilSquare } from "react-icons/bs";
import { VscPreview } from "react-icons/vsc";
import ImageCropper_WritePage from "./imageCropper_WritePage";
import editorJSConfiguration from "../utils/editorJSConfig";
import { AiFillWarning } from "react-icons/ai";
import { BiSolidErrorAlt } from "react-icons/bi";
import { FiImage } from "react-icons/fi";
import Preview from "./Preview";
import axiosClient from "../utils/axiosSetup";
import { profilePicURL } from "../utils/imageURLS";

/*
 Documentation for EditorJS - https://github.com/editor-js/awesome-editorjs
*/

const EditArticle = ({
  theTitle,
  theMainArticle,
  theHeroImage,
  articleID,
  hidEditArticle,
  setUserArticles,
}) => {
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

  const [title, setTitle] = useState(theTitle);

  const [viewMode, setViewMode] = useState("write");

  // Used to fix issue of the editor rendering twice, because strict-mode is set to true
  const isReady = useRef(false);

  // This stores the data in that will show in the preview section

  const [previewData, setPreviewData] = useState(theMainArticle);

  // This disables the 'Post Now' button
  const [postNowDisable, setPostNowDisable] = useState(true);

  // This controls when the user clicks on 'Post Now' button, and the backend is currently processing the post
  const [postNowLoading, setPostNowLoading] = useState(false);

  const [errorPosting, setErrorPosting] = useState(false);

  // This checks if the user has already posted an article with that title
  const [titleAlreadyExist, setTitleAlreadyExist] = useState(false);

  //   useEffect(() => {
  //     setPreviewData(theMainArticle);
  //   }, [theMainArticle]);

  // Initialize the editorJS
  useEffect(() => {
    if (!isReady.current) {
      const editor = new EditorJS(
        editorJSConfiguration(theMainArticle, setPreviewData)
      );
      setTheEditor(editor);

      // Check when the editor is ready, then stop the loading

      editor.isReady.then(() => {
        setEditorLoading(false);
      });
    }

    isReady.current = true;
  }, [theMainArticle]);

  // Calls the editor.save() to save the editorjs data and send to the backend
  const saveEditor = () => {
    if (theEditor && uploadCanvas) {
      setPostNowLoading(true);
      setPostNowDisable(true);
      setErrorPosting(false);
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
              }
              setPostNowLoading(false);
              setPostNowDisable(false);
            } catch (error) {
              if (error.request.status === 406) {
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

  // This runs to show either the cropped image or the Hero Image on the 'Hero Image' field
  const [imageOnHeroImageField, setImageOnHeroImageField] = useState(
    profilePicURL + theHeroImage
  );

  // This useEffect
  useEffect(() => {
    if (croppedImage) {
      setImageOnHeroImageField(croppedImage);
    }
  }, [croppedImage]);

  // This useEffect makes sure the 'Post Now' button is disabled
  //   useEffect(() => {
  //     if (title && previewData && previewData.blocks.length !== 0) {
  //       setPostNowDisable(false);
  //     } else {
  //       setPostNowDisable(true);
  //     }
  //   }, [title, previewData]);

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
    try {
      if (writePreviewId) {
        writePreviewId.classList.remove("top-16");
        writePreviewId.classList.add("-top-36");
      }
    } catch {
      //Do nothing
    }
  };

  const showWritePreview = () => {
    const writePreviewId = document.querySelector("#WritePreview");
    try {
      if (writePreviewId) {
        writePreviewId.classList.remove("-top-36");
        writePreviewId.classList.add("top-16");
      }
    } catch {
      //Do nothing
    }
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
          className="flex justify-center w-full top-16 bg-white dark:bg-[#020617] z-[5] transition-all duration-300 ease-linear"
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
          className={`${viewMode === "write" ? "block" : "hidden"} t-28`}
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

          <>
            <hr className="mb-8 dark:bg-transparent dark:h-0 bg-[#020617] h-[3px] max-w-[650px] mx-auto" />
            <h1 className="text-center font-bold text-xl">Hero Image</h1>
            <div className="flex justify-center">
              <div className="flex-[0_1_650px] p-4">
                <div className="flex justify-center">
                  <div className="w-[200px] h-[200px] overflow-hidden">
                    <img alt="" src={imageOnHeroImageField} />
                  </div>
                </div>

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
                    <span>Change hero image</span>
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

          <div className="mb-16 mt-6 p-4">
            <div className="flex justify-center mb-8">
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
                  {postNowLoading ? <Loader /> : <>Save Changes</>}
                </span>
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  hidEditArticle();
                  const theBody = document.querySelector("body");
                  theBody.classList.remove("overflow-hidden");
                  theBody.classList.remove("h-full");
                }}
                className="px-4 font-bold rounded-xl rounded-tl-xl py-2 ring-2 ring-red-500 hover:bg-red-500 hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
              >
                Cancel
              </button>
            </div>
          </div>

          {errorPosting && (
            <p className="p-4 text-red-500 text-center font-bold -mt-16 text-sm">
              <BiSolidErrorAlt className="inline text-2xl" /> Something went
              wrong and we could not post your story. Please try again later
            </p>
          )}

          {titleAlreadyExist && (
            <p className="text-sm max-[370px]:text-xs text-red-500 mb-8 text-center -mt-16 p-3">
              <AiFillWarning className="text-2xl max-[370px]:text-lg inline" />
              You already have an article with this title.
            </p>
          )}
        </section>

        <section className={`${viewMode === "preview" ? "block" : "hidden"}`}>
          <Preview theData={previewData} title={title} />
        </section>
      </main>
    </>
  );
};

export default EditArticle;
