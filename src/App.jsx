import React, { useState, useEffect } from "react";
import Lenis from "lenis";
import Scene from "./Scene";
import "./styles.css";

// ---- Edit content here ----------------------------------------------------
const LINKS = {
  linktree: "https://linktr.ee/manchester.intelligence",
  mis: "https://manchesterintelligencesociety.com/",
  email: "manchester.intelligence@manchesterstudentsunion.com",
};

const DAYS = [
  { day: "Saturday 12 December", name: "Solutions Track", who: "For the techies",
    text: "Build security tools, data collection and analytics, and intelligence tooling against a realistic brief. Judged and awarded the same day." },
  { day: "Sunday 13 December", name: "Analysis Track", who: "For the non-techies",
    text: "Work geopolitical scenarios, historical case reports, personal investigations and incident response. No coding or cyber background needed." },
];
const STAGES = [
  ["Mission Start", "Teams are set, the brief drops, the clock starts."],
  ["Tactical Shift", "After lunch the focus changes. Sponsor sessions and side-missions keep the day moving."],
  ["Commit Point", "Final push. Lock your approach and get ready to submit."],
  ["Debrief", "Pitch to the judges, then prizes and closing talk."],
];
const SIDE = ["Military bootcamp", "Morse code", "Minute cryptic wordplay", "Linguistics puzzles", "Laser room", "Memory test", "Reaction time", "Scavenger hunt", "Best dressed", "Secret agent"];

const SPONSORS = [ // swap `logo` for an image path and `url` for the real link
  { name: "Title sponsor", logo: null, url: null, title: true },
  { name: "Sponsor 01", logo: null, url: null },
  { name: "Sponsor 02", logo: null, url: null },
  { name: "Sponsor 03", logo: null, url: null },
  { name: "Sponsor 04", logo: null, url: null },
  { name: "Sponsor 05", logo: null, url: null },
];

const TEAM = [
  { name: "Ern Qi Teng", role: "Hackathon lead", file: "001", photo: null },
  { name: "Niya Maju", role: "Hackathon team member", file: "002", photo: null },
  { name: "Meer Hama Aziz", role: "Hackathon team member", file: "003", photo: null },
  { name: "Abdul Khan Bibi", role: "Hackathon team member", file: "004", photo: null },
]; // when a photo is ready set photo: "/team/name.jpg" (put the file in your public folder)

const FAQ = [
  ["What is SpyHack?", "The UK's first student-led intelligence and national security hackathon, run by the Manchester Intelligence Society. Over two days you work real-world style challenges as part of an intelligence team."],
  ["Who can take part?", "Students from any university and any discipline. Computer science, cyber, politics, law, history, languages, psychology and more are all welcome."],
  ["I'm new to this. Do I need experience?", "No. The event is open to all disciplines, and there is a challenge for techies and non-techies. The Analysis Track needs no cyber, intelligence or coding background."],
  ["What if I don't have a team?", "Don't worry. We will help you form a team on the day. Mixed teams of technical and non-technical students are encouraged."],
  ["I'm an external student. Can I still apply?", "Yes. Use your university email address and sign up as an external member on our Students' Union website."],
  ["Do I have to pick one track?", "No. Each track runs on its own day, so you can take part in both."],
  ["Will I get an internship?", "It is great for your CV and a chance to meet employers and recruiters. Internships may be among the prizes, but nothing is confirmed yet."],
];
// ---------------------------------------------------------------------------

const START = Date.UTC(2026, 11, 12); // 12 Dec 2026 00:00 (GMT = UK time in December)
function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const d = START - now;
  if (d <= 0) return <p className="count__done">Mission underway</p>;
  const u = [["days", Math.floor(d / 864e5)], ["hrs", Math.floor(d / 36e5) % 24], ["min", Math.floor(d / 6e4) % 60], ["sec", Math.floor(d / 1e3) % 60]];
  return (
    <div className="count" role="timer" aria-label="Time until SpyHack begins">
      <p>Mission begins in</p>
      <div>{u.map(([l, v]) => <span key={l}><b>{String(v).padStart(2, "0")}</b>{l}</span>)}</div>
    </div>
  );
}
const Rv = ({ i = 0, as: T = "div", className = "", ...p }) => <T className={`rv ${className}`} style={{ "--d": `${i * 90}ms` }} {...p} />;

