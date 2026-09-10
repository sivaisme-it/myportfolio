import BotanicalText from './components/BotanicalText.jsx';
import LetterDrop from './components/LetterDrop.jsx';

export default function Body() {
  return (
    <>


<canvas id="sky"></canvas>
<canvas id="ink"></canvas>
<div id="fade-scrim"></div>

{/*============ NAVBAR ============*/}
<div className="nav-wrap" id="nav-wrap">
  <nav className="navbar" id="navbar" aria-label="Primary">
    <a className="nav-link nav-logo" data-nav href="#hero" style={{ '--d': '120ms' }} aria-label="Home">
      <svg viewBox="0 0 22 24" aria-hidden="true">
        <path d="M11 1.3c-2.1 0-3.95 1.2-4.75 2.95C3.95 4.55 2.3 6.25 2.3 8.35c0 2.3 1.9 4.2 4.3 4.2h8.8c2.4 0 4.3-1.9 4.3-4.2 0-2.1-1.65-3.8-4-4.1C14.95 2.5 13.1 1.3 11 1.3Z"/>
        <path d="M9.6 12.55h2.8v4.2c1.35.3 2.45 1.15 3.15 2.4-1.35.4-2.4.15-3.15-.4v4.15H9.6v-4.15c-.75.55-1.8.8-3.15.4.7-1.25 1.8-2.1 3.15-2.4v-4.2Z"/>
      </svg>
    </a>
    <a className="nav-link is-active" data-nav href="#about" style={{ '--d': '180ms' }}>
      <span className="icon" aria-hidden="true">
        <svg viewBox="0 0 16 16"><circle cx="8" cy="5.5" r="3"/><path d="M2.5 14.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg>
      </span>
      <span className="label">About</span>
    </a>
    <a className="nav-link" data-nav href="#skills" style={{ '--d': '230ms' }}>
      <span className="icon" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path d="M2 12l3-8 3 4 2-2 4 6"/><path d="M11 4l3 2"/></svg>
      </span>
      <span className="label">Skills</span>
    </a>
    <a className="nav-link" data-nav href="#hobbies" style={{ '--d': '280ms' }}>
      <span className="icon" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path d="M3 3h10v10H3z"/><path d="M7 3v10M3 7h10"/></svg>
      </span>
      <span className="label">Hobbies</span>
    </a>
    <a className="nav-link" data-nav href="#projects" style={{ '--d': '330ms' }}>
      <span className="icon" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path d="M2 4h12M2 4v8h12V4M6 4V2h4v2"/></svg>
      </span>
      <span className="label">Projects</span>
    </a>
    <a className="nav-link" data-nav href="#contact" style={{ '--d': '380ms' }}>
      <span className="icon" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path d="M2 4l6 4 6-4"/><rect x="2" y="4" width="12" height="8" rx="1"/></svg>
      </span>
      <span className="label">Contact</span>
    </a>
  </nav>
</div>

{/*============ HERO (cloud sky) ============*/}
<header className="hero" id="hero">
  <canvas id="motes"></canvas>
  <BotanicalText />

  <div id="drift-root" aria-hidden="true"></div>

  <div className="scroll-cue par fade" style={{ '--d': '900ms', '--pd': '8' }}><span>scroll</span><span className="line"></span></div>
</header>

{/*============ INTRO (name & tagline) ============*/}
<section className="section-pad" id="intro">
  <div className="wrap">
    <LetterDrop />
    <p className="hero-tagline par mask" style={{ '--d': '400ms', '--pd': '10', '--pr': '0.6' }}>
      Also known as <b>Dummy</b> — writer, poet, digital artist, and a full-time
      vibe coder whose head lives somewhere above these clouds. Easily distracted,
      rarely bored, and always one new obsession away from forgetting dinner.
    </p>
  </div>
</section>

{/*============ ABOUT (cloud sky) ============*/}
<section className="section-pad" id="about">
  <div className="wrap">
  <div className="panel about-grid reveal">
    <div className="about-head">
      <div className="kicker">the basics</div>
      <h2 className="section-title">Twenty-something brain,<br /><span className="t-apricot">infinite</span> open tabs.</h2>
    </div>
    <div>
      <div className="about-body">
        <p className="scroll-highlight" data-text="I'm Suvam — most people just call me Dummy. I'm a BTech Computer Science student at GIET University, Gunupur, by day, and by every other hour I'm either writing something, drawing something, or spinning up a half-serious web app just to see if I can.">
        </p>
        <p className="scroll-highlight" data-text="My brain runs on ADHD settings, which basically means I'm interested in everything — for exactly as long as it takes to become obsessed, then a little less. It's chaotic. It's also where most of my good ideas come from.">
        </p>
      </div>
      <div className="fact-list">
        <div className="fact-row"><span className="fact-key">studying</span><span className="fact-val">B.Tech, Computer Science &amp; Engineering</span></div>
        <div className="fact-row"><span className="fact-key">where</span><span className="fact-val">GIET University, Gunupur</span></div>
        <div className="fact-row"><span className="fact-key">brain</span><span className="fact-val">ADHD-powered, interested in anything and everything</span></div>
        <div className="fact-row"><span className="fact-key">status</span><span className="fact-val">vibe coding something new, probably right now</span></div>
      </div>
    </div>
  </div>
  </div>
</section>

{/*============ TRANSITION: sky fades into ink ============*/}
<div className="transition-zone" id="sky-to-ink">
  <p className="transition-line" id="transition-line">and then, the sky turns to ink.</p>
</div>

{/*============ SKILLS (cyclone ink) ============*/}
<section className="section-pad" id="skills">
  <div className="wrap">
  <div className="panel tint-lav reveal">
    <div className="kicker k-lav">what I build with</div>
    <h2 className="section-title">Half toolkit, <span className="t-lav">half instinct</span></h2>

    <div className="skills-groups">
      <div>
        <div className="skill-group-label">build stack</div>
        <div className="pill-row">
          <span className="pill mint">HTML &amp; CSS</span>
          <span className="pill mint">JavaScript</span>
          <span className="pill mint">Prompt-driven / AI-assisted dev</span>
          <span className="pill mint">Git &amp; GitHub</span>
          <span className="pill mint">Python basics</span>
        </div>
      </div>
      <div>
        <div className="skill-group-label">creative stack</div>
        <div className="pill-row">
          <span className="pill lav">Creative writing</span>
          <span className="pill lav">Poetry</span>
          <span className="pill lav">Digital illustration</span>
          <span className="pill lav">Worldbuilding</span>
          <span className="pill lav">Kinetic typography</span>
        </div>
      </div>
    </div>

    <p className="adhd-note" style={{ marginTop: '34px' }}>
      <b>Honestly?</b> most of what I know, I learned by breaking something at
      2am and figuring out why. Everything above earned its place by surviving
      one of my projects.
    </p>
  </div>
  </div>
</section>

{/*============ HOBBIES (cyclone ink) ============*/}
<section className="section-pad" id="hobbies">
  <div className="wrap">
  <div className="panel reveal">
    <div className="kicker k-coral">what I actually do with my time</div>
    <h2 className="section-title">A few things I <span className="t-coral">can't stop</span> doing</h2>

    <div className="hobby-board">
      <div className="hobby h1">
        <div className="hobby-gif">
          <img src="/ha/17b40ffe37500ed2854684e1af7364e5.gif" alt="Pixel art of two figures with an umbrella crossing a rainy bridge" loading="lazy" />
          <div className="hobby-text">
            <h3>writer</h3>
            <p>Fiction mostly. Sometimes it turns into poetry halfway through and I just let it.</p>
          </div>
        </div>
      </div>
      <div className="hobby h2">
        <div className="hobby-gif">
          <img src="/ha/2949e0262e42def248f1c77c571bf9ab.gif" alt="Pixel art of a lone figure under rays in a night field" loading="lazy" />
          <div className="hobby-text">
            <h3>poet</h3>
            <p>Short lines, long feelings. Fancy sadness, but written down nicely.</p>
          </div>
        </div>
      </div>
      <div className="hobby h3">
        <div className="hobby-gif">
          <img src="/ha/8d4074e7caaf7d9a965da253f3928c6e.gif" alt="Pixel art of willow leaves hanging over moonlit water" loading="lazy" />
          <div className="hobby-text">
            <h3>digital artist</h3>
            <p>Doodles that occasionally become something worth keeping. I really like colors. A lot.</p>
          </div>
        </div>
      </div>
      <div className="hobby h4">
        <div className="hobby-gif">
          <img src="/ha/c0309e53f20159b1a864d067b7bb81cc.gif" alt="Pixel art of golden autumn branches" loading="lazy" />
          <div className="hobby-text">
            <h3>vibe coder</h3>
            <p>No spec, no plan, just build until it looks cool. Questionable method. Surprising results.</p>
          </div>
        </div>
      </div>
    </div>

    <p className="adhd-note">
      <b>Fair warning:</b> ask me about my hobbies twice a month and you might
      get a different answer each time. Same person, new rabbit hole.
    </p>
  </div>
  </div>
</section>

{/*============ FLEX STAT (cyclone ink) ============*/}
<section className="section-pad flex-band">
  <div className="wrap">
  <div className="panel reveal">
    <div className="flex-inner">
      <div className="flex-number">500<span className="plus">+</span></div>
      <div className="flex-copy">
        <div className="flex-label">fanfictions read in 3 months</div>
        <p>
          Not a typo. This is my current biggest achievement, and I will bring it up
          without being asked. Reading speed: dangerously high. Sleep schedule:
          negotiable. My eyes gave up; my curiosity never did.
        </p>
      </div>
    </div>
  </div>
  </div>
</section>

{/*============ PROJECTS (cyclone ink) ============*/}
<section className="section-pad" id="projects">
  <div className="wrap">
  <div className="panel tint-lav reveal">
    <div className="kicker">vibe coded, not vibe planned</div>
    <h2 className="section-title">Some things I built <span className="t-mint">on a whim</span></h2>

    <div className="cine" id="cine">
      <div className="cine-screen">
        <div className="cine-bg" aria-hidden="true"></div>
        <div className="cine-grain" aria-hidden="true"></div>
        <div className="cine-scratches" aria-hidden="true"></div>
        <div className="cine-body">
          <div className="cine-count" id="cine-count">Scene 1 / 3</div>
          <h3 className="cine-name"><span id="cine-title">TypoReel</span><span className="cine-slug" id="cine-slug">typography.io</span></h3>
          <p className="cine-desc" id="cine-desc"></p>
          <div className="cine-barwrap" aria-hidden="true"><div className="cine-bar" id="cine-bar"></div></div>
          <div className="cine-btns">
            <button className="cine-btn" id="cine-prev" type="button">◂ prev</button>
            <button className="cine-btn" id="cine-next" type="button">next ▸</button>
            <a className="cine-btn cine-open" id="cine-open" href="https://projecloom.github.io/typography.io/" target="_blank" rel="noopener">open it up ↗</a>
          </div>
        </div>
        <div className="cine-reel" id="cine-reel">REEL I</div>
      </div>
    </div>

    <p className="proj-foot">
      more of these are always half-built — check <a href="https://github.com/projecloom" target="_blank" rel="noopener">@projecloom</a> on GitHub for whatever is currently unfinished. Something new is always bubbling.
    </p>
  </div>
  </div>
</section>

{/*============ CONTACT (cyclone ink) ============*/}
<section className="section-pad" id="contact">
  <div className="wrap">
  <div className="panel reveal">
    <div className="contact-grid">
      <div className="contact-head">
        <div className="kicker k-lav">get in touch</div>
        <h2 className="section-title">Got a <span className="t-lav">weird idea?</span> Send it my way.</h2>
        <p>Whether it's a fic recommendation, a project to vibe-code together, or just to talk about the last thing I got obsessed with — I'm around. The weirder, the better.</p>
      </div>
      <div className="contact-actions">
        <a className="glow-btn" href="https://github.com/projecloom" target="_blank" rel="noopener">Message me on GitHub</a>
        <a className="glow-btn" href="https://readersuii.netlify.app/" target="_blank" rel="noopener">See what I'm building</a>
      </div>
    </div>
    <p className="contact-note">No public email listed yet — GitHub's the fastest way to reach me for now. My inbox there is always open.</p>
  </div>
  </div>
</section>

{/*============ FOOTER (cyclone ink) ============*/}
<footer className="section-pad">
  <div className="wrap">
  <div className="panel reveal">
    <div className="foot-grid">
      <div className="foot-line1">Let's build<br />something <i>weird</i>.</div>
      <div className="foot-links">
        <a href="https://github.com/projecloom" target="_blank" rel="noopener">GitHub</a>
        <a href="https://projecloom.github.io/typography.io/" target="_blank" rel="noopener">TypoReel</a>
        <a href="https://projecloom.github.io/disprop.io/" target="_blank" rel="noopener">Chat Studio</a>
        <a href="https://readersuii.netlify.app/" target="_blank" rel="noopener">READERS</a>
      </div>
    </div>
    <div className="foot-bottom">
      <span>Suvam Sugyan Sahoo — aka dummy</span>
      <span>BTech CSE · GIET University, Gunupur</span>
    </div>
  </div>
  </div>
</footer>
    </>
  );
}
