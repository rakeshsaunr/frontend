import React from "react";
import OfferZone from "./Offerzone";
import Collection from "./Collection";
import Explore from "./video/Explore";
import SuitSet from "./SuitSet";
import Footer1 from "./Footer/Footer1";
import About from "./Information/About";

const Home = () => {
  return (
    <div>
      <OfferZone />
      <Collection />
      <SuitSet />
      <Explore />
      <Footer1 />
      <About />
    </div>
  );
};

export default Home;
