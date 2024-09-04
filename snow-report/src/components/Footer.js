// src/components/Footer.js
import React from 'react';


const Footer = () => {
  return (
    <section id="footer">
      <div className="container">
        <header>
          <h2>Questions or comments? <strong>Get in touch:</strong></h2>
        </header>
        <div className="row">
          <div className="col-6 col-12-medium">
            <section>
              <form method="post" action="#">
                <div className="row gtr-50">
                  <div className="col-6 col-12-small">
                    <input name="name" placeholder="Name" type="text" />
                  </div>
                  <div className="col-6 col-12-small">
                    <input name="email" placeholder="Email" type="text" />
                  </div>
                  <div className="col-12">
                    <textarea name="message" placeholder="Message"></textarea>
                  </div>
                  <div className="col-12">
                    <a href="#" className="form-button-submit button icon solid fa-envelope">Send Message</a>
                  </div>
                </div>
              </form>
            </section>
          </div>
          <div className="col-6 col-12-medium">
            <section>
              <p>Erat lorem ipsum veroeros consequat magna tempus lorem ipsum consequat Phaselamet mollis tortor congue. Sed quis mauris sit amet magna accumsan tristique. Curabitur leo nibh, rutrum eu malesuada.</p>
              <div className="row">
                <div className="col-6 col-12-small">
                  <ul className="icons">
                    <li className="icon solid fa-home">
                      1234 Somewhere Road<br />
                      Nashville, TN 00000<br />
                      USA
                    </li>
                    <li className="icon solid fa-phone">(000) 000-0000</li>
                    <li className="icon solid fa-envelope">
                      <a href="#">info@untitled.tld</a>
                    </li>
                  </ul>
                </div>
                <div className="col-6 col-12-small">
                  <ul className="icons">
                    <li className="icon brands fa-twitter"><a href="#">@untitled</a></li>
                    <li className="icon brands fa-instagram"><a href="#">instagram.com/untitled</a></li>
                    <li className="icon brands fa-dribbble"><a href="#">dribbble.com/untitled</a></li>
                    <li className="icon brands fa-facebook-f"><a href="#">facebook.com/untitled</a></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <div id="copyright" className="container">
        <ul className="links">
          <li>&copy; Untitled. All rights reserved.</li><li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
        </ul>
      </div>
    </section>
  );
};

export default Footer;
