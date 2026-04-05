import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="landing-footer">
    <div className="landing-footer__brand">
      <span className="landing-footer__mark">
        <Sparkles size={16} />
      </span>
      <div>
        <strong>Supratik Space</strong>
        <p>Turn public repos into pages that feel ready to share.</p>
      </div>
    </div>

    <div className="landing-footer__links">
      <a href="https://github.com/supratikcsqa/supratikspace" target="_blank" rel="noreferrer">
        Repository
        <ArrowUpRight size={14} />
      </a>
      <a href="https://github.com/supratikpm/GitMe" target="_blank" rel="noreferrer">
        GitMe
        <ArrowUpRight size={14} />
      </a>
      <a href="https://www.linkedin.com/in/supratik-kundu" target="_blank" rel="noreferrer">
        LinkedIn
        <ArrowUpRight size={14} />
      </a>
    </div>
  </footer>
);

export default Footer;
