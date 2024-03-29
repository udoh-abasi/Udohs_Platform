import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { BsCreditCard2Back, BsCreditCard2FrontFill } from "react-icons/bs";
import { AiFillWarning } from "react-icons/ai";
import { Link } from "react-router-dom";
import { showForm } from "../utils/showOrHideSignUpAndRegisterForms";
import { userSelector } from "../reduxFiles/selectors";
import { useDispatch, useSelector } from "react-redux";
import { MdCelebration, MdWorkspacePremium } from "react-icons/md";
import Confetti from "react-confetti";
import PaystackPop from "@paystack/inline-js";
import axiosClient from "../utils/axiosSetup";
import { userAction } from "../reduxFiles/actions";
import Loader from "./loader";

/**
 * @NOTE - THIS PAGE WAS ORIGINALLY DESIGNED TO HANDLE PAYMENT IN NAIRA (100 NAIRA) AND DOLLAR (1 DOLLAR)
 * HOWEVER, DUE TO MY INABILITY TO ACCEPT PAYMENT IN DOLLARS BECAUSE OF PAYSTACK RESTRICTIONS ON MY ACCOUNT, I CHANGED IT TO ACCEPTING PAYMENT OF 100 naira and 200 naira
 */

const Membership = () => {
  let user = useSelector(userSelector);
  const userLoading = user.userLoading;
  user = user.userData;

  const [paymentMethod, setPaymentMethod] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [CVV, setCVV] = useState("");

  // Format the credit card field, to add a space after 4 numbers have been typed
  const formatValue = (value) => {
    const regex = /[^0-9 ]/g; // Regex to accept just numbers

    const newString = value.replace(regex, ""); // Ensures only numbers are accepted in the field

    const rawText = [...newString.split(" ").join("")]; // Remove old space
    const creditCard = []; // Create card as array
    rawText.forEach((text, index) => {
      if (index % 4 === 0 && index !== 0) creditCard.push(" "); // Add space
      creditCard.push(text);
    });

    return creditCard.join(""); // Transform card array to string
  };

  // This function ensures the user does not input more than three numbers in the CVV field
  const formatCVV = (value) => {
    if (value.length > 3) {
      return value.slice(0, 3);
    }
    return value;
  };

  const monthOption = [];

  for (let i = 1; i <= 12; i++) {
    let month = i;

    if (String(i).length === 1) {
      month = "0" + String(month);
    }
    monthOption.push(
      <option value={i} key={i}>
        {month}
      </option>
    );
  }

  // For year, get the current year, and add 10 years to it, then populate the year's <select> with it
  const yearOption = [];
  const date = new Date();
  const currentYear = date.getFullYear();

  for (let i = currentYear; i <= currentYear + 10; i++) {
    yearOption.push(
      <option value={i} key={i}>
        {i}
      </option>
    );
  }

  // Controls if the confetti should show, to congratulate the user
  const [showConfetti, setShowConfetti] = useState(true);

  // Turn off the confetti after 1 minute
  useEffect(() => {
    if (user && user.premium_member) {
      setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
    }
  }, [user]);

  // Added so that confetti will respond to resize of the screen
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function that executes to run the paystack payment
  const dispatch = useDispatch();

  const payWithPaystack = () => {
    // Fix issue of the Paystack pop up not showing the close (x) button when the user is on dark mode
    // This color-scheme, when set to 'light dark', makes the page black and white. So, we remove it until the paystack payment is done, or canceled.
    const colorScheme = document.querySelector('meta[name="color-scheme"]');
    colorScheme.setAttribute("content", "none");

    // const amount =
    //   paymentMethod === "naira"
    //     ? "10000"
    //     : paymentMethod === "dollar"
    //     ? "100"
    //     : "";

    // const currency =
    //   paymentMethod === "naira"
    //     ? "NGN"
    //     : paymentMethod === "dollar"
    //     ? "USD"
    //     : "";

    const amount =
      paymentMethod === "naira"
        ? "10000"
        : paymentMethod === "dollar"
        ? "20000"
        : "";

    const currency =
      paymentMethod === "naira"
        ? "NGN"
        : paymentMethod === "dollar"
        ? "NGN"
        : "";

    const payStackPop = new PaystackPop();

    if (amount && currency) {
      payStackPop.newTransaction({
        key: import.meta.env.VITE_REACT_APP_PAYSTACK_PUBLIC_KEY, // Replace with your public key
        email: user.email,
        amount, // the amount value is multiplied by 100 to convert to the lowest currency unit
        currency, // Use GHS for Ghana Cedis or USD for US Dollars

        onSuccess: async (transaction) => {
          // This happens after the payment is completed successfully
          const reference = transaction.reference; // The transaction reference generated and returned by paystack

          // Make a request to the server with the reference to verify the transaction
          try {
            dispatch(userAction({ userLoading: true }));
            const response = await axiosClient.post("/api/verifyPayment", {
              paymentRef: reference,
            });
            if (response.status === 200) {
              dispatch(
                userAction({ userLoading: false, userData: response.data })
              );
              window.scrollTo({ top: 0 }); // Scroll the user back to the top of the page, so they will see the 'congratulations'
            }
          } catch {
            dispatch(userAction({ userLoading: false }));
          }

          colorScheme.setAttribute("content", "light dark");
        },
        onCancel: () => {
          // User closed popup, without making payment
          colorScheme.setAttribute("content", "light dark");
        },
      });
    }
  };

  return (
    <>
      <title>Membership - udohsplatform</title>
      <meta
        name="description"
        content="Become a member of udohsplatform to enjoy all premium benefits"
      />

      <>
        <main className="min-h-screen p-4 mb-4">
          <h1 className="pt-[90px] text-[9vw] font-bold text-center text-[#81ba40] dark:text-[#70dbb8] min-[870px]:text-[75px]">
            {user && user.premium_member
              ? "Congratulations!"
              : "Inspire great minds."}
          </h1>

          {user && user.premium_member ? (
            <>
              <div className="z-50 fixed top-0 left-0">
                <Confetti
                  numberOfPieces={200}
                  width={windowDimensions.width}
                  height={windowDimensions.height}
                  gravity={0.05} // Controls how fast the confetti should fall
                  recycle={showConfetti} // Controls if the confetti will keep showing or not
                />
              </div>

              <section className="flex justify-center">
                <div className=" max-w-[650px]">
                  <div className="p-2 text-center ring-[#81ba40] dark:ring-[#70dbb8] ring-4 mt-8 rounded-xl">
                    <span className="flex justify-center !text-green-400 text-7xl mb-4">
                      <MdCelebration />
                    </span>
                    <strong className="text-[rgb(255,145,0)] dark:text-[#ffd700] block my-8 min-[450px]:text-2xl">
                      <MdWorkspacePremium className="inline" />
                      You are a Premium Member
                      <MdWorkspacePremium className="inline" />
                    </strong>
                    <p className="text-xl flex justify-center">
                      <span className="flex-[0_1_400px] ">
                        You have unlimited access to everything on Udohs
                        Platform
                      </span>
                    </p>
                  </div>

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
                </div>
              </section>
            </>
          ) : (
            <div>
              <div className="flex justify-center">
                <section className="my-4 text-xl text-justify max-w-[490px]">
                  <p className="mb-4">
                    Become a premium member to enjoy unlimited access to write
                    as much as you would love to, on Udohs Platform.
                  </p>

                  <p className="mb-4">
                    Free members can only make a maximum of ten posts on Udohs
                    Platform.
                  </p>

                  <p>
                    One payment and you unlock unlimited access to everything on
                    the Platform.{" "}
                  </p>

                  <picture>
                    <img
                      src="secured-by-paystack.webp"
                      alt="Secured by paystack"
                      className="mt-4 rounded-xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px]"
                    />
                  </picture>
                  <p className="text-xl text-justify mt-4">
                    <strong>
                      All payments are made securely on Paystack. We do not keep
                      track of your card details.{" "}
                    </strong>
                    <strong className="block mt-4">
                      No recurring charges. You will only be charged once, for
                      this service.
                    </strong>
                  </p>
                </section>
              </div>

              {user && !user.premium_member && (
                <section className="flex flex-col items-center mt-8 mb-16 min-[800px]:flex-row min-[800px]:justify-center min-[800px]:gap-4">
                  <button
                    onClick={() => setPaymentMethod("naira")}
                    className={`rounded-bl-3xl rounded-tr-3xl flex flex-col items-center gap-4 text-xl  ring-[#81ba40] dark:ring-[#70dbb8] text-center w-full max-w-[300px] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black p-4 group transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] ${
                      paymentMethod === "naira" ? "ring-4" : "ring-1"
                    }`}
                  >
                    <span className="block font-bold">One-off Payment</span>
                    <span className="block">&#8358;100</span>

                    <span className="block mb-4 border-[2px] border-[#81ba40] dark:border-[#70dbb8] group-hover:border-white dark:group-hover:border-black w-[200px] py-1 font-bold rounded-3xl">
                      {paymentMethod === "naira" ? (
                        <span className="flex gap-2 items-center justify-center">
                          Selected <FaCheck />
                        </span>
                      ) : (
                        "Select"
                      )}
                    </span>
                  </button>

                  <p className="my-8 font-bold uppercase text-2xl">Or</p>

                  <button
                    onClick={() => setPaymentMethod("dollar")}
                    className={`rounded-bl-3xl rounded-tr-3xl flex flex-col items-center gap-4 text-xl  ring-[#81ba40] dark:ring-[#70dbb8] text-center w-full max-w-[300px] hover:bg-[#81ba40] dark:hover:bg-[#70dbb8] hover:text-white dark:hover:text-black p-4 group transition-all duration-300 ease-linear shadow-[0px_5px_15px_rgba(0,0,0,0.35)] dark:shadow-[rgba(255,255,255,0.089)_0px_0px_7px_5px] ${
                      paymentMethod === "dollar" ? "ring-4" : "ring-1"
                    }`}
                  >
                    <span className="block font-bold">One-off Payment</span>
                    <span className="block">&#8358;200</span>

                    <span className="block mb-4 border-[2px] border-[#81ba40] dark:border-[#70dbb8] group-hover:border-white dark:group-hover:border-black w-[200px] py-1 font-bold rounded-3xl">
                      {paymentMethod === "dollar" ? (
                        <span className="flex gap-2 items-center justify-center">
                          Selected <FaCheck />
                        </span>
                      ) : (
                        "Select"
                      )}
                    </span>
                  </button>
                </section>
              )}

              {!user && (
                <p className="flex items-center justify-center text-sm max-[370px]:text-xs text-red-500 mb-4 mt-8">
                  <AiFillWarning className="text-2xl max-[370px]:text-lg" />
                  You need to&nbsp;
                  <Link
                    className="uppercase underline font-bold"
                    onClick={() => {
                      showForm("#sign_in");
                    }}
                  >
                    Sign in{" "}
                  </Link>
                  &nbsp;or&nbsp;
                  <Link
                    className="uppercase underline font-bold"
                    onClick={() => {
                      showForm("#register_user");
                    }}
                  >
                    Register
                  </Link>
                  &nbsp;to continue.
                </p>
              )}

              {user && paymentMethod && !user.premium_member && (
                <div className="flex justify-center">
                  <section className="mt-[-30px] flex-[0_1_490px] min-[450px]:text-xl">
                    <p className="font-bold flex justify-between">
                      <span>Total amount to be paid</span>

                      <span>-</span>

                      {paymentMethod === "naira" ? (
                        <span>&#8358;100 NGN</span>
                      ) : (
                        <span>&#8358;200 NGN</span>
                      )}
                    </p>

                    {/* NOTE: THIS SECTION THAT SHOWS A FORM FOR THE USER TO INPUT THEIR CARD DETAILS WAS NOT USED, BECAUSE PAYSTACK HAS IT OWN FORM */}
                    {false && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
                        className="mb-16"
                      >
                        <div className="flex flex-col-reverse mb-8 relative mt-16">
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="1111 2222 3333 4444"
                            maxLength={19}
                            id="cardNumber"
                            value={formatValue(cardNumber)}
                            onChange={(e) => {
                              setCardNumber(e.target.value);
                            }}
                            className="h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:ring-gray-600 disabled:text-gray-400"
                          />

                          <p
                            className="absolute top-2 right-3 cursor-text pointer-events-none text-xl"
                            aria-label="Credit card front"
                            title="Credit card front"
                          >
                            <BsCreditCard2FrontFill className="text-[#81ba40] dark:text-[#70dbb8]" />
                          </p>

                          <label
                            htmlFor="cardNumber"
                            className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
                          >
                            Card Number&nbsp;
                            <span className="text-red-500">&#42;</span>
                          </label>
                        </div>

                        <div className="min-[500px]:flex justify-between items-center">
                          <div className="mb-8">
                            <label
                              htmlFor="ExpiryDate"
                              className="block mb-2 text-xl"
                            >
                              Expiry Date
                            </label>

                            <select
                              id="ExpiryDate"
                              required
                              className="w-[100px] h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 mr-8"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Month
                              </option>

                              {monthOption}
                            </select>

                            <select
                              required
                              className="w-[100px] h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Year
                              </option>

                              {yearOption}
                            </select>
                          </div>

                          <div className="flex flex-col-reverse mb-8 relative mt-16 min-[500px]:mt-0 min-[500px]:mb-0 max-w-[100px]">
                            <input
                              type="number"
                              required
                              placeholder="123"
                              maxLength={3}
                              id="cvv"
                              value={formatCVV(CVV)}
                              onChange={(e) => {
                                setCVV(e.target.value);
                              }}
                              className="h-10 rounded-xl ring-2 ring-[#81ba40] dark:ring-[#70dbb8] p-1 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:ring-gray-600 disabled:text-gray-400"
                            />

                            <p
                              className="absolute top-2 left-[4.5rem] text-xl cursor-text pointer-events-none"
                              aria-label="Credit card back"
                              title="Credit card back"
                            >
                              <BsCreditCard2Back className="text-[#81ba40] dark:text-[#70dbb8]" />
                            </p>

                            <label
                              htmlFor="cvv"
                              className="cursor-text text-xl p-1 absolute peer-placeholder-shown:top-[50%] peer-placeholder-shown:translate-y-[-50%] peer-focus:top-[-90%] peer-focus:translate-y-[0] top-[-90%] transition-all duration-500 ease-linear"
                            >
                              CVV&nbsp;
                              <span className="text-red-500">&#42;</span>
                            </label>
                          </div>
                        </div>
                      </form>
                    )}

                    <button
                      type="button"
                      disabled={false}
                      autoFocus
                      onClick={payWithPaystack}
                      className="w-full mt-8 font-bold uppercase relative flex items-center justify-center px-6 py-3 text-lg tracking-tighter text-white bg-gray-800 rounded-md group"
                    >
                      <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-black dark:bg-white rounded-md group-hover:mt-0 group-hover:ml-0"></span>
                      <span className="absolute inset-0 w-full h-full bg-[#81ba40] dark:bg-[#70dbb8] rounded-md "></span>
                      <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-black dark:bg-white rounded-md opacity-0 group-hover:opacity-100 "></span>
                      <span className="relative text-black transition-colors duration-200 ease-in-out delay-100 group-hover:text-white dark:group-hover:text-black flex items-center">
                        Pay
                      </span>
                    </button>
                  </section>
                </div>
              )}
            </div>
          )}
        </main>

        {userLoading && (
          <div className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] w-full h-full">
            <div className="fixed top-1/2 left-1/2 z-10">
              <Loader />
            </div>
          </div>
        )}
      </>
    </>
  );
};

export default Membership;
