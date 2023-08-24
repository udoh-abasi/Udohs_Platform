import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { BiSearchAlt } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { BsPencilSquare } from "react-icons/bs";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { HiOutlineLogin, HiOutlineLogout } from "react-icons/hi";
import { AiOutlineLogin } from "react-icons/ai";
import { RiChatHistoryLine } from "react-icons/ri";
import { useState } from "react";

const Header = () => {
  const [user, setUser] = useState(false);
  setUser;

  const togglePageScrolling = () => {
    document.querySelector("body").classList.toggle("menuOpen");
  };

  const toggleOffMenu = () => {
    const theCart = document.querySelector("#menu-small-screen");
    theCart.classList.toggle("translate-y-[-700px]");
    theCart.classList.toggle("translate-y-[20px]");

    setTimeout(() => {
      theCart.classList.toggle("hidden");
    }, 1000);
    togglePageScrolling();
  };

  return (
    <header>
      <nav>
        <div className="flex items-center justify-between dark:bg-[#242424] bg-white p-4 fixed w-full z-10">
          <Link
            to="/"
            className="font-bold tracking-[-0.12em] text-2xl"
            id="logo"
          >
            udohsplatform
          </Link>

          <div className="group">
            <button
              type="button"
              aria-label="search"
              title="Search"
              className="text-3xl text-[#af4261] dark:text-[#a1d06d] cursor-pointer "
            >
              <BiSearchAlt />
            </button>

            <div className="absolute -left-[1800px] top-16 w-full group-hover:left-0 group-focus-within:left-0 transition-all duration-500">
              <form
                className="w-full flex justify-center"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="relative w-full max-w-[450px]">
                  <input
                    type="search"
                    placeholder="search..."
                    className="w-full block border-black dark:border-white border-2 rounded-3xl h-10"
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
          </div>

          <button
            aria-label="menu-button-toggle"
            type="button"
            title="Menu"
            className="text-3xl text-[#af4261] dark:text-[#a1d06d] cursor-pointer"
            onClick={() => {
              const theCart = document.querySelector("#menu-small-screen");
              theCart.classList.toggle("hidden");

              setTimeout(() => {
                theCart.classList.toggle("translate-y-[-700px]");
                theCart.classList.toggle("translate-y-[20px]");
              }, 0.001);

              togglePageScrolling();
            }}
          >
            <GiHamburgerMenu />
          </button>
        </div>

        <div
          id="menu-small-screen"
          className="fixed overflow-auto bg-white dark:bg-[#242424] w-full h-full mt-[-16px] p-8 dark:text-[#fcffba] font-bold 
             transition-all ease-linear duration-[500ms] hidden translate-y-[-700px] z-10
            "
        >
          <ul className="flex flex-col items-center justify-around h-full text-xl">
            <li className="w-full" onClick={toggleOffMenu}>
              <Link
                to="/"
                className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
              >
                Our story <RiChatHistoryLine className="ml-2" />
              </Link>
            </li>
            <li className="w-full" onClick={toggleOffMenu}>
              <Link
                to="/"
                className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
              >
                Membership <MdOutlineVerifiedUser className="ml-2" />
              </Link>
            </li>
            <li className="w-full" onClick={toggleOffMenu}>
              <Link
                to="/"
                className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
              >
                Write
                <BsPencilSquare className="ml-2" />
              </Link>
            </li>

            {!user && (
              <>
                <li className="w-full" onClick={toggleOffMenu}>
                  <Link
                    to="/"
                    className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                  >
                    Sign in <HiOutlineLogin className="ml-2" />
                  </Link>
                </li>
                <li className="w-full" onClick={toggleOffMenu}>
                  <Link
                    to="/"
                    className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                  >
                    Get started <AiOutlineLogin className="ml-2" />
                  </Link>
                </li>
              </>
            )}

            {user && (
              <li className="w-full" onClick={toggleOffMenu}>
                <Link
                  to="/"
                  className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                >
                  Sign out <HiOutlineLogout className="ml-2" />
                </Link>
              </li>
            )}

            <button
              aria-label="menu"
              type="button"
              className="text-5xl text-[#af4261] dark:text-[#a1d06d] cursor-pointer"
              onClick={toggleOffMenu}
            >
              <AiOutlineClose />
            </button>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
