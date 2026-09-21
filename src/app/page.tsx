import Image from "next/image";
import { BookOpen, Download, ListChecks, ArrowUpRight } from "lucide-react";
import { PRODUCT, PRODUCT_JSON_LD } from "@/lib/product-catalog";

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
    alt: "Puppy Surprise action card",
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
    copy: "Play Doxies face up. Group exactly three sharing fur type, color, or pattern for a set bonus.",
  },
  {
    number: "03",
    title: "Unleash",
    copy: "Play Quirks and Actions one at a time, or use a Wild to complete a matching set.",
  },
  {
    number: "04",
    title: "Discard",
    copy: "Discard one card to end your turn. Finish the turn that empties the draw deck, then score.",
  },
];

const directCheckoutUrl = "/checkout";
const amazonUrl = PRODUCT.amazonUrl;
const rulesPdfUrl = PRODUCT.rulesPdfUrl;

const faqItems = [
  {
    question: "How many people can play Doxie Dynasty?",
    answer: "Doxie Dynasty is made for 2–6 players, so it works for couples, families, and a full game-night pack.",
  },
  {
    question: "How long does a game take?",
    answer: "Most games take about 20–30 minutes. The turn structure is quick to learn, while the card combinations keep repeat plays interesting.",
  },
  {
    question: "What kind of card game is it?",
    answer: "It is a set-collection card game. Players draw doxies, build matching or complementary packs, use quirk cards, and compete for the strongest dynasty.",
  },
  {
    question: "Where can I buy the game?",
    answer: "You can order directly from this site with free U.S. shipping or purchase Doxie Dynasty on Amazon.",
  },
];

