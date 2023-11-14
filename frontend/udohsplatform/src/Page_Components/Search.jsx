import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../utils/axiosSetup";
import { profilePicURL } from "../utils/imageURLS";
import Loader from "./loader";
import { AiFillWarning } from "react-icons/ai";
import { BsFillArrowUpCircleFill } from "react-icons/bs";
import sanitizedData from "../utils/sanitizeDescription";
import { getDescription } from "../utils/getDescriptionText";
import getDayMonthAndYearOfDate from "../utils/getDayMonthAndYearOfDate";

const Search = () => {
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("searchQuery");

  // This controls if the page is loading (a request is sent to get the initial data)
  const [pageLoading, setPageLoading] = useState(true);

  // Controls if there was an error loading the initial data (on page load)
  const [errorLoading, setErrorLoading] = useState(false);

  // This checks if the next set of 10 contents are loading
  const [nextContentLoading, setNextContentLoading] = useState(false);
  const [errorGettingNextPage, setErrorGettingNextPage] = useState(false);

  // This holds all the articles that's currently displayed on the page
  const [articles, setArticles] = useState([]);

  // This holds the URL link to the next 10 articles
  const [nextPageLink, setNextPageLink] = useState(null);

  // On page load, this function sends a request to get the initial articles
  useEffect(() => {
    const searchForArticle = async () => {
      try {
        setErrorLoading(false);
        setPageLoading(true);
        const response = await axiosClient.get(
          `/api/search?search=${searchQuery}`
        );

        if (response.status === 200) {
          const data = response.data;
          setArticles(data.results);
          setNextPageLink(data.next);

          setPageLoading(false);
        }
      } catch {
        setErrorLoading(true);
        setPageLoading(false);
      }
    };

    if (searchQuery) {
      searchForArticle();
    } else {
      setPageLoading(false);
    }
  }, [searchQuery]);

  // This function gets the next ten articles to populate the page
  const getNextPage = useCallback(async () => {
    if (nextPageLink && !nextContentLoading) {
      try {
        setErrorGettingNextPage(false);
        setNextContentLoading(true);

        const response = await axiosClient.get(nextPageLink);
        if (response.status === 200) {
          const data = await response.data;

          // Update the article with the new set of articles. NOTE: If you use articles.push here, you will run into errors as the scroll event listener causes many calls to this function when the user gets to the bottom of the page
          setArticles([...articles, ...data.results]);

          // Update the link to get the next 10 articles
          setNextPageLink(data.next);
          setNextContentLoading(false);
        }
      } catch (e) {
        setErrorGettingNextPage(true);
        setNextContentLoading(false);
      }
    }
  }, [nextContentLoading, nextPageLink, articles]);

  // This useEffect implements the infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      // NOTE: scrollTop - is how far you are from the top of the window (so, when you scroll to the very top of the page, it is zero)
      // clientHeight - is the actual height of the screen (the viewport, i.e visible area)
      // scrollHeight - is the entire height of the page (including non-visible area)
      // So, scrollTop (when the user scrolls to the bottom page) + clientHeight === scrollHeight

      const { scrollTop, clientHeight, scrollHeight } =
        document.documentElement;

      // Check if the item is close to the bottom. The '700' here means, 'check if the user has scrolled 700px away from the bottom'
      if (scrollTop + clientHeight >= scrollHeight - 700) {
        getNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [getNextPage]);

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

  // This useState and useEffect checks if the searchTerm was either not provided, or invalid or an empty result was gotten from the backend
  const [invalidSearchTerm, setInvalidSearchTerm] = useState(false);
  useEffect(() => {
    setInvalidSearchTerm(
      (!pageLoading && searchParams.has("searchQuery")) ||
        (!pageLoading && !searchParams.has("searchQuery"))
    );
  }, [pageLoading, searchParams]);

  return (
    <>
      <main className="min-h-screen pt-[90px] flex justify-center">
        <div className="flex-[0_1_750px]">
          {pageLoading && (
            <div className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] w-full h-full">
              <div className="fixed top-1/2 left-1/2 z-10">
                <Loader />
              </div>
            </div>
          )}

          <h2 className="text-left font-bold text-xl mb-2 px-4 min-[500px]:text-2xl">
            <span className="text-gray-400"> Search Results for </span>
            <span className="italic">{searchQuery}</span>
          </h2>

          {articles.length ? (
            <section className="my-20 mt-10">
              {articles.map((eachArticle) => {
                const { post, poster } = eachArticle;
                return (
                  <section
                    key={post.id}
                    className="p-4 mt-8 items-center justify-between flex gap-8 max-[730px]:gap-2 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                  >
                    <div>
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
                              <small>
                                {poster.first_name} {poster.last_name}
                              </small>
                            </p>
                          </figcaption>
                        </figure>
                      </Link>

                      <Link to={`/read/${post.title}/${post.id}`}>
                        <div className="hover:underline">
                          <p id="one-line-ellipsis" className="my-2">
                            <strong>{post.title}</strong>
                          </p>

                          <p id="two-line-ellipsis">
                            <span
                              dangerouslySetInnerHTML={sanitizedData(
                                getDescription(post),
                                []
                              )}
                            />
                          </p>
                        </div>
                        <small className="mt-4 block">
                          {getDayMonthAndYearOfDate(post.datePosted)}
                        </small>
                      </Link>
                    </div>

                    <Link
                      to={`/read/${post.title}/${post.id}`}
                      className="w-[100px] h-[134px] flex-[0_0_100px] min-[550px]:flex-[0_0_150px] min-[730px]:flex-[0_0_200px]"
                    >
                      <img
                        src={
                          post.heroImage
                            ? post.heroImage
                            : "/Hero photo-small.webp"
                        }
                        alt="Hero image"
                        className=" h-full w-full object-cover"
                      />
                    </Link>
                  </section>
                );
              })}

              <div id="seeMore">
                {nextPageLink && (
                  <div className="flex justify-center mt-10">
                    <button
                      type="button"
                      onClick={() => {
                        if (nextPageLink) {
                          getNextPage();
                        }
                      }}
                      disabled={nextContentLoading}
                      className="px-4 flex justify-center items-center w-[200px] font-bold rounded-br-xl rounded-tl-xl py-2 ring-4 ring-[#81ba40] dark:ring-[#70dbb8] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                    >
                      {nextContentLoading ? (
                        <Loader />
                      ) : (
                        <span className="flex justify-center">See more</span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {errorGettingNextPage && (
                <p className="text-red-500 text-sm text-center p-2 my-4">
                  <AiFillWarning className="inline text-lg mr-1" />
                  Something went wrong and we could not load more
                </p>
              )}

              {previousScrollPosition > 200 && scrollDir === "up" && (
                <a
                  href="#"
                  className="flex items-center flex-col fixed bottom-14 z-50 right-2 text-black dark:text-[#f3ec78] font-bold"
                >
                  <BsFillArrowUpCircleFill className="text-3xl" /> To Top
                </a>
              )}
            </section>
          ) : (
            <>
              {errorLoading ? (
                <p className="text-red-500 text-sm text-center p-2 my-4">
                  <AiFillWarning className="inline text-lg mr-1" />
                  Something went wrong somewhere
                </p>
              ) : (
                invalidSearchTerm && (
                  <div className="p-4">
                    <h3 className="font-bold pb-4">
                      Sorry, we could not find any result. We recommend you try
                      any of the following:
                    </h3>

                    <ul className="list-outside list-disc ml-5">
                      <li>Make sure all words are spelled correctly.</li>
                      <li>Try different keywords.</li>
                      <li>Try more general keywords.</li>
                    </ul>

                    <div className="flex flex-col items-center overflow-hidden mt-3">
                      <div className="max-w-[250px] min-[400px]:max-w-[300px] min-[550px]:max-w-[400px] overflow-hidden">
                        <p className="min-[650px]:flex flex justify-center items-center uppercase font-bold my-6 before:mr-2 before:h-[1px] before:w-[800px] before:bg-gray-400 after:h-[1px] after:w-[800px]  after:bg-gray-400 after:ml-2">
                          or
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center -mt-10">
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
                            See All articles
                          </span>
                        </Link>
                      </section>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Search;
