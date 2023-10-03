import { Link } from "react-router-dom";
import { theData } from "../utils/editorJSConfig";
import convertEditorJSDataToHTML from "./ConvertEditorJSDataToHTML";

const Read = () => {
  const has_articles = true;

  return (
    <main className="min-h-screen pt-[5rem] p-4 max-w-[700px] mx-auto">
      <h1 className="text-center font-bold text-2xl min-[500px]:text-3xl m-6">{`This is the title of the article`}</h1>
      <Link className="my-6 block">
        <figure className="flex items-center ">
          <div className="rounded-full overflow-hidden mr-4 flex-[0_0_40px] h-[40px]">
            <img alt="Udoh Abasi" src="/Profile_Image_Placeholder-small.jpg" />
          </div>

          <figcaption>
            <p id="one-line-ellipsis">Udoh Abasi Udoh AbasiUdoh Abasi</p>
          </figcaption>
        </figure>

        <small>Published: August 10</small>
      </Link>

      {convertEditorJSDataToHTML(theData)}

      <figure className="pt-8">
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden mr-4">
          <img alt="Udoh Abasi" src="/Profile_Image_Placeholder-small.jpg" />
        </div>

        <figcaption className="mt-4">
          <p className="my-4">
            Written by <strong> Udoh Abasi</strong>
          </p>
          <p>About Udoh Abasi will go here</p>
        </figcaption>
      </figure>

      <section className="mt-20">
        <h2 className="text-center font-bold text-2xl uppercase mb-2">
          More from Udoh Abasi
        </h2>

        {has_articles ? (
          <div className="flex justify-center">
            <div className="max-w-[750px]">
              <section className="p-4 mt-8 items-center flex gap-8 max-[730px]:gap-0 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
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

                <Link className="w-[100px] h-[134px] flex-[0_0_100px] min-[550px]:flex-[0_0_150px] min-[730px]:flex-[0_0_200px]">
                  <img
                    src="/Hero photo-small.webp"
                    alt="Hero image"
                    className=" h-full w-full object-cover"
                  />
                </Link>
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

export default Read;
