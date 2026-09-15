"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { menuCategories } from "@/data/colattaoMenu";
import styles from "./FallCollection.module.css";

const ART = [
  { name: "Pumpkin Pie Latte", label: "Pumpkin Pie", slug: "pumpkin-pie", note: "Pumpkin · Shortbread · Spice", alt: "Pumpkin latte in Colattao's blue floral cup with spiced foam" },
  { name: "Caramel Apple Latte", label: "Caramel Apple", slug: "caramel-apple", note: "Caramel · Apple · Cinnamon", alt: "Caramel apple latte in a fluted glass with an apple garnish" },
  { name: "Campfire Cappuccino or Matcha", label: "Campfire", slug: "campfire", note: "Marshmallow · Dark chocolate", alt: "Campfire cappuccino with a roasted marshmallow in a blue floral cup" },
  { name: "Maple Pecan Latte", label: "Maple Pecan", slug: "maple-pecan", note: "Salted maple · Butter pecan", alt: "Maple pecan latte with cold foam in a fluted glass" },
];
const menu = menuCategories.find((category) => category.id === "fall-drinks")!.items;

export default function FallCollection({ onPlay, selected, onSelect, focusPlay }: {
  onPlay: () => void; selected: number; onSelect: (index: number) => void; focusPlay: boolean;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const playRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (focusPlay) playRef.current?.focus({ preventScroll: true }); }, [focusPlay]);
  const drink = ART[selected];
  const item = menu.find((entry) => entry.name === drink.name)!;

  return (
    <main className={styles.collection}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Colattao Coffee House home">
          <Image src="/assets/colattao/collection/colattao-wordmark.webp" alt="Colattao Coffee House" width={341} height={180} priority />
        </Link>
        <span className={styles.location}>Coffee House<span>Virginia Beach</span></span>
        <a className={styles.menuLink} href="/menu">The menu <span aria-hidden="true">↗</span></a>
      </header>

      <div className={styles.heading}>
        <p className={styles.eyebrow}>The autumn collection</p>
        <h1>A season worth savoring.</h1>
        <p>Pumpkin, apple, marshmallow &amp; maple.<br />Find your fall favorite.</p>
      </div>

      <section className={styles.showcase} aria-label="Explore the fall drinks">
        <div className={styles.portrait}>
          <span className={styles.portraitLabel} aria-hidden="true">COLATTAO / FALL</span>
          <div key={drink.slug} className={styles.imageWrap}>
            {failed.includes(drink.slug) ? (
              <div className={styles.imageFallback}><span aria-hidden="true">☕</span><p>{drink.label}</p></div>
            ) : (
              <Image src={`/assets/colattao/collection/${drink.slug}.webp`} alt={drink.alt}
                width={960} height={960} priority={selected === 0}
                sizes="(min-width: 900px) 520px, (min-width: 600px) 380px, 84vw"
                className={styles.drinkImage}
                onError={() => setFailed((previous) => [...new Set([...previous, drink.slug])])} />
            )}
          </div>
          <span className={styles.portraitNote}>{drink.note}</span>
        </div>

        <div className={styles.details}>
          <div className={styles.drinkCopy} aria-live="polite" aria-atomic="true">
            <p className={styles.eyebrow}>Your fall favorite</p>
            <h2>{item.name}</h2>
            <p className={styles.ingredients}>{item.description}</p>
          </div>
          <fieldset className={styles.flavors}>
            <legend>Explore the flavors</legend>
            <div className={styles.flavorGrid}>
              {ART.map((choice, index) => (
                <label key={choice.slug} className={styles.flavor}>
                  <input type="radio" name="fall-flavor" value={choice.slug} checked={selected === index} onChange={() => onSelect(index)}
                    onFocus={(event) => {
                      const label = event.currentTarget.parentElement;
                      const actions = playRef.current?.parentElement;
                      if (label && actions && window.matchMedia("(max-width: 599px)").matches
                        && label.getBoundingClientRect().bottom > actions.getBoundingClientRect().top) {
                        label.scrollIntoView({ block: "center", behavior: "instant" });
                      }
                    }} />
                  <span><span className={styles.flavorDot} aria-hidden="true" />{choice.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className={styles.actions}>
            <button ref={playRef} type="button" onClick={onPlay} className={styles.play}>Play Fall Rush <span aria-hidden="true">→</span></button>
            <a href="/menu#fall-drinks" className={styles.flavorMenu}>View fall menu <span aria-hidden="true">↗</span></a>
          </div>
          <p className={styles.gameNote}>A little play with your coffee.<br /><span>Tap the falling drinks. Avoid the chain coffee.</span></p>
        </div>
      </section>
      <footer className={styles.footer}><span>Colattao Coffee House</span><span>Virginia Beach, Virginia</span><a href="https://finacalleos.com" target="_blank" rel="noopener noreferrer">Experience by Fina Calle <span aria-hidden="true">↗</span></a></footer>
    </main>
  );
}
