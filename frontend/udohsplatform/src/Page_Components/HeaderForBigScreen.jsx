/* eslint-disable react/prop-types */
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BiSearchAlt } from "react-icons/bi";
import { Link } from "react-router-dom";

const HeaderForBigScreen = ({ user, showSignInForm, showRegisterForm }) => {
  // This function gives the Search Input field a focus
  const giveSearchFieldFocus = () => {
    const searchInputField = document.querySelector("#search-input-field");
    searchInputField.focus();
  };

  // This checks when the search form has focus, so that the 'search' button will change to an 'X' (close) button
  const [formHasFocus, setFormHasFocus] = useState(false);

  return (
    <nav>
      <ul className="flex items-center justify-between dark:bg-[#242424] bg-white p-4 fixed w-full z-10">
        <li>
          <Link
            to="/"
            className="font-bold tracking-[-0.12em] text-2xl min-[900px]:text-3xl"
            id="logo"
          >
            udohsplatform
          </Link>
        </li>

        <a
          href="#start_reading"
          className="absolute left-[150px] bottom-0 font-bold border border-r-emerald-700 bg-emerald-700 box rounded-md p-1 text-xs opacity-0 w-0 overflow-hidden h-0 focus:opacity-100 focus:w-auto focus:h-auto"
        >
          Skip Navigation
        </a>

        <li className="group text-[#af4261] dark:text-[#a1d06d]">
          {!formHasFocus && (
            <button
              type="button"
              aria-label="search"
              title="Search"
              className="text-3xl cursor-pointer flex min-[900px]:text-4xl peer"
              onFocus={() => giveSearchFieldFocus()}
            >
              <BiSearchAlt />
            </button>
          )}

          {formHasFocus && (
            <button
              type="button"
              aria-label="search"
              title="Search"
              className="text-3xl cursor-pointer flex min-[900px]:text-4xl"
              onClick={() => {
                document.activeElement.blur();
              }}
            >
              <AiOutlineClose />
            </button>
          )}

          <div className="absolute -left-[1800px] top-16 w-full focus-within:left-0 peer-focus:left-0 transition-all duration-500">
            <form
              className="w-full flex justify-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative w-full max-w-[450px] text-black dark:text-white">
                <input
                  id="search-input-field"
                  type="search"
                  placeholder="search..."
                  className="w-full block border-black dark:border-white border-2 rounded-3xl h-10"
                  onFocus={() => setFormHasFocus(true)}
                  onBlur={() => setFormHasFocus(false)}
                />
                <button
                  type="submit"
                  aria-label="Submit"
                  title="Search"
                  className="text-2xl absolute right-1 top-2"
                >
                  <BiSearchAlt />
                </button>
              </div>
            </form>
          </div>
        </li>

        <div>
          <div className="flex items-center gap-4 text-[#af4261] dark:text-[#a1d06d] text-lg font-bold min-[900px]:text-xl">
            <li>
              <Link
                to=""
                className="flex relative transition-all duration-500 after:duration-500 hover:text-[white] after:bg-[#af4261] dark:hover:text-[black] after:transition-all dark:after:bg-[#a1d06d] after:rounded-md after:w-full after:h-[2px] after:absolute after:bottom-0 hover:after:h-full z-10 after:z-[-10]"
              >
                Our story
              </Link>
            </li>
            <li>
              <Link
                to="/membership"
                className="flex relative transition-all duration-500 after:duration-500 hover:text-[white] after:bg-[#af4261] dark:hover:text-[black] after:transition-all dark:after:bg-[#a1d06d] after:rounded-md after:w-full after:h-[2px] after:absolute after:bottom-0 hover:after:h-full z-10 after:z-[-10]"
              >
                Membership
              </Link>
            </li>
            <li>
              <Link
                to=""
                className="flex relative transition-all duration-500 after:duration-500 hover:text-[white] after:bg-[#af4261] dark:hover:text-[black] after:transition-all dark:after:bg-[#a1d06d] after:rounded-md after:w-full after:h-[2px] after:absolute after:bottom-0 hover:after:h-full z-10 after:z-[-10]"
              >
                Write
              </Link>
            </li>

            {!user && (
              <>
                <li>
                  <Link
                    to="#"
                    onClick={showSignInForm}
                    className="flex relative transition-all duration-500 after:duration-500 hover:text-[white] after:bg-[#af4261] dark:hover:text-[black] after:transition-all dark:after:bg-[#a1d06d] after:rounded-md after:w-full after:h-[2px] after:absolute after:bottom-0 hover:after:h-full z-10 after:z-[-10]"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    onClick={showRegisterForm}
                    className="flex relative transition-all duration-500 after:duration-500 hover:text-[white] after:bg-[#af4261] dark:hover:text-[black] after:transition-all dark:after:bg-[#a1d06d] after:rounded-md after:w-full after:h-[2px] after:absolute after:bottom-0 hover:after:h-full z-10 after:z-[-10]"
                  >
                    Get started
                  </Link>
                </li>
              </>
            )}

            {user && (
              <>
                <li>
                  <Link
                    to="/userProfile"
                    className="flex relative transition-all duration-500 after:duration-500 hover:text-[white] after:bg-[#af4261] dark:hover:text-[black] after:transition-all dark:after:bg-[#a1d06d] after:rounded-md after:w-full after:h-[2px] after:absolute after:bottom-0 hover:after:h-full z-10 after:z-[-10]"
                  >
                    Profile
                  </Link>
                </li>

                <li>
                  <Link
                    to="#"
                    className="flex relative transition-all duration-500 after:duration-500 hover:text-[white] after:bg-[#af4261] dark:hover:text-[black] after:transition-all dark:after:bg-[#a1d06d] after:rounded-md after:w-full after:h-[2px] after:absolute after:bottom-0 hover:after:h-full z-10 after:z-[-10]"
                  >
                    Sign out
                  </Link>
                </li>
              </>
            )}
          </div>
        </div>
      </ul>
    </nav>
  );
};

export default HeaderForBigScreen;
