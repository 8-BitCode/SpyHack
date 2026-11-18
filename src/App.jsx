import React, { useEffect, useState } from "react";
import Crt from "./Crt";
import Recon from "./Recon";
import ern from "./Assets/opt/Ern.webp";
import niya from "./Assets/opt/Niya.webp";
import meer from "./Assets/opt/Meer.webp";
import abdul from "./Assets/opt/Abdul.webp";
import arcx from "./Assets/opt/arcX.webp";
import ncc from "./Assets/opt/NCC.webp";
import riscs from "./Assets/opt/RISCS.webp";
import thm from "./Assets/opt/THM.webp";
import canva from "./Assets/opt/Canva.webp";
import newrali from "./Assets/opt/Newrali.webp";
import softcat from "./Assets/opt/Softcat.webp";
import hackuk from "./Assets/opt/HackathonsUK.webp";
import "./styles.css";

// ---- Edit content here ----------------------------------------------------
const LINKS = {
  register: "https://luma.com/hxjlivs9",
  linktree: "https://linktr.ee/manchester.intelligence",
  mis: "https://manchesterintelligencesociety.com/",
  email: "manchester.intelligence@manchesterstudentsunion.com",
  w3w: "https://what3words.com/crass.tilt.noise",
  maps: "https://www.google.com/maps/search/?api=1&query=Nancy+Rothwell+Building+Booth+St+E+Manchester+M13",
  access: "https://www.accessable.co.uk/the-university-of-manchester/access-guides/nancy-rothwell-building",
  cti101: "https://arcx.io",
  hackuk: "https://hackathons.org.uk",
};

// 08:00 UK time on 12 Dec 2026 (GMT, so UTC)
const START = Date.UTC(2026, 11, 12, 8);

const STATS = [
  ["150+", "hackers"],
  ["£10k+", "in prizes"],
  ["2", "tracks"],
  ["13", "hours"],
];

const TRACKS = [
  { k: "A", name: "Solutions", who: "For the techies",
    text: "Build with a security and data focus: security tools, data collection and analytics, intelligence tooling.",
    tags: ["Security tools", "Data & analytics", "Intel tooling"] },
  { k: "B", name: "Analysis", who: "For the non-techies",
    text: "Work geopolitical situations, real or invented scenario reports, personal investigations and incident response. No coding needed.",
    tags: ["Geopolitics", "Investigations", "Incident response"] },
];

// Keep times broad on the site: only start and end are shown.
const PHASES = [
  ["Doors open", "Registration and lanyards. Arrive solo or as a team."],
  ["Opening ceremony", "The brief, the challenges, the sponsors and the prizes."],
  ["Stage 1 · Mission start", "Teams are locked in and challenges open."],
  ["Stage 2 · Ground zero", "New intelligence drops. The challenge shifts."],
  ["Submission", "Lock your solution and get ready to pitch."],
  ["Judging & closing", "Pitch to the judges, then winners and prizes."],
];

const PROGRAMME = [
  ["Workshop", "Cyber Threat Intelligence 101", "with NCC Group"],
  ["Workshop", "Cryptography", "with Daniel Shiu"],
  ["Workshop", "Bomb Threat Intelligence Exercise", "team-based, with Mark Webster"],
  ["Panel", "Careers in intelligence & cyber", "with speakers from the day"],
  ["Fuel", "Lunch, dinner & networking", "buffet-style, with a movie screening"],
];

const QUESTS = ["Cup stacking with Hackathons UK", "Intelligence Kahoot", "Minute cryptic", "Puzzle station", "Morse code", "Best dressed [spy]", "Scavenger hunt", "Military bootcamp", "Secret agent"];

const PRIZES = [
  "Top submissions in each track",
  "Best use of a sponsor's tools",
  "Most creative solution",
  "Best presentation",
  "Sponsor challenge prizes",
  "Quest prizes through the day",
];

// tier only changes the tile border: "diamond" | "gold" | "silver"
const SPONSORS = [
  { name: "arcX", logo: arcx, tier: "diamond", url: "https://arcx.io" },
  { name: "NCC Group", logo: ncc, tier: "diamond", url: "https://www.nccgroup.com" },
  { name: "RISCS", logo: riscs, tier: "gold", url: "https://www.riscs.org.uk", tint: true },
  { name: "Newrali", logo: newrali, tier: "gold", url: "https://newrali.com", label: true },
  { name: "Softcat", logo: softcat, tier: "gold", url: "https://www.softcat.com", tint: true },
  { name: "TryHackMe", logo: thm, tier: "silver", url: "https://tryhackme.com" },
  { name: "Canva", logo: canva, tier: "silver", url: "https://www.canva.com", tint: true },
];

