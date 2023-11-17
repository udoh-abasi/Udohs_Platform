import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <>
      <title>Page not found - udohsplatform</title>
      <meta name="description" content="The requested Page is not found" />

      <main className="min-h-screen pt-[90px] flex justify-center">
        <section className="p-4 max-w-[700px]">
          <p className="text-center text-[10rem] font-bold flex items-center justify-center max-[412px]:text-[6rem] gap-3 min-[600px]:gap-12">
            <span>4</span>
            <img
              src="/404_image.webp"
              alt="A cat viewing a tablet"
              className="inline rounded-full w-[120px] h-[120px] max-[412px]:w-[70px] max-[412px]:h-[70px] max-[412px]:mt-3 mt-5 ring-8 ring-[#213547] dark:ring-white"
            />
            <span>4</span>
          </p>
          <p className="text-center">
            Oops! We could not find the page you were looking for.
          </p>

          <p className="mt-16">
            <Link
              id="start_reading"
              to="/allArticles"
              className="relative inline-flex items-center justify-center py-3 pl-4 pr-12 overflow-hidden font-semibold transition-all duration-150 ease-in-out rounded-2xl hover:pl-10 hover:pr-6  text-white dark:text-black bg-[#af4261] dark:bg-[#70dbb8] group w-full mb-4 min-[420px]:mb-8"
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
                Start reading
              </span>
            </Link>

            <Link
              to="/write"
              className="relative inline-flex items-center justify-center py-3 pl-4 pr-12 overflow-hidden font-semibold text-white dark:text-black bg-[#af4261] dark:bg-[#70dbb8] transition-all duration-150 ease-in-out rounded-2xl hover:pl-10 hover:pr-6 group w-full"
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
                Start writing
              </span>
            </Link>
          </p>
        </section>
      </main>
    </>
  );
};

export default PageNotFound;
