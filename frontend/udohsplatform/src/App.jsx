import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Page_Components/HomePage";

import { useState } from "react";
import axios from "axios";
import Header from "./Page_Components/Header";
import Footer from "./Page_Components/Footer";
import Membership from "./Page_Components/Membership";
import AllArticles from "./Page_Components/AllArticles";

axios.defaults.xsrfCookieName = "csrftoken"; // NOTE: So, here we want to make sure that all our axios requests will be sent out with this csrftoken in the head
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

// NOTE: Here, we create an axios instance with the django's base URL, so we only have to type in the django's base URL just once
const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withCredentials: true,
});

const SubmitRegistration = (e) => {
  const [currentUser, setCurrentUser] = useState(null);
  e.preventDefault();
  axiosClient
    .post("/api/registration", {
      email: "sunday@gmail.com",
      password: "12345678",
    })
    .then((res) => {
      if (res.status == 201) {
        axiosClient
          .post("/api/login", {
            email: "sunday@gmail.com",
            password: "12345678",
          })
          .then((res) => {
            setCurrentUser(res.data);
            print(currentUser);
          });
      }
    });
};

const run = false;
if (run) {
  SubmitRegistration();
}

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" Component={HomePage} />
        <Route path="/membership" Component={Membership} />
        <Route path="/allArticles" Component={AllArticles} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
