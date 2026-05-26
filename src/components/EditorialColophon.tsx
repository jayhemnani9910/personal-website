import Link from "next/link";
import { Buddy } from "@/components/Buddy";

export function EditorialColophon() {
  return (
    <footer>
      <div className="colophon">
        <div>
          <p className="imprint">A personal portfolio,<br />set in Newsreader and Geist.</p>
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
      <div className="colophon-buddy-wrap">
        <Buddy variant="full" className="colophon-buddy" />
      </div>
      <div className="colophon-bottom">
        <span>© 2026 Jay Hemnani · All rights reserved, most reserved gently.</span>
      </div>
    </footer>
  );
}
