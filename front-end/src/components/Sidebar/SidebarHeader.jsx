import React from 'react';
import { Facebook, Github, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function SidebarHeader({ toggleSidebar }) {
  return (
    <>
      {/* I assume that in this model.. may be all those be passed from or hardcoded
					sinse in the model of one person one course the whole deployed front-ned is kinda 
					acting as a separate app for that particular person..
					This is something we are not sattled on yet..
			*/}
      <div className="offcanvas-header">
        {/* Course logo or platform logo, I dont'know  */}
        <img src="https://picsum.photos/100" alt="Course Logo" />
        <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">
          Test Course
        </h5>

        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={toggleSidebar} // Close the sidebar
          aria-label="Close"
        ></button>
      </div>
      <p className="text-white">
        <a
          target="_blank"
          rel="noreferrer"
          href="https://cs.harvard.edu/malan/"
        >
          David J. Malan
        </a>
        <br />
        <a href="mailto:malan@harvard.edu">malan@harvard.edu</a>
        <br />
        <span className="mx-2">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.facebook.com/dmalan"
          >
            <Facebook />
          </a>
          <a target="_blank" rel="noreferrer" href="https://github.com/dmalan">
            <Github />
          </a>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.instagram.com/davidjmalan/"
          >
            <Instagram />
          </a>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.linkedin.com/in/malan/"
          >
            <Linkedin />
          </a>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://twitter.com/davidjmalan"
          >
            <Twitter />
          </a>
        </span>
      </p>
    </>
  );
}
