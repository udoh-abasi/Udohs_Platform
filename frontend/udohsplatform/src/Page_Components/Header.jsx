import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import { BiSearchAlt } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { BsPencilSquare } from "react-icons/bs";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { HiOutlineLogin, HiOutlineLogout } from "react-icons/hi";
import { AiOutlineLogin } from "react-icons/ai";
import { RiChatHistoryLine } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";
import { useMatchMedia } from "../customHooks/useMatchMedia";
import HeaderForBigScreen from "./HeaderForBigScreen";
import Sign_In from "./sign_in";
import Register from "./register";
import ForgotPassword from "./forgotPassword";
import axiosClient from "../utils/axiosSetup";
import { useDispatch, useSelector } from "react-redux";
import { userAction } from "../reduxFiles/actions";
import { userSelector } from "../reduxFiles/selectors";
import { useSearchParams } from "react-router-dom";

const Header = () => {
  const user = useSelector(userSelector);

  const [googleSignUpMessage, setGoogleSignUpMessage] = useState("appUser");

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  // Get the google's code from the user and send it to the backend
  const [searchParams] = useSearchParams();

  const firstRender = useRef(); // NOTE: This is used in development to prevent the useEffect from running twice

  // This function pops up the message box, when sign-up-with-google is successful or failed
  const showGoogleMessagePopUp = () => {
    const thePopUp = document.querySelector("#googleMessagePopUp");
    thePopUp.classList.remove("hidden");

    setTimeout(() => {
      thePopUp.classList.remove("-bottom-36");
      thePopUp.classList.add("bottom-16");
    }, 0.05);
  };

  const hideGoogleMessagePopUp = () => {
    const thePopUp = document.querySelector("#googleMessagePopUp");
    thePopUp.classList.remove("bottom-16");
    thePopUp.classList.add("-bottom-36");

    setTimeout(() => {
      thePopUp.classList.add("hidden");
    }, 500);
  };

  useEffect(() => {
    const getGoogleUser = async () => {
      const code = searchParams.get("code");

      if (code) {
        try {
          const response = await axiosClient.post(
            `/api/getgoogledata?code=${code}`
          );
          if (response.status === 200) {
            dispatch(userAction(response.data));
            navigate("/");
            setGoogleSignUpMessage("success");
            showGoogleMessagePopUp();
            setTimeout(hideGoogleMessagePopUp, 10000);
          }
        } catch (e) {
          if (e.request.status === 403) {
            dispatch(userAction(""));
            navigate("/");
            setGoogleSignUpMessage("appUser");
            showGoogleMessagePopUp();
            setTimeout(hideGoogleMessagePopUp, 10000);
          } else {
            dispatch(userAction(""));
            navigate("/");
            setGoogleSignUpMessage("failed");
            showGoogleMessagePopUp();
            setTimeout(hideGoogleMessagePopUp, 10000);
          }
        }
      }
    };

    // So, if we are in development mode, we don't want this to execute twice
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === "development") {
      if (!firstRender.current) {
        firstRender.current = true;
      } else {
        getGoogleUser();
      }
    } else {
      getGoogleUser();
    }
  }, [searchParams]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Send a request to get the user on page load
  // This also runs when the user changes pages, so if the user had manually deleted their sessionid, or the sessionID had expires, our redux state changes. (So, we used the 'navigate' to know when the user goes to a new page)
  useEffect(() => {
    const getLoggedInUser = async () => {
      try {
        const response = await axiosClient.get("/api/user");
        if (response.status === 200) {
          dispatch(userAction(response.data));
        }
      } catch (e) {
        /* User's sessionid was not available in cookie, so do nothing. */
        dispatch(userAction(""));
      }
    };

    getLoggedInUser();
  }, [dispatch, navigate]);

  // This listens to when a user manually deletes their sessionid, or the sessionid expires, so the user will be logged out of our app

  const signOut = async () => {
    try {
      const response = await axiosClient.post("/api/logout");
      if (response.status == 200) {
        dispatch(userAction(""));
        navigate("/");
      }
    } catch {
      /*The user wasn't logged in, so do nothing*/
    }
  };

  const togglePageScrolling = () => {
    document.querySelector("body").classList.toggle("menuOpen");
  };

  // Toggle off the menu bar when the 'X' button is clicked or when any menu item is clicked
  const toggleOffMenu = () => {
    const theCart = document.querySelector("#menu-small-screen");
    theCart.classList.toggle("translate-y-[-700px]");
    theCart.classList.toggle("translate-y-[20px]");

    setTimeout(() => {
      theCart.classList.toggle("hidden");
    }, 500);
    togglePageScrolling();
  };

  // This function gives the Search Input field a focus
  const giveSearchFieldFocus = () => {
    const searchInputField = document.querySelector("#search-input-field");
    searchInputField.focus();
  };

  const smallScreenNav = useMatchMedia("(max-width:716px)");

  // Listen to when a new <nav> is returned, then remove 'menuOpen' from <body> element. This is fix incase the nav was open on mobile before resizing screen to desktop
  useEffect(() => {
    // First, we check if the sign in form is open. This will prevent adding scroll bar when the sign up form is still open

    if (document.querySelector("#sign_in").classList.contains("hidden")) {
      document.querySelector("body").classList.remove("menuOpen");
    }
  }, [smallScreenNav]);

  // This checks when the search form has focus, so that the 'search' button will change to an 'X' (close) button
  const [formHasFocus, setFormHasFocus] = useState(false);

  // These functions pops up the sign_in and register form, when the 'Sign in' or 'Get Started' button is clicked respectively
  const showForm = (form) => {
    if (form) {
      const form_div = document.querySelector(form);
      form_div.classList.remove("hidden");
      document.querySelector("body").classList.add("menuOpen");

      setTimeout(() => {
        form_div.classList.remove("scale-[0]");
        form_div.classList.remove("rounded-full");

        form_div.classList.add("scale-[1]");
        form_div.classList.add("rounded-none");
      }, 0.05);
    }
  };

  const hideForm = (form) => {
    if (form) {
      const form_div = document.querySelector(form);
      form_div.classList.remove("scale-[1]");
      form_div.classList.remove("rounded-none");

      form_div.classList.add("scale-[0]");
      form_div.classList.add("rounded-full");

      document.querySelector("body").classList.remove("menuOpen");

      setTimeout(() => {
        form_div.classList.add("hidden");
      }, 500);
    }
  };

  // This was added so that on bigger screens, if the search bar has focus, when the escape key is pressed, it will lose focus so that the search field will disappear
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key == "Escape") {
        // When the escape key is pressed, first hide the search field if it's open
        document.activeElement.blur();

        // Then hide the form if it's open
        hideForm("#sign_in");
        hideForm("#register_user");

        // Then hide the menu bar (for small screens) if it's open
        const theCart = document.querySelector("#menu-small-screen");
        if (theCart) {
          theCart.classList.add("translate-y-[-700px]");
          theCart.classList.remove("translate-y-[20px]");
          setTimeout(() => {
            theCart.classList.add("hidden");
          }, 500);
        }
      }
    });
  }, []);

  return (
    <>
      <header>
        {smallScreenNav ? (
          <nav>
            <div className="flex items-center justify-between dark:bg-[#242424] bg-white p-4 fixed w-full z-10">
              <Link
                to="/"
                className="font-bold tracking-[-0.12em] text-2xl"
                id="logo"
              >
                udohsplatform
              </Link>

              <div className="">
                {!formHasFocus && (
                  <button
                    type="button"
                    aria-label="search"
                    title="Search"
                    className="text-3xl text-[#af4261] dark:text-[#a1d06d] cursor-pointer peer"
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
                    className="text-3xl text-[#af4261] dark:text-[#a1d06d] cursor-pointer "
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
                    <div className="relative w-full max-w-[450px]">
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
                    to=""
                    className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                  >
                    Our story <RiChatHistoryLine className="ml-2" />
                  </Link>
                </li>
                <li className="w-full" onClick={toggleOffMenu}>
                  <Link
                    to="/membership"
                    className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                  >
                    Membership <MdOutlineVerifiedUser className="ml-2" />
                  </Link>
                </li>
                <li className="w-full" onClick={toggleOffMenu}>
                  <Link
                    to=""
                    className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                  >
                    Write
                    <BsPencilSquare className="ml-2" />
                  </Link>
                </li>

                {!user && (
                  <>
                    <li
                      className="w-full"
                      onClick={() => {
                        toggleOffMenu();
                        togglePageScrolling();
                      }}
                    >
                      <Link
                        to="#"
                        onClick={() => {
                          showForm("#sign_in");
                        }}
                        className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                      >
                        Sign in <HiOutlineLogin className="ml-2" />
                      </Link>
                    </li>
                    <li className="w-full" onClick={toggleOffMenu}>
                      <Link
                        to="#"
                        onClick={() => {
                          showForm("#register_user");
                        }}
                        className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                      >
                        Get started <AiOutlineLogin className="ml-2" />
                      </Link>
                    </li>
                  </>
                )}

                {user && (
                  <>
                    <li className="w-full" onClick={toggleOffMenu}>
                      <Link
                        to="/userProfile"
                        className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                      >
                        Profile <CgProfile className="ml-2" />
                      </Link>
                    </li>

                    <li className="w-full" onClick={toggleOffMenu}>
                      <Link
                        to="#"
                        className="border-2 bg-[#70dbb8] dark:bg-[#242424] dark:border-[#fcffba] w-full text-center p-2 rounded-2xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] flex items-center justify-center"
                        onClick={() => {
                          signOut();
                        }}
                      >
                        Sign out <HiOutlineLogout className="ml-2" />
                      </Link>
                    </li>
                  </>
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
        ) : (
          <HeaderForBigScreen
            user={user}
            showSignInForm={() => showForm("#sign_in")}
            showRegisterForm={() => showForm("#register_user")}
            signOut={signOut}
          />
        )}

        {googleSignUpMessage && (
          <div
            id="googleMessagePopUp"
            className="-bottom-36 hidden rounded-2xl fixed font-bold z-50 max-w-[400px] right-0 w-full p-4 bg-gray-200 -translate-y-1/2 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] transition-all duration-500 ease-linear"
          >
            {googleSignUpMessage === "success" && (
              <p className="text-center text-green-500">Sign in Successful</p>
            )}

            {googleSignUpMessage === "failed" && (
              <p className="text-center text-red-500">
                Google verification failed. Please sign up with an email and
                password
              </p>
            )}

            {googleSignUpMessage === "appUser" && (
              <p className="text-center text-red-500">
                You signed up with an email and password. Please sign in to
                continue{" "}
              </p>
            )}

            <button
              aria-label="close"
              type="button"
              className="text-2xl absolute top-1 right-1 text-black cursor-pointer"
              onClick={() => {
                hideGoogleMessagePopUp();
              }}
            >
              <AiOutlineClose />
            </button>
          </div>
        )}
      </header>

      <section
        id="sign_in"
        className="fixed overflow-auto w-full h-full z-10 bg-[rgb(255,255,255,.95)] dark:bg-[rgb(0,0,0,.95)] hidden scale-[0] rounded-full transition-all duration-500 ease-linear"
        onClick={() => {
          hideForm("#sign_in");
        }}
      >
        <Sign_In
          hideSignInForm={() => hideForm("#sign_in")}
          showRegisterForm={() => showForm("#register_user")}
          showForgotPasswordForm={() => showForm("#forgot_password")}
        />
      </section>

      <section
        id="register_user"
        className="fixed hidden overflow-auto w-full h-full z-10 bg-[rgb(255,255,255,.95)] dark:bg-[rgb(0,0,0,.95)] scale-[0] rounded-full transition-all duration-500 ease-linear"
        onClick={() => {
          hideForm("#register_user");
        }}
      >
        <Register
          hideRegisterForm={() => hideForm("#register_user")}
          showSignInForm={() => showForm("#sign_in")}
        />
      </section>

      <section
        id="forgot_password"
        className="fixed hidden overflow-auto w-full h-full z-10 bg-[rgb(255,255,255,.95)] dark:bg-[rgb(0,0,0,.95)] scale-[0] rounded-full transition-all duration-500 ease-linear"
        onClick={() => {
          hideForm("#forgot_password");
        }}
      >
        <ForgotPassword
          hideRegisterForm={() => hideForm("#register_user")}
          showRegisterForm={() => showForm("#register_user")}
          showSignInForm={() => showForm("#sign_in")}
          hideForgotPasswordForm={() => hideForm("#forgot_password")}
        />
      </section>
    </>
  );
};

export default Header;
