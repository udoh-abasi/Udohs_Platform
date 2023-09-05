import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Page_Components/HomePage";
import Header from "./Page_Components/Header";
import Footer from "./Page_Components/Footer";
import Membership from "./Page_Components/Membership";
import AllArticles from "./Page_Components/AllArticles";
import ProfilePage from "./Page_Components/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" Component={HomePage} />
        <Route path="/membership" Component={Membership} />
        <Route path="/allArticles" Component={AllArticles} />
        <Route path="/userProfile" Component={ProfilePage} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
