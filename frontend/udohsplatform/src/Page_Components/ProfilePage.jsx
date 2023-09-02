import { MdOutlineDeleteForever, MdWorkspacePremium } from "react-icons/md";
import { Link } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const about = "q";
  const premium_member = true;
  const has_articles = true;

  const id = "id";

  // This tracks when the 'undo' button is clicked, to undo a delete of an article
  const [articleDeleteUndone, setArticleDeleteUndone] = useState(false);

  // This checks if the undo delete has popped up or not, so that we can use a useEffect to hide it after 5 seconds
  // const [undoDeletePopUp, setUndoDeletePopUp] = useState(false);

  // When the delete button on an article is clicked, these functions run to hide or show the the confirmation buttons
  const hideDeleteConfirmation = (id) => {
    document.querySelector("#" + id).classList.add("hidden");
  };

  const showDeleteConfirmation = (id) => {
    document.querySelector("#" + id).classList.remove("hidden");
  };

  // This useEffect hides the confirmDelete box if it is open.
  // Notice that it is the class named 'confirmDelete' that is selected. This will make it possible to select all the elements in the list
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

  return (
    <main className="min-h-screen py-[90px] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-[#a1d06d] via-[#ffffff] to-[#ffffff] dark:from-[#a1d06d] dark:via-[#242424] dark:to-[#242424]">
      <section className="p-4">
        <figure className="flex items-center flex-col gap-4">
          <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
            <img alt="" src="Profile_Image_Placeholder-small.jpg" />
          </div>

          <figcaption className="text-xl text-center">
            <p className="mb-3">
              <strong> Udoh Abasi </strong>
            </p>
            <small>Udohs Platform member since August 2023</small>
            {premium_member && (
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
        >
          Edit profile
        </button>
      </div>

      <section className="p-4">
        <h2 className="text-center font-bold text-2xl uppercase mb-2">About</h2>

        {about ? (
          <div className="flex justify-center">
            <p className="text-justify max-w-[480px]">
              Writing about a topic can vary widely depending on what you
              writing about and the purpose of your writing. Whether you working
              on an essay, article, report, story, or any other form of written
              content, the following steps can help guide your writing process
            </p>
          </div>
        ) : (
          <p className="text-center italic">
            Udoh Abasi has not added an <q>About Me</q> section yet.
          </p>
        )}
      </section>

      <section className="mt-4">
        <h2 className="text-center font-bold text-2xl uppercase mb-2">
          Articles by Udoh Abasi
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
                          src="Profile_Image_Placeholder-small.jpg"
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
                    src="Hero photo-small.webp"
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

                            const timeOutID = setTimeout(hideUndoPopup, 5000);
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
          <p className="text-center italic">Udoh Abasi has no articles yet.</p>
        )}
      </section>
    </main>
  );
};

export default ProfilePage;
