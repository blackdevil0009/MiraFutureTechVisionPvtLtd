import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scroller } from 'react-scroll';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Domains from '../components/sections/Domains';
import Projects from '../components/sections/Projects';
import Internship from '../components/sections/Internship';
import Careers from '../components/sections/Careers';
import Contact from '../components/sections/Contact';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      scroller.scrollTo(location.state.scrollTo, {
        duration: 500,
        delay: 0,
        smooth: 'easeInOutQuart',
        offset: -80,
      });
    }
  }, [location]);

  return (
    <>
      <Hero />
      <About />
      <Domains />
      <Projects />
      <Internship />
      <Careers />
      <Contact />
    </>
  );
};

export default Home;
