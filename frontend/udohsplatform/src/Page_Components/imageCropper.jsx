/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";

const ImageCropper = ({
  setShowImageCropperInterface,
  imageToCrop,
  setImageOnInput,
  setCroppedImageOnParent,
  setUploadCanvas,
}) => {
  const cropperRef = useRef(null);

  // This holds the cropped image, and displays it on the PREVIEW section
  const [croppedImage, setCroppedImage] = useState(null);

  const handleCrop = () => {
    const cropper = cropperRef.current.cropper;

    // Access the cropped image data and do something with it
    const croppedCanvas = cropper.getCroppedCanvas().toDataURL("image/webp");

    // Set the cropped image's data in a state
    if (croppedCanvas) {
      setCroppedImage(croppedCanvas);
    }
  };

  const handleZoomIn = () => {
    const cropper = cropperRef.current.cropper;
    cropper.zoom(0.1); // Adjust the zoom level as needed
  };

  const handleZoomOut = () => {
    const cropper = cropperRef.current.cropper;
    cropper.zoom(-0.1); // Adjust the zoom level as needed
  };

  // This state holds the blob image created in the useEffect below.
  // It was added because, initially, we used 'src = {URL.createObjectURL(imageToCrop)}', which caused too many re-render of this ImageCropper function
  const [theImage, setTheImage] = useState("");

  // This useEffect sets the image we got from the <input type=file /> (from the parent component, which is ProfilePage.jsx), in a state in this child component
  useEffect(() => {
    const image = URL.createObjectURL(imageToCrop);
    setTheImage(image);
  }, [imageToCrop]);

  // This function sets up the cropped image for upload to to the server, that is why we did not use '.toDataURL' method. We want to use '.toBlob' instead
  const handleCropAndUpload = () => {
    const cropper = cropperRef.current.cropper;
    const canvas = cropper.getCroppedCanvas();
    setUploadCanvas(canvas);
  };

  return (
    <div className="fixed top-0 left-0 z-10 w-full h-full">
      <div className="fixed rounded-3xl z-10 pt-14 bg-slate-300 dark:bg-black overflow-auto w-full h-auto max-h-full p-4 max-w-[800px] top-0 left-1/2 -translate-x-1/2 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
        <div className="flex items-center min-[800px]:items-start flex-col min-[800px]:flex-row min-[800px]:justify-center gap-8 ">
          <div>
            <Cropper
              ref={cropperRef}
              // src={URL.createObjectURL(imageToCrop)}   NOTE: Using this will cause too many re-renders, so use the below code
              src={theImage}
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "500px",
                maxHeight: "300px",
                overflow: "hidden",
              }}
              //aspectRatio={16 / 9} // Set the aspect ratio (optional)
              guides={false} // Show cropping guides inside the cropBox (optional)
              crop={handleCrop} // Callback function when cropping is done (optional)
              zoomOnTouch={false} // Prevent zooming in or out by pinching the image, on touch devices
              zoomOnWheel={false} // Prevent zooming in or out when the mouse is placed on the image and scrolled up or down
              viewMode={1} // Set view mode to restrict cropping to the specified aspect ratio
              aspectRatio={1 / 1} // Set aspect ratio to 1:1 for a square image
              autoCropArea={1} // Crop the entire image within the specified aspect
              dragMode="move" // This makes sure the image moves when dragged, instead of drawing a cropped area
              cropBoxResizable={false} // Prevents the user from resizing the cropBox. This ensures the cropped area is fixed
            />

            <div className="mt-4 flex justify-center gap-4 min-[500px]:gap-16 min-[500px]:text-lg font-bold">
              <button
                type="button"
                onClick={handleZoomIn}
                className="ring-2 ring-[#81ba40] dark:ring-[#70dbb8] flex items-center px-4 py-1 rounded-lg hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear"
              >
                Zoom in <AiOutlineZoomIn className="ml-2" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="ring-2 ring-[#81ba40] dark:ring-[#70dbb8] flex items-center px-4 py-1 rounded-lg hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear"
              >
                Zoom out <AiOutlineZoomOut className="ml-2" />
              </button>
            </div>
          </div>

          <div className="mt-4 min-[800px]:mt-0">
            <h2 className="uppercase text-2xl font-bold mb-2">Preview</h2>
            {croppedImage && (
              <img
                src={croppedImage}
                alt="Cropped"
                className="rounded-full w-[150px] h-[150px]"
              />
            )}
          </div>
        </div>

        <div className="mt-16 flex gap-4 min-[500px]:gap-16 justify-center">
          <button
            type="button"
            onClick={() => {
              setShowImageCropperInterface(); // Turn off the picture cropping interface
              setImageOnInput(); // Set the image in the input field to an empty string. This was added as a fix, so that if the same picture is selected twice in a row, the picture cropping interface will still be triggered
              setCroppedImageOnParent(croppedImage); // This sends the cropped image to the 'Edit profile' interface, so it can be used instead of the original picture
              handleCropAndUpload();
            }}
            className="px-4 w-[150px] min-[500px]:text-xl uppercase font-bold rounded-xl rounded-tl-xl py-2 ring-4 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => {
              setShowImageCropperInterface();
              setImageOnInput();
            }}
            className="px-4 font-bold rounded-xl rounded-tl-xl py-2 ring-2 ring-red-500 hover:bg-red-500 hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
