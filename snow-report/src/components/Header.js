// src/components/Header.js
import React from 'react';
import Nav from './Nav';
import 'C:\Users\noahp\OneDrive\Documents\snowreport-react\snow-report\src\App.css'

const Header = () => {
  return (
    <section id="header">
      <div className="container">
        <h1 id="logo"><a href="index.html">Snow Report</a></h1>
        <p>A site built by winter athletes for winter athletes</p>
        <br />
        <a href="SPA.html" className="button">Get Started</a>
        <Nav />
      </div>
    </section>
  );
};

export default Header;
