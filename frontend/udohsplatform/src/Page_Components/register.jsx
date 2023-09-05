/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillWarning,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { FaRegWindowClose } from "react-icons/fa";
import { TbMessage2Down } from "react-icons/tb";
import { Link } from "react-router-dom";
import SignUpWithGoogle from "./signupWithGoogle";
import { HiOutlineLogin } from "react-icons/hi";
import { BsArrowRight } from "react-icons/bs";
import { IoIosCheckmark, IoIosCheckmarkCircle } from "react-icons/io";
import axiosClient from "../utils/axiosSetup";
import Loader from "./loader";
import { useDispatch } from "react-redux";
import { userAction } from "../reduxFiles/actions";

const Register = ({ hideRegisterForm, showSignInForm }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm_password, setShowConfirm_password] = useState(false);

  const [signUpEmail, setSignUpEmail] = useState("");

  const [showEmailField, setShowEmailField] = useState(true);
  const [emailSendingError, setEmailSendingError] = useState("");

  const [requestIsLoading, setRequestIsLoading] = useState(false);

  const [emailVerified, setEmailVerified] = useState(false);

  const [invalidEmail, setInvalidEmail] = useState(false);
  const [incorrectCode, setIncorrectCode] = useState(false);
  const [emailConfirmationCode, setEmailConfirmationCode] = useState("");

  // Test if the email is valid
  const isEmailValid = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  // Show message that password must match
  const [passwordMatch, setPasswordMatch] = useState(true);

  const dispatch = useDispatch();

  // Show the <ul> that tell the user what to be in the password field
  const [showPasswordHelper, setShowPasswordHelper] = useState(false);

  const [passwordHasUppercase, setPasswordHasUppercase] = useState(false);
  const [passwordHasLowercase, setPasswordHasLowercase] = useState(false);
  const [passwordHasNumber, setPasswordHasNumber] = useState(false);
  const [passwordHasCharacter, setPasswordHasCharacter] = useState(false);
  const [passwordIsEightDigit, setPasswordIsEightDigit] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // If there was an error when the signUp button was clicked, the message will be set here
  const [signUpError, setSignUpError] = useState("");

  // This function manages the regular expression, and show what the user has ticked and what they have not
  const passwordRegularExpressionCheck = (e) => {
    setPassword(e.target.value);

    if (/(?=.*[a-z])/.test(e.target.value)) {
      setPasswordHasLowercase(true);
    } else {
      setPasswordHasLowercase(false);
    }

    if (/(?=.*[A-Z])/.test(e.target.value)) {
      setPasswordHasUppercase(true);
    } else {
      setPasswordHasUppercase(false);
    }

    if (/(?=.*\d)/.test(e.target.value)) {
      setPasswordHasNumber(true);
    } else {
      setPasswordHasNumber(false);
    }

    if (/(?=.*[^\da-zA-Z])/.test(e.target.value)) {
      setPasswordHasCharacter(true);
    } else {
      setPasswordHasCharacter(false);
    }

    if (/^.{8,100}$/.test(e.target.value)) {
      setPasswordIsEightDigit(true);
    } else {
      setPasswordIsEightDigit(false);
    }
  };

  // This useEffect checks if the password and the confirmPassword is the same
  // But it will only set the passwordMatch to false if we have typed something into the confirmPassword field
  useEffect(() => {
    if (confirmPassword !== password && confirmPassword) {
      setPasswordMatch(false);
    } else {
      setPasswordMatch(true);
    }
  }, [confirmPassword, password]);

  // This sends an email code to verify the user's email before sign up. Returns a 403 error if the email already exists
  const sendEmail = async (emailAddress) => {
    try {
      setRequestIsLoading(true);
      setEmailSendingError("");

      const response = await axiosClient.post("/api/sendemailcode", {
        email: emailAddress,
      });

      if (response.status === 200) {
        setShowEmailField(false);
      }
      setRequestIsLoading(false);
    } catch (e) {
      setRequestIsLoading(false);
      switch (e.request.status) {
        case 403: {
          setEmailSendingError(
            "User already exists. Sign in or choose another email"
          );
          return;
        }
        default: {
          setEmailSendingError("Something went wrong. Please try again later");
          return;
        }
      }
    }
  };

  const confirmEmailCode = async (code) => {
    setRequestIsLoading(true);

    try {
      const response = await axiosClient.post("api/confirmemail", {
        email: signUpEmail,
        code: code,
      });
      if (response.status === 200) {
        setEmailVerified(true);
      }
      setRequestIsLoading(false);
    } catch {
      setIncorrectCode(true);
      setRequestIsLoading(false);
    }
  };

  const registerUser = async (email, password) => {
    if (
      passwordHasCharacter &&
      passwordHasUppercase &&
      passwordHasLowercase &&
      passwordHasNumber &&
      passwordIsEightDigit &&
      passwordMatch &&
      signUpEmail
    ) {
      setRequestIsLoading(true);
      setSignUpError("");

      try {
        const response = await axiosClient.post("/api/register", {
          email,
          password,
        });

        if (response.status === 201) {
          const response = await axiosClient.post("/api/login", {
            email,
            password,
          });

          if (response.status === 200) {
            const data = response.data;
            dispatch(userAction(data));

            // Then reset everything back to default
            setSignUpEmail("");
            setPassword("");
            setConfirmPassword("");
            setEmailConfirmationCode("");
            setSignUpError("");

            setEmailVerified(false);
            setShowEmailField(true);

            setPasswordHasCharacter(false);
            setPasswordHasLowercase(false);
            setPasswordHasNumber(false);
            setPasswordHasUppercase(false);
            setPasswordIsEightDigit(false);

            setRequestIsLoading(false);
            hideRegisterForm();
          } else {
            throw new Error("Something went wrong");
          }
        } else {
          throw new Error("Something went wrong");
        }
      } catch (e) {
        setRequestIsLoading(false);
        setSignUpError("Something went wrong with your registration.");
      }
    }
  };

  return (
    <div
      className="flex justify-center"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="bg-white fixed dark:bg-[#242424] h-full w-full overflow-auto max-w-[700px] min-[600px]:p-6 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]">
        <section className="p-4">
          <h2 className="text-center text-3xl text-[#81ba40] dark:text-[#70dbb8] font-bold mt-4">
            Join Udohs Platform.
          </h2>

          <form onSubmit={(e) => e.preventDefault()} className="mt-8">
            {!emailVerified && (
              <div className="flex flex-col-reverse mb-8 relative mt-16">
                <input
                  type="email"
                  required
                  placeholder=" "
                  id="signUpEmail"
                  disabled={!showEmailField}
                  value={signUpEmail}
                  onChange={(e) => {
                    setSignUpEmail(e.target.value);
                    setInvalidEmail(false);
                    setEmailSendingError("");
                  }}
                  className="h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 peer disabled:cursor-not-allowed disabled:bg-gray-600 disabled:ring-gray-600 disabled:text-gray-400"
                />

                <label
                  htmlFor="signUpEmail"
                  className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
                >
                  Email&nbsp;<span className="text-red-500">&#42;</span>
                </label>
              </div>
            )}

            {invalidEmail && (
              <p className="flex items-center text-sm text-red-500 mb-4 mt-[-12px]">
                <AiFillWarning className="text-2xl" />
                Please enter a valid email
              </p>
            )}

            {emailSendingError && (
              <p className="flex items-center text-sm text-red-500 mb-4 mt-[-12px]">
                <AiFillWarning className="text-2xl" />
                {emailSendingError}
              </p>
            )}

            {!emailVerified && showEmailField ? (
              <button
                type="submit"
                disabled={requestIsLoading}
                onClick={() => {
                  if (isEmailValid(signUpEmail)) {
                    sendEmail(signUpEmail);
                  } else {
                    setInvalidEmail(true);
                  }
                }}
                className="w-full max-w-[250px] font-bold relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
                <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md "></span>
                <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 "></span>
                <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center">
                  {requestIsLoading ? (
                    <Loader />
                  ) : (
                    <>
                      Continue <BsArrowRight className="ml-2" />
                    </>
                  )}
                </span>
              </button>
            ) : (
              !emailVerified && (
                <>
                  <button
                    type="button"
                    disabled={false}
                    onClick={() => {
                      setShowEmailField(true);
                      setEmailConfirmationCode("");
                      setIncorrectCode(false);
                    }}
                    className="w-full max-w-[250px] font-bold relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group"
                  >
                    <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
                    <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md "></span>
                    <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 "></span>
                    <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center">
                      Change Email
                    </span>
                  </button>

                  <p className="mt-6 text-green-600 dark:text-green-300 flex flex-col items-center">
                    <TbMessage2Down className="text-3xl" />{" "}
                    <span className="text-center">
                      {" "}
                      A confirmation code has been sent to{" "}
                      <strong> {signUpEmail}. </strong>
                      Please enter the code to confirm this is your email.
                    </span>
                  </p>

                  <div className="flex flex-col-reverse mb-4 relative mt-10">
                    <input
                      type="number"
                      maxLength={6}
                      required
                      placeholder=" "
                      id="signUpCode"
                      value={emailConfirmationCode}
                      onChange={(e) => {
                        setEmailConfirmationCode(e.target.value);
                        setIncorrectCode(false);
                      }}
                      className="h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 peer"
                    />

                    <label
                      htmlFor="signUpCode"
                      className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
                    >
                      Confirmation code&nbsp;
                      <span className="text-red-500">&#42;</span>
                    </label>
                  </div>

                  {incorrectCode && (
                    <p className="flex items-center text-sm text-red-500 mb-4">
                      <AiFillWarning className="text-2xl" />
                      Email verification failed. Please check the code and try
                      again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={requestIsLoading}
                    onClick={() => {
                      setIncorrectCode(false);
                      if (emailConfirmationCode.length === 6) {
                        confirmEmailCode(emailConfirmationCode);
                      } else {
                        setIncorrectCode(true);
                      }
                    }}
                    className="w-full max-w-[250px] font-bold relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
                    <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md "></span>
                    <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 "></span>
                    <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center">
                      {requestIsLoading ? (
                        <Loader />
                      ) : (
                        <>
                          Confirm Code <BsArrowRight className="ml-2" />
                        </>
                      )}
                    </span>
                  </button>
                </>
              )
            )}

            {emailVerified && (
              <>
                <p className="flex items-center text-2xl justify-center text-green-600 dark:text-green-300 mt-8 mb-[-40px] max-[450px]:text-xl">
                  Email verified successfully{" "}
                  <IoIosCheckmarkCircle className="ml-2 text-3xl max-[320px]:ml-0 max-[340px]:text-xl" />
                </p>

                <div className="flex flex-col-reverse relative mt-20">
                  <input
                    id="signUpPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder=" "
                    value={password}
                    onFocus={() => setShowPasswordHelper(true)}
                    onBlur={() => setShowPasswordHelper(false)}
                    onChange={(e) => passwordRegularExpressionCheck(e)}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$"
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
                    htmlFor="signUpPassword"
                    className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
                  >
                    Password&nbsp;<span className="text-red-500">&#42;</span>
                  </label>
                </div>

                {showPasswordHelper && (
                  <ul className="pl-8 text-red-500 py-2 text-sm">
                    <li
                      className={`${
                        passwordHasUppercase && "text-green-500"
                      } flex items-center`}
                    >
                      <span className="mr-2">
                        At least one uppercase letter
                      </span>

                      <span>
                        {passwordHasUppercase ? (
                          <IoIosCheckmark className="text-2xl" />
                        ) : (
                          <AiOutlineCloseCircle />
                        )}
                      </span>
                    </li>

                    <li
                      className={`${
                        passwordHasLowercase && "text-green-500"
                      } flex items-center`}
                    >
                      <span className="mr-3">
                        At least one lowercase letter
                      </span>

                      <span>
                        {passwordHasLowercase ? (
                          <IoIosCheckmark className="text-2xl" />
                        ) : (
                          <AiOutlineCloseCircle />
                        )}
                      </span>
                    </li>

                    <li
                      className={`${
                        passwordHasNumber && "text-green-500"
                      } flex items-center`}
                    >
                      <span className="mr-20">At least one digit</span>

                      <span>
                        {passwordHasNumber ? (
                          <IoIosCheckmark className="text-2xl" />
                        ) : (
                          <AiOutlineCloseCircle />
                        )}
                      </span>
                    </li>

                    <li
                      className={`${
                        passwordHasCharacter && "text-green-500"
                      } flex items-center`}
                    >
                      <span className="mr-2">
                        At least one special character
                      </span>

                      <span>
                        {passwordHasCharacter ? (
                          <IoIosCheckmark className="text-2xl" />
                        ) : (
                          <AiOutlineCloseCircle />
                        )}
                      </span>
                    </li>

                    <li
                      className={`${
                        passwordIsEightDigit && "text-green-500"
                      } flex items-center`}
                    >
                      <span className="mr-8">At least 8 characters long</span>

                      <span>
                        {passwordIsEightDigit ? (
                          <IoIosCheckmark className="text-2xl" />
                        ) : (
                          <AiOutlineCloseCircle />
                        )}
                      </span>
                    </li>
                  </ul>
                )}

                <div className="flex flex-col-reverse relative mt-16 mb-8 ">
                  <input
                    id="confirm_password"
                    type={showConfirm_password ? "text" : "password"}
                    required
                    placeholder=" "
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 peer"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$"
                  />

                  <button
                    type="button"
                    className="absolute top-1 right-0 cursor-pointer text-3xl text-[#81ba40] dark:text-[#70dbb8] "
                    onClick={() =>
                      setShowConfirm_password(!showConfirm_password)
                    }
                  >
                    {showConfirm_password ? (
                      <AiFillEyeInvisible />
                    ) : (
                      <AiFillEye />
                    )}
                  </button>

                  <label
                    htmlFor="confirm_password"
                    className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
                  >
                    Confirm Password&nbsp;
                    <span className="text-red-500">&#42;</span>
                  </label>
                </div>

                {!passwordMatch && (
                  <p className="flex items-center text-sm text-red-500 mb-4 mt-[-12px]">
                    <AiFillWarning className="text-2xl" />
                    Passwords do NOT match
                  </p>
                )}

                {signUpError && (
                  <p className="flex items-center text-sm text-red-500 mb-4 mt-[-12px]">
                    <AiFillWarning className="text-2xl" />
                    {signUpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={requestIsLoading}
                  onClick={() => {
                    if (password && password === confirmPassword) {
                      registerUser(signUpEmail, password);
                    } else if (password && password !== confirmPassword) {
                      setPasswordMatch(false);
                    }
                  }}
                  className="w-full font-bold uppercase relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
                  <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md "></span>
                  <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 "></span>
                  <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center">
                    {requestIsLoading ? (
                      <Loader />
                    ) : (
                      <>
                        Sign up <HiOutlineLogin className="ml-2" />
                      </>
                    )}
                  </span>
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-[#81ba40] dark:text-[#70dbb8] underline text-lg">
            <Link
              onClick={() => {
                hideRegisterForm();
                showSignInForm();
              }}
            >
              Already have an account&#x3f; Sign in
            </Link>
          </div>

          <SignUpWithGoogle text={"Sign up with Google"} />

          <button
            type="button"
            className="text-4xl absolute top-2 right-3"
            onClick={hideRegisterForm}
          >
            <FaRegWindowClose />
          </button>
        </section>
      </div>
    </div>
  );
};

export default Register;
