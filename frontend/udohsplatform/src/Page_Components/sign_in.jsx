/* eslint-disable react/prop-types */
import { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FaRegWindowClose } from "react-icons/fa";
import { Link } from "react-router-dom";
import SignUpWithGoogle from "./signupWithGoogle";
import { HiOutlineLogin } from "react-icons/hi";

const Sign_In = ({
  hideSignInForm,
  showRegisterForm,
  showForgotPasswordForm,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="flex justify-center"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="bg-white dark:bg-[#242424] h-full fixed w-full overflow-auto max-w-[700px] min-[600px]:p-6 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
        <section className="p-4">
          <h2 className="text-center text-3xl text-[#81ba40] dark:text-[#70dbb8] font-bold">
            Welcome back.
          </h2>

          <form onSubmit={(e) => e.preventDefault()} className="mt-8">
            <div className="flex flex-col-reverse mb-8 relative mt-16">
              <input
                type="email"
                required
                placeholder=" "
                id="email"
                className="h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 peer"
              />

              <label
                htmlFor="email"
                className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
              >
                Email&nbsp;<span className="text-red-500">&#42;</span>
              </label>
            </div>

            <div className="flex flex-col-reverse relative mt-20">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder=" "
                className="h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 peer"
              />

              <button
                type="button"
                className="absolute top-1 right-0 cursor-pointer text-3xl text-[#81ba40] dark:text-[#70dbb8] "
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </button>

              <label
                htmlFor="password"
                className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
              >
                Password&nbsp;<span className="text-red-500">&#42;</span>
              </label>
            </div>

            <div className="mb-12 text-right mt-3 text-lg text-[#81ba40] dark:text-[#70dbb8] font-bold">
              <button
                type="button"
                className="underline"
                onClick={() => {
                  hideSignInForm();
                  showForgotPasswordForm();
                }}
              >
                Forgot your password&#x3f;
              </button>
            </div>

            <button
              type="submit"
              disabled={false}
              className="w-full font-bold uppercase relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group"
            >
              <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
              <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md "></span>
              <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 "></span>
              <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center">
                Sign in <HiOutlineLogin className="ml-2" />
              </span>
            </button>
          </form>

          <div className="mt-6 text-center text-[#81ba40] dark:text-[#70dbb8] underline text-lg">
            <Link
              onClick={() => {
                hideSignInForm();
                showRegisterForm();
              }}
            >
              Don&apos;t have an account&#x3f; Register
            </Link>
          </div>

          <SignUpWithGoogle text={"Sign in with Google"} />

          <button
            type="button"
            className="text-4xl absolute top-2 right-3"
            onClick={hideSignInForm}
          >
            <FaRegWindowClose />
          </button>
        </section>
      </div>
    </div>
  );
};

export default Sign_In;
