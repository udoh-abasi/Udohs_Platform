import EditorJS from "@editorjs/editorjs";
import { useEffect, useRef, useState } from "react";
import Loader from "./loader";
import { BsPencilSquare } from "react-icons/bs";
import ImageCropper_WritePage from "./imageCropper_WritePage";
import editorJSConfiguration, { theData } from "../utils/editorJSConfig";

/*
 Documentation for EditorJS - https://github.com/editor-js/awesome-editorjs
*/

const MyEditor = () => {
  const [editorLoading, setEditorLoading] = useState(true);
  const [theEditor, setTheEditor] = useState(null);

  // This stores the format of the image the user uploaded (from their device).
  // In cropper.js, the cropped image is always larger in size than the original image. So, to fix this, we have to use the image's format when using ' uploadCanvas.toBlob'
  const [imageFormat, setImageFormat] = useState("");

  const [showImageCropperInterface, setShowImageCropperInterface] =
    useState(false);
  const [imageToCrop, setImageToCrop] = useState("");

  const [uploadCanvas, setUploadCanvas] = useState(null);

  // Used to fix issue of the editor rendering twice, because strict-mode is set to true
  const isReady = useRef(false);

  useEffect(() => {
    if (!isReady.current) {
      const editor = new EditorJS(editorJSConfiguration());
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

  return (
    <main className="min-h-screen pt-20">
      {editorLoading && (
        <div className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] w-full h-full">
          <div className="fixed top-1/2 left-1/2 z-10">
            <Loader />
          </div>
        </div>
      )}

      <section>
        <h1 className="text-center font-bold text-2xl uppercase mb-8 flex items-center justify-center">
          Write <BsPencilSquare className="ml-2" />
        </h1>

        <div
          id="editorJS"
          className="bg-white text-black p-4 min-[645px]:px-14"
        ></div>

        {showImageCropperInterface && (
          <ImageCropper_WritePage
            // Send the image that we want to crop
            imageToCrop={imageToCrop}
            // Hide this 'ImageCropper' interface
            setShowImageCropperInterface={() => {
              setShowImageCropperInterface(false);
            }}
            // Clear the <input type="file" /> field (fix for profile image page)
            setImageOnInput={() => {}}
            // Get the cropped image
            setCroppedImageOnParent={(image) => {
              image;
            }}
            // The image canvas that will be manipulated and then have the image sent to the server
            setUploadCanvas={(canvas) => {
              setUploadCanvas(canvas);
            }}
            // The format of the image (whether image/webp, image/jpeg etc)
            imageFormat={imageFormat}
          />
        )}

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
              {false ? <Loader /> : <>Post</>}
            </span>
          </button>
        </div>
      </section>

      <section>{/* <Output data={theData} /> */}</section>
    </main>
  );
};

export default MyEditor;
