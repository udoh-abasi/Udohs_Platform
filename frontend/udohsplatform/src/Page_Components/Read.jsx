import { Link, useNavigate, useParams } from "react-router-dom";
import convertEditorJSDataToHTML from "./ConvertEditorJSDataToHTML";
import { useEffect, useState } from "react";
import Loader from "./loader";
import axiosClient from "../utils/axiosSetup";
import { profilePicURL } from "../utils/imageURLS";
import sanitizedData from "../utils/sanitizeDescription";
import {
  getDescription,
  getMonthAndYearOfDate,
} from "../utils/getDescriptionText";

const Read = () => {
  const { title, articleID } = useParams();
  const navigate = useNavigate();

  // This stores the article's writer
  const [articleAuthor, setArticleAuthor] = useState({});

  // This stores other articles written by this same author
  const [otherArticles, setOtherArticles] = useState([]);

  // This stores the main article requested by the user
  const [article, setArticle] = useState({});

  const [pageLoading, setPageLoading] = useState(true);

  const [articleByOtherPoster, setArticleByOtherPoster] = useState([]);

  // This sends a request to get the article
  useEffect(() => {
    const getArticle = async () => {
      setPageLoading(true);
      try {
        const response = await axiosClient.get(
          `/api/singleArticle/${title}/${articleID}`
        );
        if (response.status === 200) {
          const data = response.data;

          const {
            requestedArticle,
            otherArticles,
            articlePoster,
            articleByOtherPoster,
          } = data;

          // This 'articleByOtherPoster' is an array of objects. Each object has the poster and the article the person posted
          setArticleByOtherPoster(articleByOtherPoster);
          setArticleAuthor(articlePoster);
          setArticle(requestedArticle);
          setOtherArticles(otherArticles);
          setPageLoading(false);
        }
      } catch {
        navigate("/read");
      }
    };

    if (title && articleID) {
      getArticle();
    }
  }, [title, articleID, navigate]);

  const [dateOfPost, setDateOfPost] = useState("");

  useEffect(() => {
    if (article) {
      const postDate = new Date(article.datePosted);

      setDateOfPost(
        `${postDate.toLocaleString("en-US", {
          month: "long",
        })}, ${postDate.getFullYear()}`
      );
    }
  }, [article]);

  return (
    <main className="min-h-screen pt-[5rem] p-4 max-w-[700px] mx-auto">
      {pageLoading ? (
        <div className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] w-full h-full">
          <div className="fixed top-1/2 left-1/2 z-10">
            <Loader />
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-center font-bold text-2xl min-[500px]:text-3xl m-6">
            {article.title}
          </h1>

          <div className="my-6">
            <Link to={`/account/${articleAuthor.id}`} className="block">
              <figure className="flex items-center ">
                <div className="rounded-full overflow-hidden mr-4 flex-[0_0_40px] h-[40px]">
                  <img
                    alt={`${articleAuthor.first_name} ${articleAuthor.last_name}`}
                    src={`${
                      articleAuthor.profile_pic
                        ? profilePicURL + articleAuthor.profile_pic
                        : "/Profile_Image_Placeholder-small.jpg"
                    }`}
                  />
                </div>

                <figcaption>
                  <p id="one-line-ellipsis">
                    {articleAuthor.first_name} {articleAuthor.last_name}
                  </p>
                </figcaption>
              </figure>

              <small>Published: {dateOfPost}</small>
            </Link>
            {article.edited && <small>Edited</small>}
          </div>

          {convertEditorJSDataToHTML(JSON.parse(article.theMainArticle))}

          <Link to={`/account/${articleAuthor.id}`}>
            <figure className="pt-8">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden mr-4">
                <img
                  alt={`${articleAuthor.first_name} ${articleAuthor.last_name}`}
                  src={`${
                    articleAuthor.profile_pic
                      ? profilePicURL + articleAuthor.profile_pic
                      : "/Profile_Image_Placeholder-small.jpg"
                  }`}
                />
              </div>

              <figcaption className="mt-4">
                <p className="my-4">
                  Written by{" "}
                  <strong>
                    {articleAuthor.first_name} {articleAuthor.last_name}
                  </strong>
                </p>
                <p className="text-justify">{articleAuthor.bio}</p>
              </figcaption>
            </figure>
          </Link>

          {Object.keys(otherArticles).length ? (
            <section className="my-20">
              <h2 className="text-center font-bold text-2xl uppercase mb-2">
                More from {articleAuthor.first_name}
              </h2>

              {otherArticles.map((eachArticle) => (
                <div key={eachArticle.id} className="flex justify-center">
                  <div className="flex-[0_1_750px]">
                    <section className="p-4 mt-8 items-center justify-between flex gap-8 max-[730px]:gap-2 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
                      <Link to={`/read/${eachArticle.title}/${eachArticle.id}`}>
                        <div className="hover:underline">
                          <p id="one-line-ellipsis" className="mb-2">
                            <strong>{eachArticle.title}</strong>
                          </p>

                          <p id="two-line-ellipsis">
                            <span
                              dangerouslySetInnerHTML={sanitizedData(
                                getDescription(eachArticle),
                                []
                              )}
                            />
                          </p>
                        </div>
                        <small className="mt-4 -mb-4 block">
                          {getMonthAndYearOfDate(eachArticle.datePosted)}
                        </small>
                      </Link>

                      <Link
                        to={`/read/${eachArticle.title}/${eachArticle.id}`}
                        className="w-[100px] h-[134px] flex-[0_0_100px] min-[550px]:flex-[0_0_150px] min-[730px]:flex-[0_0_200px]"
                      >
                        <img
                          src={
                            eachArticle.heroImage
                              ? profilePicURL + eachArticle.heroImage
                              : "/Hero photo-small.webp"
                          }
                          alt="Hero image"
                          className=" h-full w-full object-cover"
                        />
                      </Link>
                    </section>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <span></span>
          )}

          {Object.keys(articleByOtherPoster).length ? (
            <section className="my-20">
              <h2 className="text-center font-bold text-2xl uppercase mb-2">
                You may also like
              </h2>

              {articleByOtherPoster.map((eachArticle) => {
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

                          <p id="two-line-ellipsis">{getDescription(post)}</p>
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
            </section>
          ) : (
            <span></span>
          )}
        </>
      )}
    </main>
  );
};

export default Read;
