import { useState } from "react";
import { Link } from "react-router-dom";

const AllArticles = () => {
  const [postType, setPostType] = useState("mostRecent");

  return (
    <main className="min-h-screen pt-[90px] flex justify-center">
      <div className="max-w-[750px]">
        <section className="text-xl min-[500px]:text-2xl flex justify-between mb-4  p-4">
          <button
            className={`${
              postType == "mostRecent"
                ? "border-[#81ba40] dark:border-[#70dbb8] font-bold"
                : "border-b-transparent"
            } border-b-2 `}
            type="button"
            onClick={() => {
              setPostType("mostRecent");
            }}
          >
            Most Recent
          </button>

          <button
            className={`${
              postType == "mostViewed"
                ? "border-[#81ba40] dark:border-[#70dbb8]  font-bold"
                : "border-b-transparent"
            } border-b-2 `}
            type="button"
            onClick={() => {
              setPostType("mostViewed");
            }}
          >
            Most Viewed
          </button>
        </section>

        <section className="my-8 font-bold border-b-4 border-[#81ba40] dark:border-[#70dbb8]  pb-8 px-4">
          <label htmlFor="filter" className="mr-4 text-lg min-[500px]:text-xl">
            Sort by
          </label>

          <select
            id="filter"
            className="w-[100px] min-[500px]:text-lg rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </section>

        <section className="p-4 mt-8 items-center flex gap-8 max-[430px]:gap-0 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
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
                    Gender equality - Project Title Gender equality - Project
                    Title Gender equality - Project Title
                  </strong>
                </p>

                <p id="two-line-ellipsis">
                  Description of the post Description of the post Description of
                  the post Description of the post Description of the post
                  Description of the post Description of the post Description of
                  the post Description of the post Description of the post
                  Description of the post Description of the post Description of
                  the post Description of the post Description of the post
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
        </section>

        <section className="p-4 mt-8 items-center flex gap-8 max-[430px]:gap-0 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
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
                    Gender equality - Project Title Gender equality - Project
                    Title Gender equality - Project Title
                  </strong>
                </p>

                <p id="two-line-ellipsis">
                  Description of the post Description of the post Description of
                  the post Description of the post Description of the post
                  Description of the post Description of the post Description of
                  the post Description of the post Description of the post
                  Description of the post Description of the post Description of
                  the post Description of the post Description of the post
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
        </section>
      </div>
    </main>
  );
};

export default AllArticles;
