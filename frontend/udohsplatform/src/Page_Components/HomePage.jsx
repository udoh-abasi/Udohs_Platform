import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../utils/axiosSetup";
import Loader from "./loader";
import { profilePicURL } from "../utils/imageURLS";
import getDayMonthAndYearOfDate from "../utils/getDayMonthAndYearOfDate";

const HomePage = () => {
  const [topArticles, setTopArticles] = useState([]);
  const [topArticlesLoading, setTopArticlesLoading] = useState(true);
  const [errorGettingTopArticles, setErrorGettingTopArticles] = useState(false);

  // This function sends a request to get the top six articles to display
  const getTopArticles = useCallback(async () => {
    try {
      setTopArticlesLoading(true);
      setErrorGettingTopArticles(false);

      const response = await axiosClient.get("/api/getTopArticlesForHomePage");
      if (response.status === 200) {
        setTopArticles(response.data);
      }
      setTopArticlesLoading(false);
    } catch {
      setTopArticlesLoading(false);
      setErrorGettingTopArticles(true);
    }
  }, []);

  useEffect(() => {
    getTopArticles();
  }, [getTopArticles]);

  return (
    <main>
      <div className="bg-[#a9bdbf] grid grid-cols-1 grid-rows-1 max-h-[660px] overflow-hidden">
        <section className="col-start-1 row-start-1">
          <picture className="opacity-[.7] min-[520px]:opacity-100">
            <source
              media="(min-width:600px)"
              srcSet="Frontend_to_use_1-large_840_height.webp"
            />

            <img
              src="Frontend_to_use_small.webp"
              alt="A purple jar on a block"
            />
          </picture>
        </section>

        <section className="col-start-1 row-start-1 mt-[50px] p-4 max-w-[500px] min-[360px]:mt-[80px] min-[375px]:mt-[120px] min-[800px]:mt-[100px] min-[1000px]:ml-20">
          <article className="flex-[1_1_300px] font-bold min-[375px]:mb-[40px] drop-shadow-[2px_2px_#000] text-white min-[600px]:text-black min-[600px]:drop-shadow-[2px_2px_#fff]">
            <p className="text-4xl min-[800px]:text-5xl">
              <strong>Be inquisitive.</strong>
            </p>
            <p className="text-xl">
              <span>Discover what great minds have to say about a topic.</span>
            </p>
          </article>

          <article className="font-bold mb-[40px] max-[374px]:mt-8 min-[420px]:mb-[60px] drop-shadow-[2px_2px_#000] text-white min-[600px]:text-black min-[600px]:drop-shadow-[2px_2px_#fff]">
            <p className="text-3xl min-[800px]:text-5xl mb-2">
              <strong>Are you a great mind?</strong>
            </p>

            <p className="text-xl">
              <span>
                Let the world hear you and realize how exceptionally
                intelligent, creative and insightful you are.
              </span>
            </p>
          </article>

          <p>
            <Link
              id="start_reading"
              to="/allArticles"
              className="relative inline-flex items-center justify-center py-3 pl-4 pr-12 overflow-hidden font-semibold text-black transition-all duration-150 ease-in-out rounded-2xl hover:pl-10 hover:pr-6 bg-gray-50 group w-full mb-4 min-[420px]:mb-8"
            >
              <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-black group-hover:h-full"></span>
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </span>
              <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </span>
              <span className="relative uppercase flex justify-center w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                Start reading
              </span>
            </Link>

            <Link
              to="/write"
              className="relative inline-flex items-center justify-center py-3 pl-4 pr-12 overflow-hidden font-semibold text-black transition-all duration-150 ease-in-out rounded-2xl hover:pl-10 hover:pr-6 bg-gray-50 group w-full"
            >
              <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-black group-hover:h-full"></span>
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </span>
              <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </span>
              <span className="relative uppercase flex justify-center w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                Start writing
              </span>
            </Link>
          </p>
        </section>
      </div>

      <section className="p-4 pb-0 mt-6">
        <h2 className="text-center text-lg font-bold uppercase">
          Trending on Udohs Platform
        </h2>

        {!errorGettingTopArticles && (
          <div className="flex flex-wrap justify-center gap-6 p-6 max-w-[1300px]">
            {topArticlesLoading && (
              <div className="flex-[1_1_100%] text-center grid place-items-center h-24">
                <Loader />
              </div>
            )}

            {topArticles.length ? (
              <>
                {topArticles.map((eachArticle) => {
                  const { post, poster } = eachArticle;
                  return (
                    <article key={post.id} className="flex-[1_1_300px]">
                      <Link to={`/account/${poster.id}`}>
                        <figure className="flex items-center">
                          <div className="w-[30px] h-[30px] rounded-full overflow-hidden mr-4">
                            <img
                              alt={`${poster.first_name} ${poster.last_name}`}
                              src={
                                poster.profile_pic
                                  ? profilePicURL + poster.profile_pic
                                  : "/Profile_Image_Placeholder-small.jpg"
                              }
                            />
                          </div>

                          <figcaption>
                            <p>
                              {poster.first_name} {poster.last_name}
                            </p>
                          </figcaption>
                        </figure>
                      </Link>

                      <Link to={`/read/${post.title}/${post.id}`}>
                        <div>
                          <p id="two-line-ellipsis" className="hover:underline">
                            <strong>{post.title}</strong>
                          </p>

                          <small>
                            {" "}
                            {getDayMonthAndYearOfDate(post.datePosted)}
                          </small>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </>
            ) : (
              <div></div>
            )}

            {/* <article className="flex-[1_1_300px]">
            <Link>
              <figure className="flex items-center">
                <div className="w-[30px] h-[30px] rounded-full overflow-hidden mr-4">
                  <img alt="" src="Profile_Image_Placeholder-small.jpg" />
                </div>

                <figcaption>
                  <p>
                    <small>Udoh Abasi</small>
                  </p>
                </figcaption>
              </figure>
            </Link>

            <Link>
              <div>
                <p id="two-line-ellipsis" className="hover:underline">
                  <strong>
                    Gender equality - Project Title Gender equality - Project
                    Title Gender equality - Project Title
                  </strong>
                </p>

                <small>August 10</small>
              </div>
            </Link>
          </article>

          <article className="flex-[1_1_300px]">
            <Link>
              <figure className="flex items-center">
                <div className="w-[30px] h-[30px] rounded-full overflow-hidden mr-4">
                  <img alt="" src="Profile_Image_Placeholder-small.jpg" />
                </div>

                <figcaption>
                  <p>
                    <small>Udoh Abasi</small>
                  </p>
                </figcaption>
              </figure>
            </Link>

            <Link>
              <div>
                <p id="two-line-ellipsis" className="hover:underline">
                  <strong>Gender equality - Project Title</strong>
                </p>

                <small>August 10</small>
              </div>
            </Link>
          </article>

          <article className="flex-[1_1_300px]">
            <Link>
              <figure className="flex items-center">
                <div className="w-[30px] h-[30px] rounded-full overflow-hidden mr-4">
                  <img alt="" src="Profile_Image_Placeholder-small.jpg" />
                </div>

                <figcaption>
                  <p>
                    <small>Udoh Abasi</small>
                  </p>
                </figcaption>
              </figure>
            </Link>

            <Link>
              <div>
                <p id="two-line-ellipsis" className="hover:underline">
                  <strong>
                    Gender equality - Project Title Gender equality - Project
                    Title Gender equality - Project Title
                  </strong>
                </p>

                <small>August 10</small>
              </div>
            </Link>
          </article>

          <article className="flex-[1_1_300px]">
            <Link>
              <figure className="flex items-center">
                <div className="w-[30px] h-[30px] rounded-full overflow-hidden mr-4">
                  <img alt="" src="Profile_Image_Placeholder-small.jpg" />
                </div>

                <figcaption>
                  <p>
                    <small>Udoh Abasi</small>
                  </p>
                </figcaption>
              </figure>
            </Link>

            <Link>
              <div>
                <p id="two-line-ellipsis" className="hover:underline">
                  <strong>
                    Gender equality - Project Title Gender equality - Project
                    Title Gender equality - Project Title
                  </strong>
                </p>

                <small>August 10</small>
              </div>
            </Link>
          </article>

          <article className="flex-[1_1_300px]">
            <Link>
              <figure className="flex items-center">
                <div className="w-[30px] h-[30px] rounded-full overflow-hidden mr-4">
                  <img alt="" src="Profile_Image_Placeholder-small.jpg" />
                </div>

                <figcaption>
                  <p>
                    <small>Udoh Abasi</small>
                  </p>
                </figcaption>
              </figure>
            </Link>

            <Link>
              <div>
                <p id="two-line-ellipsis" className="hover:underline">
                  <strong>
                    Gender equality - Project Title Gender equality - Project
                    Title Gender equality - Project Title
                  </strong>
                </p>

                <small>August 10</small>
              </div>
            </Link>
          </article> */}
          </div>
        )}
      </section>

      <div className="flex justify-center">
        <section className="p-4 flex-[0_1_600px] my-10">
          <Link
            to="/allArticles"
            className="relative inline-flex items-center justify-center py-3 pl-4 pr-12 overflow-hidden text-white dark:text-black transition-all duration-150 ease-in-out rounded-2xl hover:pl-10 hover:pr-6 bg-[#af4261] dark:bg-[#70dbb8] font-bold group w-full "
          >
            <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-black group-hover:h-full"></span>
            <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
              <svg
                className="w-5 h-5 text-white dark:text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </span>
            <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </span>
            <span className="relative uppercase flex justify-center w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white">
              All articles
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
