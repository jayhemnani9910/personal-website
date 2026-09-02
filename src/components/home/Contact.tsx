import { COPY } from "@/data/home";
import { SITE_CONFIG } from "@/../content/site";

const MONO = 'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint';
const MONO_ROW = 'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-mute';

const SOCIAL_ROWS: { label: string; url: string; handle: string }[] = [
  { label: "github", url: SITE_CONFIG.social.github, handle: SITE_CONFIG.social.github.replace("https://github.com/", "") },
  {
    label: "linkedin",
    url: SITE_CONFIG.social.linkedin,
    handle: SITE_CONFIG.social.linkedin.replace("https://linkedin.com", ""),
  },
  { label: "x", url: SITE_CONFIG.social.twitter, handle: `@${SITE_CONFIG.social.twitter.replace("https://x.com/", "")}` },
  {
    label: "youtube",
    url: SITE_CONFIG.social.youtube,
    handle: SITE_CONFIG.social.youtube.replace("https://youtube.com/", ""),
  },
];

export function Contact() {
  const [mailUser, mailHost] = SITE_CONFIG.social.email.split("@");

  return (
    <section id="contact" aria-labelledby="contact-h2" className="border-t border-tr-hairline py-[clamp(4rem,8vw,7rem)] max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)]">
      <h2 id="contact-h2" className="sr-only">
        Contact
      </h2>
      <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[clamp(2rem,5vw,5rem)] items-end">
        <div className="min-w-0">
          <p className={`${MONO} mb-4`}>{COPY.contactLabel}</p>
          <a
            href={`mailto:${SITE_CONFIG.social.email}`}
            data-cursor="WRITE"
            className="block text-[length:var(--tr-t-mail)] tracking-[-.035em] font-medium leading-[var(--tr-lh-display)] [overflow-wrap:anywhere]"
          >
            {mailUser}
            <wbr />@{mailHost}
          </a>
          <p className="mt-6 max-w-[52ch] text-tr-text-mute [text-wrap:pretty]">{COPY.contactDeck}</p>
        </div>

        <div className="flex flex-col">
          {SOCIAL_ROWS.map((row, i) => (
            <a
              key={row.label}
              href={row.url}
              data-cursor="OPEN"
              className={`flex justify-between py-[.6rem] border-t border-tr-hairline ${MONO_ROW} ${
                i === SOCIAL_ROWS.length - 1 ? "border-b" : ""
              }`}
            >
              <span>{row.label}</span>
              <span className="text-tr-text-faint">{row.handle} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