const H = ({ children }) => <h2 className="sec__h rd">{children}</h2>;

export default function App() {
  const [open, setOpen] = useState(0);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--sy", scrollY);
        root.style.setProperty("--p", scrollY / (root.scrollHeight - innerHeight || 1));
      });
    };
    const onMove = (e) => { root.style.setProperty("--mx", e.clientX + "px"); root.style.setProperty("--my", e.clientY + "px"); };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".rv,.rd").forEach((n) => io.observe(n));
    onScroll();
    // Weighty inertial scroll (skipped for reduced motion; touch keeps native momentum)
    let lenis, id;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lenis = new Lenis({ lerp: 0.06, wheelMultiplier: 0.85 });
      lenis.on("scroll", ({ velocity }) => root.style.setProperty("--vel", Math.max(-40, Math.min(40, velocity))));
      const loop = (t) => { lenis.raf(t); id = requestAnimationFrame(loop); };
      id = requestAnimationFrame(loop);
    }
    const onClick = (e) => {
      const l = e.target.closest('a[href^="#"]');
      const tg = l && document.querySelector(l.getAttribute("href"));
      if (tg && lenis) { e.preventDefault(); lenis.scrollTo(tg, { offset: -70, duration: 2 }); }
    };
    document.addEventListener("click", onClick);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    return () => { cancelAnimationFrame(id); lenis && lenis.destroy(); document.removeEventListener("click", onClick); io.disconnect(); removeEventListener("scroll", onScroll); removeEventListener("pointermove", onMove); };
  }, []);

  return (
    <>
      <Scene />
      <div className="fx" aria-hidden="true" />
      <div className="bar" aria-hidden="true" />
      <header className="nav">
        <a href="#top" className="nav__logo">SPYHACK</a>
        <button className="nav__btn" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? "Close" : "Menu"}</button>
        <nav className={menu ? "open" : ""} onClick={() => setMenu(false)}>
          {["about", "schedule", "sponsors", "team", "faq"].map((s) => <a key={s} href={`#${s}`}>{s}</a>)}
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <p className="hero__org">The Manchester Intelligence Society presents</p>
          <h1 className="hero__title">SPY<br />HACK</h1>
          <p className="hero__lead">The UK's first student-led intelligence and national security hackathon.</p>
          <div className="hero__meta">
            <span className="stamp">СЕКРЕТНО</span>
            <div><small>Date</small><strong>12–13 December 2026</strong></div>
            <div><small>Format</small><strong>2 days · 2 tracks</strong></div>
          </div>
          <Countdown />
          <div className="cta">
            <a className="btn btn--red" href={LINKS.linktree} target="_blank" rel="noreferrer">Follow the mission</a>
            <a className="btn" href="#about">Read the brief</a>
          </div>
          <span className="cue" aria-hidden="true" />
        </section>


        <section id="about" className="sec">
          <H>Mission brief</H>
          <div className="about">
            <Rv as="p" className="about__big">Built by MIS, SpyHack fuses technical problem-solving with non-technical strategy. Coders, creatives, analysts and policy thinkers operate like an intelligence team under time pressure. It's immersive, fast and engineered for impact.</Rv>
            <Rv i={1} className="panel">
              <h3>Why we're doing this</h3>
              <p>Intelligence work is interdisciplinary. It demands technical skill, analytical rigour and decisions under pressure, yet students rarely practise these together before entering the field.</p>
              <p>SpyHack closes that gap. The next generation of analysts, engineers and policymakers should train together, not apart.</p>
            </Rv>
            <Rv i={2} className="panel panel--red">
              <h3>Who it's for</h3>
              <ul>
                <li><b>Technical students</b> in CS, cyber, data science and engineering</li>
                <li><b>Non-technical students</b> in politics, IR, law, history, languages and psychology</li>
                <li><b>Beginners</b> who have never done a CTF or hackathon</li>
              </ul>
              <p className="quote">An event of the students, by the students, for the students.</p>
            </Rv>
          </div>
          <ul className="gets">
            {["Portfolio-worthy experience in OSINT, investigations and incident response", "Exposure to real tools and techniques used in industry", "Networking with sponsors, professionals and peers", "Prizes: details to be announced"].map((g, i) => <Rv as="li" i={i} key={g}>{g}</Rv>)}
          </ul>
        </section>

        <section id="schedule" className="sec">
          <H>Schedule</H>
          <Rv as="p" className="sec__sub">A two-day event on 12 and 13 December. One track per day, so you can do both. Detailed timings will be confirmed closer to the event.</Rv>
          <div className="days">
            {DAYS.map((d, i) => (
              <Rv i={i} className="panel day" key={d.name}>
                <div className="day__n">{i + 1}</div>
                <p className="day__date">{d.day}</p>
                <h3>{d.name}</h3>
                <p className="day__who">{d.who}</p>
                <p>{d.text}</p>
              </Rv>
            ))}
          </div>
          <h3 className="side__h rd">Each day runs in stages</h3>
          <ol className="tl rv">
            {STAGES.map(([t, d]) => <li key={t}><h4>{t}</h4><p>{d}</p></li>)}
          </ol>
          <h3 className="side__h rd">Side-missions</h3>
          <Rv as="p" className="sec__sub">Bite-sized challenges spread across both days. Some are announced just 15 minutes before they start.</Rv>
          <ul className="chips">{SIDE.map((s, i) => <Rv as="li" i={i % 5} key={s}>{s}</Rv>)}</ul>
        </section>

        <section id="sponsors" className="sec">
          <H>Sponsors</H>
          <Rv as="p" className="sec__sub">Sponsors to be announced. Challenges and prizes are still being confirmed.</Rv>
          <div className="spons">
            {SPONSORS.map((s, i) => {
              const Tag = s.url ? "a" : "div";
              return (
                <Rv as={Tag} i={i % 3} key={s.name} className={`spon ${s.title ? "spon--title" : ""}`} {...(s.url ? { href: s.url, target: "_blank", rel: "noreferrer" } : {})}>
                  {s.logo ? <img src={s.logo} alt={s.name} /> : <><i /><i /><span>[ redacted ]</span></>}
                  <small>{s.name}</small>
                </Rv>
              );
            })}
          </div>
        </section>

        <section id="team" className="sec">
          <H>The team</H>
          <div className="team">
            {TEAM.map((m, i) => (
              <Rv i={i} className="panel agent" key={m.name}>
                <div className="agent__photo">{m.photo ? <img src={m.photo} alt={m.name} /> : <><span>{m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span><small>photo tbd</small></>}</div>
                <p className="agent__file">ДЕЛО № {m.file}</p>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </Rv>
            ))}
          </div>
        </section>

        <section id="faq" className="sec">
          <H>FAQ</H>
          <Rv className="faq">
            {FAQ.map(([q, a], i) => (
              <div className={`faq__i ${open === i ? "is-open" : ""}`} key={q}>
                <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{q}</span><b aria-hidden="true" />
                </button>
                <div className="faq__a"><div><p>{a}</p></div></div>
              </div>
            ))}
          </Rv>
          <Rv as="p" className="faq__more">Still have a question? <a href={`mailto:${LINKS.email}`}>Email us</a></Rv>
        </section>
      </main>

      <footer className="foot">
        <Rv as="h2">From curiosity to capability.</Rv>
        <div className="cta cta--c">
          <a className="btn" href={LINKS.linktree} target="_blank" rel="noreferrer">Follow the mission</a>
          <a className="btn btn--ghost" href={LINKS.mis} target="_blank" rel="noreferrer">Visit MIS</a>
        </div>
        <div className="foot__cols">
          <div><h4>Event</h4><a href="#about">About</a><a href="#schedule">Schedule</a><a href="#sponsors">Sponsors</a></div>
          <div><h4>People</h4><a href="#team">Team</a><a href="#faq">FAQ</a></div>
          <div><h4>Connect</h4><a href={LINKS.linktree} target="_blank" rel="noreferrer">Linktree</a><a href={LINKS.mis} target="_blank" rel="noreferrer">MIS website</a><a href={`mailto:${LINKS.email}`}>Email</a></div>
        </div>
        <p className="foot__note">SpyHack is organised by the Manchester Intelligence Society, a society for University of Manchester students. All challenge data is synthetic, fictional or public. Released under the MIT licence.</p>
        <p className="foot__note">© 2026 The Manchester Intelligence Society</p>
      </footer>
    </>
  );
}