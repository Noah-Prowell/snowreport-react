// src/components/Nav.js
import React from 'react';
import 'C:\Users\noahp\OneDrive\Documents\snowreport-react\snow-report\src\App.css';

const Nav = () => {
  return (
    <nav id="nav">
      <ul>
        <li>
          <a href="#" className="icon fa-chart-bar"><span>Areas</span></a>
          <ul>
            <li><a href="grandby.html">Granby</a></li>
            <li><a href="jones-pass.html">Jones Pass</a></li>
            <li><a href="loveland.html">Loveland Pass</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
