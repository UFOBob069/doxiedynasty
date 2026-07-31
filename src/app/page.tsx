import Image from "next/image";

const dynastyCards = [
  { src: "/cards/andre.webp", alt: "Andre doxie card" },
  { src: "/cards/stella.webp", alt: "Stella doxie card" },
  { src: "/cards/teddy.webp", alt: "Teddy doxie card" },
  { src: "/cards/olive.webp", alt: "Olive doxie card" },
  { src: "/cards/bear.webp", alt: "Bear doxie card" },
  { src: "/cards/layla.webp", alt: "Layla doxie card" },
];

const quirkCards = [
  {
    src: "/cards/puppy-surprise.webp",
    alt: "Puppy Surprise quirk card",
    title: "Puppy Surprise",
    copy: "Draw two extra cards and give your dynasty a sudden growth spurt.",
  },
  {
    src: "/cards/royal-heir.webp",
    alt: "Royal Heir quirk card",
    title: "Royal Heir",
    copy: "A crown-worthy power play that can turn a clever round into a landslide.",
  },
  {
    src: "/cards/burrower.webp",
    alt: "Burrower quirk card",
    title: "Burrower",
    copy: "Dig into the competition and hunt for the perfect card to complete your set.",
  },
];

const steps = [
  {
    number: "01",
    title: "Draw",
    copy: "Take one card from the deck or the discard pile. Every pick can reshape your pack.",
  },
  {
    number: "02",
    title: "Build",
    copy: "Match doxies by coat, color, pattern, size, and personality to grow scoring sets.",
  },
  {
    number: "03",
    title: "Unleash",
    copy: "Play quirks and wild cards at just the right moment to outsmart the table.",
  },
  {
    number: "04",
    title: "Rule",
    copy: "Complete the strongest dynasty, count your bonuses, and claim the crown.",
  },
];

