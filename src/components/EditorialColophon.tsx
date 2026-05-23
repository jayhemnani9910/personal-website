import Link from "next/link";

export function EditorialColophon() {
  return (
    <footer>
      <div className="colophon">
        <div>
          <p className="imprint">A quarterly-shaped portfolio,<br />set in Newsreader and Geist,<br />printed in Vol. IV.</p>
        </div>
        <div>
          <h4>Inside</h4>
          <Link href="/">Cover</Link>
          <Link href="/projects">Work</Link>
          <Link href="/blog">Writing</Link>
          <Link href="/resume">About</Link>
        </div>
        <div>
          <h4>Elsewhere</h4>
          <a href="https://github.com/jayhemnani9910" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/jayhemnani" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://x.com/jeyhemnani9" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://youtube.com/@jayhemnani" target="_blank" rel="noreferrer">YouTube</a>
        </div>
        <div>
          <h4>Imprint</h4>
          <a href="mailto:jayhemnani992000@gmail.com">jayhemnani992000@<wbr />gmail.com</a>
          <span className="muted small">Gujarat, India</span>
        </div>
      </div>
      <div className="colophon-bottom">
        <span>© 2026 Jay Hemnani · All rights reserved, most reserved gently.</span>
        <span className="tabular">№26 · May 2026 · v.1.0</span>
      </div>
    </footer>
  );
}
