import React, { useEffect, useState } from 'react';
import { Github, Sparkles } from 'lucide-react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
      <a href="#top" className="landing-nav__brand">
        <span className="landing-nav__mark">
          <Sparkles size={18} />
        </span>
        <span className="landing-nav__text">
          <strong>SUPRATIK.</strong>
          <small>Repo launch studio</small>
        </span>
      </a>

      <div className="landing-nav__links">
        <a href="#examples">Examples</a>
        <a href="#template-1">Template 1</a>
        <a href="#contribute">Contribute</a>
      </div>

      <a
        href="https://github.com/supratikcsqa/supratikspace"
        target="_blank"
        rel="noreferrer"
        className="landing-nav__github"
      >
        <Github size={14} />
        GitHub
      </a>
    </nav>
  );
};

export default Navbar;