function Brand() {
  return (
    <span className="brand-lockup">
      <Image
        src="/cards/box-side.webp"
        alt="Doxie Dynasty Card Game"
        width={420}
        height={190}
        priority
      />
    </span>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Doxie Dynasty home">
          <Brand />
        </a>
        <nav aria-label="Main navigation">
          <a href="#game">The game</a>
          <a href="#cards">Meet the doxies</a>
          <a href="#how-to-play">How to play</a>
        </nav>
        <a className="nav-cta" href="https://www.amazon.com/dp/B0H1NL53PX" target="_blank" rel="noopener noreferrer">
          Shop on Amazon <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <h1 className="sr-only" id="hero-title">Doxie Dynasty Card Game</h1>
        <div className="hero-art">
          <Image
            src="/hero-game-night.webp"
            alt="Four friends laughing over a game of Doxie Dynasty with a dachshund at the table"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="hero-ribbon">
          <p>
            <span>Fast to learn.</span> Full of clever combinations, chaotic quirks,
            and dogs you will immediately want in your dynasty.
          </p>
          <a className="button button-gold" href="#game">Meet the game</a>
          <dl className="hero-facts">
            <div><dt>84</dt><dd>Cards</dd></div>
            <div><dt>2–6</dt><dd>Players</dd></div>
            <div><dt>20–30</dt><dd>Minutes</dd></div>
            <div><dt>∞</dt><dd>Good dogs</dd></div>
          </dl>
        </div>
      </section>

      <section className="game-section" id="game">
        <div className="section-copy">
          <p className="eyebrow">THE ULTIMATE DOXIE COMPETITION</p>
          <h2>The table has a new top dog.</h2>
          <p className="lede">
            Draw a hand, spot the traits that belong together, and build the
            most glorious pack on the table. Doxie Dynasty mixes satisfying set
            collection with mischievous powers and just enough chaos to keep
            every round moving.
          </p>
          <div className="callout-line">
            <span aria-hidden="true">★</span>
            Easy enough for the first hand. Strategic enough for the fifth.
          </div>
        </div>

        <div className="product-stage" aria-label="Doxie Dynasty full card game box">
          <div className="box-photo-mockup">
            <Image
              src="/box-product-mockup.webp"
              alt="Complete Doxie Dynasty card game box standing on a wooden table"
              fill
              sizes="(max-width: 700px) 92vw, 620px"
            />
          </div>
        </div>
      </section>

      <section className="cards-section" id="cards">
        <div className="cards-heading">
          <div>
            <p className="eyebrow">SIX TRAITS. DOZENS OF GOOD DOGS.</p>
            <h2>Every doxie brings something to the pack.</h2>
          </div>
          <p>
            Smooth, long-haired, wire-haired, mini, standard, dapple, red,
            black and tan—every card is loaded with traits to match, mix, and
            multiply.
          </p>
        </div>

        <div className="card-gallery" aria-label="A selection of Doxie Dynasty cards">
          {dynastyCards.map((card, index) => (
            <article className={`gallery-card gallery-card-${index + 1}`} key={card.src}>
              <Image src={card.src} alt={card.alt} fill sizes="(max-width: 700px) 55vw, 260px" />
            </article>
          ))}
        </div>
        <div className="trait-ticker" aria-hidden="true">
          <span>FUR TYPE</span><i>•</i><span>COLOR</span><i>•</i><span>PATTERN</span><i>•</i>
          <span>PERSONALITY</span><i>•</i><span>POSE</span><i>•</i><span>BACKGROUND</span>
        </div>
      </section>

      <section className="how-section" id="how-to-play">
        <div className="how-intro">
          <p className="eyebrow">ONE TURN. FOUR MOVES.</p>
          <h2>Build a dynasty in minutes.</h2>
          <p>
            The rhythm is simple: draw, build, surprise the table, and discard.
            The decisions get delightfully trickier as every pack grows.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>

        <div className="tabletop-mockup">
          <div className="table-card table-card-a"><Image src="/cards/stella.webp" alt="Stella card on the table" fill sizes="220px" /></div>
          <div className="table-card table-card-b"><Image src="/cards/teddy.webp" alt="Teddy card on the table" fill sizes="220px" /></div>
          <div className="table-card table-card-c"><Image src="/cards/olive.webp" alt="Olive card on the table" fill sizes="220px" /></div>
          <div className="table-card table-card-d"><Image src="/cards/card-back.webp" alt="Doxie Dynasty draw pile" fill sizes="220px" /></div>
          <span className="table-label label-set">MATCHING SET</span>
          <span className="table-label label-draw">DRAW PILE</span>
        </div>
      </section>

      <section className="quirks-section">
        <div className="quirks-heading">
          <p className="eyebrow">GOOD DOGS. WILD MOVES.</p>
          <h2>Every dynasty needs a little mischief.</h2>
          <p>
            Quirk cards reward timing, nerve, and a willingness to cause a
            tiny amount of trouble. Play them to accelerate your pack or put a
            wrinkle in somebody else&apos;s perfect plan.
          </p>
        </div>
        <div className="quirks-grid">
          {quirkCards.map((card, index) => (
            <article key={card.src}>
              <div className={`quirk-card quirk-card-${index + 1}`}>
                <Image src={card.src} alt={card.alt} fill sizes="(max-width: 700px) 72vw, 330px" />
              </div>
              <span>0{index + 1}</span>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wild-section">
        <div className="wild-hand" aria-label="Doxie Dynasty wild cards">
          <div className="wild-card wild-card-one"><Image src="/cards/wild-ziggy.webp" alt="Ziggy wild card" fill sizes="270px" /></div>
          <div className="wild-card wild-card-two"><Image src="/cards/wild-dash.webp" alt="Dash wild card" fill sizes="270px" /></div>
          <div className="wild-card wild-card-three"><Image src="/cards/joker.webp" alt="Doxie Dynasty joker card" fill sizes="270px" /></div>
        </div>
        <div className="wild-copy">
          <p className="eyebrow">THE PACK&apos;S WILDEST MEMBERS</p>
          <h2>Need one perfect trait? Call in a wild doxie.</h2>
          <p>
            Wild cards flex into the set you need, while the Joker keeps every
            player guessing. Save them for the right moment—or make the table
            nervous by playing one early.
          </p>
          <div className="crown-note"><span>♛</span> One card can change the whole round.</div>
        </div>
      </section>

      <section className="buy-section" id="buy">
        <div className="buy-box">
          <Image src="/box-product-mockup.webp" alt="Complete Doxie Dynasty card game box" fill sizes="(max-width: 700px) 82vw, 460px" />
        </div>
        <div className="buy-copy">
          <p className="eyebrow">MAKE SETS. BUILD YOUR DYNASTY.</p>
          <h2>Bring home the crown.</h2>
          <p>
            A fast, joyful card game for families, friends, dachshund people,
            and anyone ready to become the top dog at game night.
          </p>
          <a className="button button-gold" href="https://www.amazon.com/dp/B0H1NL53PX" target="_blank" rel="noopener noreferrer">
            Shop on Amazon <span aria-hidden="true">↗</span>
          </a>
          <small>Available now on Amazon.</small>
        </div>
      </section>

      <footer>
        <Brand />
        <p>Collect. Make sets. Win.</p>
        <div className="footer-links">
          <a href="#game">The game</a>
          <a href="#how-to-play">How to play</a>
          <a href="https://www.amazon.com/dp/B0H1NL53PX" target="_blank" rel="noopener noreferrer">Amazon</a>
        </div>
        <small>© 2026 Doxie Dynasty. All rights reserved.</small>
      </footer>
    </main>
  );
}
