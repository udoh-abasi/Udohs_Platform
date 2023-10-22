import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../utils/axiosSetup";
import { profilePicURL } from "../utils/imageURLS";
import Loader from "./loader";
import { AiFillWarning } from "react-icons/ai";
import { BsFillArrowUpCircleFill } from "react-icons/bs";
import sanitizedData from "../utils/sanitizeDescription";
import {
  getDescription,
  getMonthAndYearOfDate,
} from "../utils/getDescriptionText";

const AllArticles = () => {
  const [order, setOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("title");

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
    const getAllArticles = async () => {
      try {
        setErrorLoading(false);
        setPageLoading(true);
        const response = await axiosClient.get(
          `/api/getAllArticles/${sortBy}/${order}`
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

    if (order && sortBy) {
      getAllArticles();
    }
  }, [order, sortBy]);

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

  return (
    <main className="min-h-screen pt-[90px] flex justify-center">
      <div className="flex-[0_1_750px]">
        {pageLoading && (
          <div className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] w-full h-full">
            <div className="fixed top-1/2 left-1/2 z-10">
              <Loader />
            </div>
          </div>
        )}

        <section className="my-8 font-bold border-b-4 border-[#81ba40] dark:border-[#70dbb8]  pb-8 px-4 flex justify-between min-[500px]:gap-16">
          <div className="max-[512px]:flex flex-col">
            <label
              htmlFor="filter"
              className="mr-4 text-lg min-[500px]:text-xl"
            >
              Sort by
            </label>

            <select
              value={sortBy}
              id="filter"
              onChange={(e) => {
                setSortBy(e.target.value);
              }}
              className="w-[100px] min-[500px]:text-lg rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1"
            >
              <option value="title">Title</option>
              <option value="user__first_name">Author</option>
              <option value="datePosted">Date</option>
              <option value="no_of_views">Views</option>
            </select>
          </div>

          <div className="max-[512px]:flex flex-col">
            <label
              htmlFor="filter"
              className="mr-4 text-lg min-[500px]:text-xl"
            >
              Order
            </label>

            <select
              id="filter"
              value={order}
              onChange={(e) => {
                setOrder(e.target.value);
              }}
              className="min-[500px]:w-[140px] w-[120px] min-[500px]:text-lg rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1"
            >
              <option value="asc">Ascending</option>
              <option value="des">Descending</option>
            </select>
          </div>
        </section>

        {articles.length ? (
          <section className="my-20 mt-10">
            <h2 className="text-center font-bold text-2xl uppercase mb-2">
              All articles
            </h2>

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
                        {getMonthAndYearOfDate(post.datePosted)}
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
                          ? profilePicURL + post.heroImage
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
          <div>
            {errorLoading && (
              <p className="text-red-500 text-sm text-center p-2 my-4">
                <AiFillWarning className="inline text-lg mr-1" />
                Something went wrong somewhere
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default AllArticles;
