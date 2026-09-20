import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, BookOpen, Crown } from "lucide-react";
import rules from "@/lib/gameplay.json";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "How to Play Doxie Dynasty | Full Rules & Card Checklist",
  description: "Deal 7 cards, build your face-up Dynasty, and learn every turn, matching set, Wild, Quirk, and Action. Includes the full downloadable rules PDF.",
  alternates: { canonical: "/gameplay" },
  openGraph: {
    title: "Doxie Dynasty: Full Gameplay Rules",
    description: "Setup, turns, scoring, a card checklist, and a downloadable rulebook for the 90-card game.",
    url: "/gameplay",
  },
  twitter: {
    title: "Doxie Dynasty: Full Gameplay Rules",
    description: "Learn to play and download the complete rulebook.",
  },
};

const jumps = [
  ["setup", "Setup"], ["your-turn", "Your turn"], ["table", "On the table"],
  ["sets", "Sets & Wilds"], ["scoring", "Scoring"], ["ending", "Ending"],
  ["special-cards", "Special cards"], ["checklist", "Card checklist"], ["questions", "Questions"],
];
const exampleCards = [
  { name: "Bear", src: "/cards/bear.webp", detail: "Mini / Smooth / Red / Brindle", points: 1 },
  { name: "Stella", src: "/cards/stella.webp", detail: "Standard / Wire / Red / Brindle", points: 2 },
  { name: "Olive", src: "/cards/olive.webp", detail: "Standard / Wire / Black & Tan / Brindle", points: 2 },
];

export default function Gameplay() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#rules">Skip to rules</a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Doxie Dynasty home">Doxie <span>Dynasty</span></Link>
        <nav aria-label="Main navigation">
          <Link href="/">The game</Link>
          <Link href="/gameplay" aria-current="page">How to play</Link>
          <Link href="/#buy">Buy the game <ArrowRight size={16} aria-hidden="true" /></Link>
        </nav>
      </header>
      <main id="rules">
        <section className={styles.intro} aria-labelledby="gameplay-title">
          <div className={styles.width}>
            <p className={styles.kicker}><BookOpen size={18} aria-hidden="true" /> THE COMPLETE PLAY GUIDE</p>
            <h1 id="gameplay-title">Doxie Dynasty<span>How to play</span></h1>
            <p className={styles.lede}>{rules.intro}</p>
            <dl className={styles.facts}>
              <div><dt>2-6</dt><dd>players</dd></div>
              <div><dt>90</dt><dd>playing cards</dd></div>
              <div><dt>7</dt><dd>cards to start</dd></div>
              <div><dt>Draw. Play. Discard.</dt><dd>every turn</dd></div>
            </dl>
            <div className={styles.actions}>
              <a className={styles.download} href="/downloads/doxie-dynasty-full-rules.pdf" download><Download size={19} aria-hidden="true" /> Download full rules (PDF)</a>
              <a href="#setup">Start with setup <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
            <p className={styles.version}>{rules.version}</p>
          </div>
        </section>
        <div className={`${styles.width} ${styles.layout}`}>
          <aside className={styles.contents}>
            <nav aria-label="In this guide">
              <p>AT THE TABLE</p>
              {jumps.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            </nav>
          </aside>
          <div className={styles.content}>
            <p className={styles.edition}>{rules.edition}</p>
            {rules.sections.map(section => (
              <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
                <h2 id={`${section.id}-title`}>{section.title}</h2>
                {section.id === "your-turn" && <p className={styles.sequence}>DRAW 1 <ArrowRight aria-hidden="true" size={18} /> PLAY <ArrowRight aria-hidden="true" size={18} /> DISCARD 1</p>}
                {section.id === "example" && (
                  <div className={styles.cardExample}>
                    {exampleCards.map(card => <figure key={card.name}>
                      <Image src={card.src} alt={`${card.name}, ${card.detail}, ${card.points} base point${card.points === 1 ? "" : "s"}`} width={256} height={384} sizes="(max-width: 600px) 27vw, 200px" />
                      <figcaption><strong>{card.name}</strong><span>{card.points} base + 2 set</span></figcaption>
                    </figure>)}
                    <p className={styles.exampleTotal}><Crown size={22} aria-hidden="true" /> One Brindle set <strong>11 points</strong></p>
                  </div>
                )}
                {section.items.map(item => <div className={styles.rule} key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>)}
              </section>
            ))}
            <section className={styles.section} id="special-cards" aria-labelledby="special-title">
              <h2 id="special-title">Every special card, explained</h2>
              <p>{rules.specialIntro}</p>
              {([["Quirks", rules.quirks], ["Actions", rules.actions]] as const).map(([label, cards]) => <div key={label} className={styles.specialGroup}>
                <h3>{cards.length} {label}</h3>
                <dl className={styles.specialList}>
                  {cards.map(card => <div key={card.name}><dt>{card.name}<span>{card.timing}</span></dt><dd>{card.text}</dd></div>)}
                </dl>
              </div>)}
            </section>
            <section className={styles.section} id="checklist" aria-labelledby="checklist-title">
              <h2 id="checklist-title">Meet the deck</h2>
              <p>{rules.checklistIntro}</p>
              <h3>Regular Doxies: 6 examples from the 66</h3>
              <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Example Doxie card traits">
                <table><caption>Examples from the 90-card master list. Use your card&apos;s printed labels during play.</caption>
                  <thead><tr><th scope="col">Doxie</th><th scope="col">Size / points</th><th scope="col">Fur</th><th scope="col">Color</th><th scope="col">Pattern</th></tr></thead>
                  <tbody>{rules.samples.map(card => <tr key={card.name}><th scope="row">{card.name}</th><td>{card.size} / {card.points}</td><td>{card.fur}</td><td>{card.color}</td><td>{card.pattern}</td></tr>)}</tbody>
                </table>
              </div>
              <div className={styles.checklistGroups}>
                {([
                  ["All 6 Wilds", rules.wildNames],
                  ["All 12 Quirks", rules.quirks.map(card => card.name)],
                  ["All 6 Actions", rules.actions.map(card => card.name)],
                ] as const).map(([title, names]) => <fieldset key={title}><legend>{title}</legend>{names.map(name => <label key={name}><input type="checkbox" />{name}</label>)}</fieldset>)}
              </div>
            </section>
            <section className={styles.section} id="questions" aria-labelledby="questions-title">
              <h2 id="questions-title">Questions at the table</h2>
              <div className={styles.faq}>{rules.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
              <p className={styles.help}>Still have a rules question? <a href="mailto:david.eagan@gmail.com?subject=Doxie%20Dynasty%20rules%20question">Contact Doxie Dynasty</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <div className={styles.footer}>
        <Link href="/"><ArrowLeft size={18} aria-hidden="true" /> Back to Doxie Dynasty</Link>
        <a href="/downloads/doxie-dynasty-full-rules.pdf" download><Download size={18} aria-hidden="true" /> Full rules PDF</a>
        <span>{rules.version}</span>
      </div>
    </div>
  );
}
