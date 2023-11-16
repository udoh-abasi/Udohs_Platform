import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./Page_Components/Header";
import Footer from "./Page_Components/Footer";
import Membership from "./Page_Components/Membership";
import AllArticles from "./Page_Components/AllArticles";
import ProfilePage from "./Page_Components/ProfilePage";
import HomePage from "./Page_Components/HomePage";
import AccountPage from "./Page_Components/AccountPage";
import Read from "./Page_Components/Read";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { userSelector } from "./reduxFiles/selectors";
import Write from "./Page_Components/Write";
import Search from "./Page_Components/Search";
import OurStory from "./Page_Components/OurStory";
import PageNotFound from "./Page_Components/PageNotFound";

// const UnusedPrivateRoute = ({ children, user }) => {
//   if (user) {
//     return children;
//   } else {
//     return <Navigate to="/" replace />;
//   }
// };

const PrivateRoute = () => {
  let user = useSelector(userSelector);

  // So if we have a user or the user is loading, we return the JSX, else we navigate to the home page
  return user.userData || user.userLoading ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

function App() {
  // const user = useSelector(userSelector);
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/story" element={<OurStory />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/allArticles" element={<AllArticles />} />

        <Route path="/userProfile" element={<PrivateRoute />}>
          <Route path="/userProfile" element={<ProfilePage />} />
        </Route>

        <Route path="/account/:id" element={<AccountPage />} />

        <Route path="/read/:title/:articleID" element={<Read />} />

        <Route path="/write" element={<Write />} />

        <Route path="/search" element={<Search />} />

        <Route path="*" element={<PageNotFound />} />

        {/* <Route
          path="/userProfile"
          element={
            <UnusedPrivateRoute user={user}>
              <ProfilePage />
            </UnusedPrivateRoute>
          }
        /> */}
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