const TEAM = [
  { name: "Ern Qi Teng", role: "Hackathon lead", photo: ern },
  { name: "Niya Maju", role: "Hackathon team", photo: niya },
  { name: "Meer Hama Aziz", role: "Hackathon team", photo: meer },
  { name: "Abdul Khan Bibi", role: "Hackathon team", photo: abdul },
];

const FAQ = [
  ["What is SpyHack?", "SpyHack is the UK's first student-led intelligence and national security hackathon, run by the Manchester Intelligence Society. It's a one-day, high-intensity event where you work real-world style challenges as part of an intelligence team, against the clock."],
  ["Who can participate?", "Undergraduate and postgraduate students from any university and any discipline: computer science, cyber, politics, IR, law, history, languages, psychology and more. You must be 18 or over on the day."],
  ["Do I need experience?", "No. The Analysis Track needs no cyber, intelligence or coding background, and the quests are built for everyone. If you've never done a hackathon or CTF, this is a good first one."],
  ["Why should I take part?", "Portfolio-worthy experience in OSINT, investigations and incident response, hands-on time with tools used in industry, workshops and a careers panel, the chance to meet sponsors and recruiters, and £10k+ in prizes."],
  ["How do the teams work?", "Teams are 2 to 5 people. Mixed teams of technical and non-technical students are encouraged. Coming solo? We'll match you with a team on the day. Teams are finalised at the registration desk before Stage 1 starts."],
  ["Do I have to choose a track?", "No. The Solutions and Analysis tracks run in parallel and you can take on challenges from both."],
  ["What does SpyHack provide?", "Food and drink all day. We can't offer travel or accommodation support. Dietary and accessibility needs are collected when you register."],
  ["What should I bring?", "A laptop and charger, and anything you need to be comfortable for a long day. Spy-themed outfits are encouraged for the best-dressed quest."],
];
// ---------------------------------------------------------------------------

// Inline redaction bar that slides away when scrolled into view.
const X = ({ children }) => <span className="x">{children}</span>;

const Head = ({ n, kicker, children, id }) => (
  <header className="head">
    <span className="head__n" aria-hidden="true">{n}</span>
    <p className="head__k">{kicker}</p>
    <h2 id={id} className="head__t">{children}</h2>
  </header>
);

const Ext = (p) => <a target="_blank" rel="noopener noreferrer" {...p} />;
const Arrow = () => <svg className="arr" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>;

