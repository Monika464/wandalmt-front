import React from "react";
import PageNav from "./PageNav";
import LogoutButton from "../components/LogoutButton";

const Homepage = () => {
  return (
    <div>
      <PageNav />
      <div>homepage</div>
      <LogoutButton />
    </div>
  );
};

export default Homepage;