const contactUrl =
  "mailto:david.eagan@gmail.com?subject=Doxie%20Dynasty%20question";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(PRODUCT_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <header className="site-header home-header">
        <a className="brand" href="#top" aria-label="Doxie Dynasty home">
          <Brand />
        </a>
        <nav aria-label="Main navigation">
          <a href="#game">The game</a>
          <a href="#cards">Meet the doxies</a>
          <a href="/gameplay">How to play</a>
          <a href={contactUrl}>Contact</a>
        </nav>
        <a className="nav-cta" href={amazonUrl} target="_blank" rel="noopener noreferrer">
          Buy on Amazon <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </header>
      <nav className="home-resources" aria-label="Rules and card list">
        <a href="/gameplay"><BookOpen size={18} aria-hidden="true" /> How to play</a>
        <a href={rulesPdfUrl} download><Download size={18} aria-hidden="true" /> Download rules PDF</a>
        <a href="/gameplay#checklist"><ListChecks size={18} aria-hidden="true" /> All card names</a>
      </nav>

      <section className="hero home-hero" id="top" aria-labelledby="hero-title">
        <h1 className="sr-only" id="hero-title">Doxie Dynasty Card Game</h1>
        <div className="hero-art">
          <Image
            src="/hero-game-night.webp"
            alt="Four friends laughing over a game of Doxie Dynasty with a dachshund at the table"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-purchase" aria-label="Purchase Doxie Dynasty">
            <span>Bring home Doxie Dynasty</span>
            <div>
              <a
                className="button button-gold"
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy on Amazon <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <a className="button button-outline" href="/gameplay"><BookOpen size={17} aria-hidden="true" /> How to play</a>
            </div>
            <a className="hero-pdf-link" href={rulesPdfUrl} download><Download size={16} aria-hidden="true" /> Download full rules PDF</a>
          </div>
        </div>
        <div className="hero-ribbon">
          <p>
            <span>Fast to learn.</span> Full of clever combinations, chaotic quirks,
            and dogs you will immediately want in your dynasty.
          </p>
          <div className="hero-actions" aria-label="Purchase options">
            <a
              className="button button-gold"
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy on Amazon <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a className="button button-outline" href="/gameplay"><BookOpen size={17} aria-hidden="true" /> How to play</a>
            <a className="hero-pdf-link" href={rulesPdfUrl} download><Download size={16} aria-hidden="true" /> Download rules PDF</a>
          </div>
          <dl className="hero-facts">
            <div><dt>90</dt><dd>Cards</dd></div>
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
            <p className="eyebrow">THREE WAYS TO MATCH. DOZENS OF GOOD DOGS.</p>
            <h2>Every doxie brings something to the pack.</h2>
          </div>
          <p>
            Match fur type, color, or pattern. Mini and Standard determine base
            points; personality, pose, and background give each dog its character.
          </p>
        </div>

        <div className="card-gallery" aria-label="A selection of Doxie Dynasty cards">
          {dynastyCards.map((card, index) => (
            <article className={`gallery-card gallery-card-${index + 1}`} key={card.src}>
              <Image src={card.src} alt={card.alt} fill sizes="(max-width: 700px) 55vw, 260px" />
            </article>
          ))}
        </div>
        <div className="card-name-link"><a href="/gameplay#checklist"><ListChecks size={20} aria-hidden="true" /> Is your doxie&apos;s name in the deck? See all card names.</a></div>
        <div className="trait-ticker" aria-hidden="true">
          <span>FUR TYPE</span><i>•</i><span>COLOR</span><i>•</i><span>PATTERN</span><i>•</i>
          <span>MAKE SETS</span><i>•</i><span>BUILD YOUR DYNASTY</span>
        </div>
      </section>

      <section className="how-section" id="how-to-play">
        <div className="how-intro">
          <p className="eyebrow">ONE TURN. FOUR MOVES.</p>
          <h2>Build a dynasty in minutes.</h2>
          <p>
            Deal 7 cards to each player. Draw 1, play Doxies face up and use
            special cards, then discard 1. Only cards played to the table score.
          </p>
          <div className="rules-actions">
            <a className="button rules-read-link" href="/gameplay"><BookOpen size={18} aria-hidden="true" /> Read the full rules</a>
            <a className="rules-pdf-link" href={rulesPdfUrl} download><Download size={18} aria-hidden="true" /> Download rules PDF</a>
          </div>
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
          <div className="table-card table-card-b"><Image src="/cards/bear.webp" alt="Bear card on the table" fill sizes="220px" /></div>
          <div className="table-card table-card-c"><Image src="/cards/olive.webp" alt="Olive card on the table" fill sizes="220px" /></div>
          <div className="table-card table-card-d"><Image src="/cards/card-back.webp" alt="Doxie Dynasty draw pile" fill sizes="220px" /></div>
          <span className="table-label label-set">BRINDLE SET: 11 POINTS</span>
          <span className="table-label label-draw">DRAW PILE</span>
        </div>
      </section>

      <section className="seo-story-section" aria-labelledby="dachshund-card-game-title">
        <div className="seo-story-intro">
          <p className="eyebrow">A SMALL-DOG GAME WITH BIG PERSONALITY</p>
          <h2 id="dachshund-card-game-title">
            A dachshund card game made for game night.
          </h2>
          <p>
            Doxie Dynasty is a 90-card set-collection game built for dachshund
            lovers, families, friends, and anyone who enjoys a clever game that
            gets to the fun quickly. Each 20–30 minute round gives 2–6 players a
            fresh mix of dogs, traits, and mischievous moves to combine.
          </p>
        </div>
        <div className="seo-story-grid">
          <article>
            <span>01</span>
            <h3>Easy to bring to the table</h3>
            <p>
              Draw a card, build matching packs, play a quirk, and keep your
              dynasty growing. New players can join quickly without slowing down game night.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Different every round</h3>
            <p>
              Fur types, colors, patterns, and Wild Doxies create
              new combinations every time the deck is shuffled.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>A gift for doxie people</h3>
            <p>
              The illustrated dogs and compact deck make Doxie Dynasty a playful
              gift for dachshund owners, dog lovers, and card-game fans.
            </p>
          </article>
        </div>
      </section>

      <section className="quirks-section">
        <div className="quirks-heading">
          <p className="eyebrow">GOOD DOGS. WILD MOVES.</p>
          <h2>Every dynasty needs a little mischief.</h2>
          <p>
            Quirk and Action cards reward timing, nerve, and a willingness to cause a
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
          <div className="wild-card wild-card-three"><Image src="/cards/wild-ace.png" alt="Ace Wild Doxie card" fill sizes="270px" /></div>
        </div>
        <div className="wild-copy">
          <p className="eyebrow">THE PACK&apos;S WILDEST MEMBERS</p>
          <h2>Need one perfect trait? Call in a wild doxie.</h2>
          <p>
            The six Wild Doxies can supply one matching trait to complete a set
            with two regular Doxies. Save one for the right moment and turn a
            promising pair into a scoring trio.
          </p>
          <div className="crown-note"><span>♛</span> One card can change the whole round.</div>
        </div>
      </section>

      <section className="faq-section" id="faq" aria-labelledby="faq-title">
        <div className="faq-heading">
          <p className="eyebrow">THE QUICK SNIFF</p>
          <h2 id="faq-title">Doxie Dynasty questions.</h2>
          <p>Everything your pack needs to know before the first deal.</p>
        </div>
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
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
          <div className="buy-actions">
            <a className="button button-gold" href={amazonUrl} target="_blank" rel="noopener noreferrer">
              Buy on Amazon <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a className="button button-outline" href={directCheckoutUrl}>Buy direct <span aria-hidden="true">→</span></a>
          </div>
          <small>Direct: ${PRODUCT.price} USD per deck with free U.S. shipping. Amazon shows its own price and availability.</small>
          <p className="purchase-details"><a href="/product">Product details, shipping &amp; returns</a></p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p className="eyebrow">QUESTIONS, SUPPORT OR WHOLESALE</p>
          <h2>Talk to the top dog.</h2>
        </div>
        <a className="contact-button" href={contactUrl}>
          Send a message <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer>
        <Brand />
        <p>Collect. Make sets. Win.</p>
        <div className="footer-links">
          <a href="#game">The game</a>
          <a href="/product">Product details</a>
          <a href="/gameplay">How to play</a>
          <a href={rulesPdfUrl} download>Rules PDF</a>
          <a href="/gameplay#checklist">All card names</a>
          <a href="#faq">FAQ</a>
          <a href={directCheckoutUrl}>Buy direct</a>
          <a href="https://www.amazon.com/dp/B0H1NL53PX" target="_blank" rel="noopener noreferrer">Amazon</a>
          <a href={contactUrl}>Contact</a>
        </div>
        <small>© 2026 Doxie Dynasty. All rights reserved.</small>
      </footer>
    </main>
  );
}
