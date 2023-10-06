import EditorJS from "@editorjs/editorjs";
import { useEffect, useRef, useState } from "react";
import Loader from "./loader";
import { BsPencilSquare } from "react-icons/bs";
import { VscPreview } from "react-icons/vsc";
import ImageCropper_WritePage from "./imageCropper_WritePage";
import editorJSConfiguration from "../utils/editorJSConfig";
import { AiOutlineClose, AiOutlineFileDone } from "react-icons/ai";
import { FiImage } from "react-icons/fi";
import Preview from "./Preview";

/*
 Documentation for EditorJS - https://github.com/editor-js/awesome-editorjs
*/

const MyEditor = () => {
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

  // This useRef just makes sure the user makes up to 10 changes before showing the popup message that says 'Saved to draft'
  const noOfChanges = useRef(0);

  // This makes sure that the popup message that says 'Saved to draft' appears just once
  const showSavedToDraft = useRef(true);

  // This function shows/hides the popup message that says 'Saved to draft'
  const showSavedToDraftMessage = () => {
    const thePopUp = document.querySelector("#messagePopUp");
    thePopUp.classList.remove("hidden");

    setTimeout(() => {
      thePopUp.classList.remove("-bottom-36");
      thePopUp.classList.add("bottom-16");
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

  // Calls the editor.save() to save the editorjs data
  const saveEditor = () => {
    if (theEditor) {
      theEditor
        .save()
        .then((outputData) => {
          console.log("Article data: ", outputData);
        })
        .catch((error) => {
          console.log("Saving failed: ", error);
        });
    }
  };

  const showCroppedImage = () => {
    if (croppedImage) {
      return croppedImage;
    }
  };

  return (
    <main className="min-h-screen pt-20">
      {editorLoading && (
        <div className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] w-full h-full">
          <div className="fixed top-1/2 left-1/2 z-10">
            <Loader />
          </div>
        </div>
      )}

      <div className="flex justify-center">
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

      <section className={`${viewMode === "write" ? "block" : "hidden"}`}>
        <form className="bg-white text-black px-4 min-[645px]:px-14 flex justify-center">
          <div className="flex-[0_1_650px] flex flex-col-reverse relative mt-8">
            <input
              type="text"
              required
              placeholder=" "
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 rounded-xl bg-white ring-2 ring-[#81ba40] p-1 peer"
            />

            <label
              htmlFor="title"
              className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
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
                      Please add a hero image
                    </h2>
                    <p className="text-justify">
                      This will not appear on your story. It will only appear on
                      our &#8220;All Articles&#8221; page, to make your story
                      more inviting to readers.
                    </p>{" "}
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
                      {croppedImage ? "Change hero image" : "Add a hero image"}
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

        {!showAddHero && (
          <div className="flex justify-center mb-16 mt-6 p-4">
            <button
              type="submit"
              disabled={false}
              onClick={() => {
                setShowAddHero(true);
              }}
              className="w-full max-w-[400px] font-bold uppercase relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
              <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md "></span>
              <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 "></span>
              <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center">
                {false ? <Loader /> : <>Post</>}
              </span>
            </button>
          </div>
        )}

        {showAddHero && (
          <div className="flex justify-center mb-16 mt-6 p-4">
            <button
              type="submit"
              disabled={false}
              onClick={() => {
                saveEditor();
              }}
              className="w-full max-w-[400px] font-bold uppercase relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
              <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md "></span>
              <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 "></span>
              <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center">
                {false ? <Loader /> : <>Post now</>}
              </span>
            </button>
          </div>
        )}

        <div
          id="messagePopUp"
          className="-bottom-36 hidden rounded-2xl fixed font-bold z-50 max-w-[400px] right-0 w-full p-4 bg-[#020617] -translate-y-1/2 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] transition-all duration-500 ease-linear"
        >
          <p className="text-center text-green-400 flex flex-col text-sm">
            <span className="text-base">
              {" "}
              <AiOutlineFileDone className="inline text-3xl" /> Saved to draft!
            </span>{" "}
            <span className="text-white">
              {" "}
              You can exit this page, come back later and you will pick up from
              where you left off
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

      <section className={`${viewMode === "preview" ? "block" : "hidden"}`}>
        <Preview theData={draftData} title={title} />
      </section>
    </main>
  );
};

export default MyEditor;