export default function App() {
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const els = document.querySelectorAll(".x,.rv");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
    els.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    const k = (e) => e.key === "Escape" && setMenu(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [menu]);

  const nav = [["brief", "Brief"], ["tracks", "Tracks"], ["day", "The day"], ["prizes", "Prizes"], ["venue", "Venue"], ["sponsors", "Sponsors"], ["faq", "FAQ"]];

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>

      <header className="nav">
        <a href="#top" className="nav__logo" aria-label="SpyHack home">SPY<span>/</span>HACK</a>
        <nav id="menu" className={`nav__links${menu ? " open" : ""}`} aria-label="Sections">
          {nav.map(([id, l], i) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}><small>0{i + 1}</small>{l}</a>)}
        </nav>
        <div className="nav__end">
          <Ext className="btn btn--sm" href={LINKS.register}>Register</Ext>
          <button className="nav__btn" aria-expanded={menu} aria-controls="menu" onClick={() => setMenu(!menu)}>
            <span className="sr">{menu ? "Close menu" : "Open menu"}</span>
            <i aria-hidden="true" /><i aria-hidden="true" />
          </button>
        </div>
      </header>

      <main id="main">
        {/* ---------------- HERO ---------------- */}
        <section className="hero" id="top" aria-labelledby="title">
          <div className="hero__top">
            <p>The Manchester Intelligence Society presents</p>
            <p className="hero__file">File № SH-2026 <span>· Clearance: all students</span></p>
          </div>

          <h1 id="title" className="sr">SpyHack</h1>
          <Crt />

          <div className="hero__grid">
            <p className="hero__lead">The UK's first student-led <em>intelligence &amp; national security</em> hackathon.</p>
            <dl className="facts">
              <div><dt>Date</dt><dd>Sat 12.12.2026</dd></div>
              <div><dt>Time</dt><dd>08:00 – 21:00</dd></div>
              <div><dt>Place</dt><dd>Nancy Rothwell Building, Manchester</dd></div>
            </dl>
            <div className="hero__cta">
              <Ext className="btn btn--xl" href={LINKS.register}>Register now <Arrow /></Ext>
            </div>
          </div>

          <a className="headline" href="#arcx">
            <span>Headline sponsor</span>
            <img src={arcx} alt="arcX" width="700" height="368" />
          </a>
        </section>

        <div className="ticker" aria-hidden="true">
          <div>{Array.from({ length: 2 }).map((_, k) => <span key={k}>12.12.2026 ✦ 150+ hackers ✦ £10k+ prizes ✦ Solutions × Analysis ✦ Nancy Rothwell Building ✦ any discipline ✦ teams of 2–5 ✦ </span>)}</div>
        </div>

        {/* ---------------- BRIEF ---------------- */}
        <section id="brief" className="sec sec--paper" aria-labelledby="h-brief">
          <Head n="01" kicker="Mission brief" id="h-brief">One day. Any discipline. <X>Real problems.</X></Head>
          <p className="big rv">
            Coders, creatives, analysts and policy thinkers operate as <X>an intelligence team</X>, collecting, analysing and acting on information <X>against the clock</X>. Intelligence work is interdisciplinary. The people who do it should <X>train together, not apart.</X>
          </p>

          <ul className="stats" aria-label="At a glance">
            {STATS.map(([v, l]) => <li key={l} className="rv"><b>{v}</b><span>{l}</span></li>)}
          </ul>

          <div className="who">
            <h3 className="who__h">Built for</h3>
            <ul>
              <li className="rv"><b>Techies</b><span>CS, cyber, data science and engineering students who want to point their skills at real security problems.</span></li>
              <li className="rv"><b>Non-techies</b><span>Politics, IR, law, history, languages and psychology students who want hands-on investigation and briefing.</span></li>
              <li className="rv"><b>First-timers</b><span>Never done a CTF or hackathon? The tracks and quests are built to be accessible.</span></li>
            </ul>
            <p className="who__q">“An event of the students, by the students, for the students.”</p>
          </div>
        </section>

        {/* ---------------- HEADLINE SPONSOR ---------------- */}
        <section id="arcx" className="sec arcx" aria-labelledby="h-arcx">
          <p className="arcx__k">Headline sponsor</p>
          <h2 id="h-arcx" className="arcx__logo"><img src={arcx} alt="arcX" width="700" height="368" loading="lazy" /></h2>
          <blockquote className="arcx__q rv">
            <p>Intelligence needs people who ask difficult questions, challenge convincing stories and follow the evidence. That's why arcX is backing SpyHack with training in cyber threat intelligence and disinformation analysis. We want to help students turn their curiosity into the ability to investigate a problem, make a sound judgement and defend their conclusions.</p>
            <footer>arcX</footer>
          </blockquote>
          <Ext className="course rv" href={LINKS.cti101}>
            <span className="course__k">Free course · get a head start</span>
            <span className="course__t">Cyber Threat Intelligence 101</span>
            <span className="course__go">Start on arcx.io <Arrow /></span>
          </Ext>
        </section>

        {/* ---------------- TRACKS ---------------- */}
        <section id="tracks" className="sec" aria-labelledby="h-tracks">
          <Head n="02" kicker="Two tracks, in parallel" id="h-tracks">Pick a side. <br />Or play both.</Head>
          <div className="tracks">
            {TRACKS.map((t) => (
              <article className="track rv" key={t.k}>
                <span className="track__k" aria-hidden="true">{t.k}</span>
                <p className="track__who">{t.who}</p>
                <h3>{t.name}<span> track</span></h3>
                <p>{t.text}</p>
                <ul>{t.tags.map((g) => <li key={g}>{g}</li>)}</ul>
              </article>
            ))}
          </div>
          <p className="note rv">Both tracks run at the same time, and you can take on challenges from either. Mixed-discipline teams have the edge.</p>
        </section>

        {/* ---------------- THE DAY ---------------- */}
        <section id="day" className="sec" aria-labelledby="h-day">
          <Head n="03" kicker="Operation timeline" id="h-day">The day</Head>
          <div className="tl">
            <p className="tl__end"><b>08:00</b>Start</p>
            <ol>
              {PHASES.map(([t, d], i) => (
                <li key={t} className="rv" style={{ "--i": i }}>
                  <span className="tl__dot" aria-hidden="true" />
                  <h3>{t}</h3>
                  <p>{d}</p>
                </li>
              ))}
            </ol>
            <p className="tl__end"><b>21:00</b>End</p>
          </div>

          <div className="prog">
            <div>
              <h3 className="sub">On the programme</h3>
              <ul className="prog__list">
                {PROGRAMME.map(([k, t, s]) => (
                  <li key={t} className="rv"><small>{k}</small><b>{t}</b><span>{s}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="sub">Quests</h3>
              <p className="muted">Bite-sized side-missions through the day, some announced just 15 minutes before they start. Prizes up for grabs.</p>
              <ul className="chips">{QUESTS.map((q) => <li key={q}>{q}</li>)}</ul>
            </div>
          </div>
          <p className="note">Line-up subject to change. Full timings will be shared with participants closer to the day.</p>
        </section>

        {/* ---------------- PRIZES ---------------- */}
        <section id="prizes" className="sec sec--red" aria-labelledby="h-prizes">
          <p className="head__k">Prize pool</p>
          <h2 id="h-prizes" className="prize__big"><span className="sr">Over ten thousand pounds in prizes</span><span aria-hidden="true">£10k+</span></h2>
          <ul className="prize__list">
            {PRIZES.map((p, i) => <li key={p} className="rv"><small>{String(i + 1).padStart(2, "0")}</small>{p}</li>)}
          </ul>
        </section>

        {/* ---------------- VENUE ---------------- */}
        <section id="venue" className="sec venue" aria-labelledby="h-venue">
          <Head n="04" kicker="Rendezvous" id="h-venue">Nancy Rothwell Building</Head>
          <div className="venue__wrap">
          <Recon />
          <div className="venue__grid">
            <address className="venue__addr">
              University of Manchester<br />Booth St E<br />Manchester M13
            </address>
            <Ext className="w3w" href={LINKS.maps}>
              <span className="w3w__k">Directions</span>
              <span className="w3w__t">Open in Google Maps <Arrow /></span>
            </Ext>
            <ul className="venue__links">
              <li><Ext href={LINKS.access}>Accessibility guide (AccessAble) <Arrow /></Ext></li>
              <li><Ext href={LINKS.w3w}>what3words ///crass.tilt.noise <Arrow /></Ext></li>
            </ul>
            <p className="muted venue__note">Step-free access to the ground floor from every entrance. Nearest station: Manchester Oxford Road.</p>
          </div>
          </div>
        </section>

        {/* ---------------- SPONSORS ---------------- */}
        <section id="sponsors" className="sec" aria-labelledby="h-sponsors">
          <Head n="05" kicker="With thanks to" id="h-sponsors">Sponsors &amp; partners</Head>
          <ul className="logos">
            {SPONSORS.map((s) => {
              const inner = s.logo
                ? s.label
                  ? <span className="lockup"><img src={s.logo} alt="" loading="lazy" /><span className="word">{s.name}</span></span>
                  : <img src={s.logo} alt={s.name} loading="lazy" className={s.tint ? "tint" : ""} />
                : <span className="word">{s.name}</span>;
              return (
                <li key={s.name} className={`logo logo--${s.tier}`}>
                  {s.url ? <Ext href={s.url} aria-label={s.name}>{inner}</Ext> : <div>{inner}</div>}
                </li>
              );
            })}
          </ul>
          <div className="partner">
            <p className="head__k">Partner</p>
            <Ext className="partner__l" href={LINKS.hackuk}>
              <img src={hackuk} alt="Hackathons UK" width="700" height="175" loading="lazy" />
            </Ext>
          </div>
        </section>

        {/* ---------------- TEAM ---------------- */}
        <section id="team" className="sec" aria-labelledby="h-team">
          <Head n="06" kicker="Personnel files" id="h-team">The committee</Head>
          <ul className="team">
            {TEAM.map((m, i) => (
              <li key={m.name} className="agent rv">
                <div className="agent__ph"><img src={m.photo} alt="" loading="lazy" width="560" height="700" /></div>
                <small>File 00{i + 1}</small>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="sec sec--paper" aria-labelledby="h-faq">
          <Head n="07" kicker="Questions" id="h-faq">FAQ</Head>
          <div className="faq">
            {FAQ.map(([q, a], i) => (
              <details key={q} open={i === 0}>
                <summary><span>{q}</span><i aria-hidden="true" /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <p className="faq__more">Still have questions? <a href={`mailto:${LINKS.email}`}>Email us</a></p>
        </section>
      </main>

      <footer className="foot">
        <p className="foot__big">From curiosity<br />to capability.</p>
        <Ext className="btn btn--xl btn--ink" href={LINKS.register}>Register for SpyHack <Arrow /></Ext>
        <div className="foot__cols">
          <div><h3>Event</h3><a href="#brief">Brief</a><a href="#day">The day</a><a href="#venue">Venue</a><a href="#faq">FAQ</a></div>
          <div><h3>MIS</h3><Ext href={LINKS.mis}>Website</Ext><Ext href={LINKS.linktree}>Linktree</Ext><a href={`mailto:${LINKS.email}`}>Email us</a></div>
          <div><h3>Partner</h3><Ext href={LINKS.hackuk}>Hackathons UK</Ext></div>
        </div>
        <p className="foot__fine">SpyHack is run by the Manchester Intelligence Society, a University of Manchester student society. Participants must be 18+. All challenge data is synthetic, fictional or public, and all activity stays inside the provided environments. © 2026 The Manchester Intelligence Society.</p>
      </footer>
    </>
  );
}
