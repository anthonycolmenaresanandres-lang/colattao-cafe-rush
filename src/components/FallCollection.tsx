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
          <Image src="/assets/colattao/collection/colattao-wordmark.webp" alt="Colattao Coffee House" width={341} height={180} loading="eager" />
        </Link>
        <span className={styles.location}>Coffee House<span>Virginia Beach</span></span>
        <a className={styles.menuLink} href="/menu">The menu <span aria-hidden="true">↗</span></a>
      </header>

      <section className={styles.gameStart} aria-labelledby="fall-rush-title">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>The fall drinks game</p>
          <h1 id="fall-rush-title"><span>FALL</span>{" "}<span>RUSH</span></h1>
          <p className={styles.instructions}>Tap the falling drinks.<br />Avoid the chain coffee.</p>
        </div>

        <div className={styles.portrait} aria-label="Featured fall drink">
          <div className={styles.spotlight} aria-hidden="true" />
          <div key={drink.slug} className={styles.imageWrap}>
            {failed.includes(drink.slug) ? (
              <div className={styles.imageFallback}><span aria-hidden="true">☕</span><p>{drink.label}</p></div>
            ) : (
              <Image src={`/assets/colattao/collection/${drink.slug}.webp`} alt={drink.alt}
                width={960} height={960} loading="eager" fetchPriority={selected === 0 ? "high" : "auto"}
                sizes="(min-width: 900px) 420px, (min-width: 600px) 340px, (max-width: 359px) 260px, 300px"
                className={styles.drinkImage}
                onError={() => setFailed((previous) => [...new Set([...previous, drink.slug])])} />
            )}
          </div>
          <div className={styles.drinkCopy} aria-live="polite" aria-atomic="true">
            <h2>{item.name}</h2>
          </div>
        </div>

        <fieldset className={styles.flavors}>
            <legend>Meet the drinks</legend>
            <div className={styles.flavorGrid}>
              {ART.map((choice, index) => (
                <label key={choice.slug} className={styles.flavor}>
                  <input type="radio" name="fall-flavor" value={choice.slug} aria-label={choice.name}
                    checked={selected === index} onChange={() => onSelect(index)} />
                  <span className={styles.flavorOption}>
                    <span className={styles.thumbnail} aria-hidden="true">
                      {failed.includes(choice.slug) ? <span className={styles.thumbnailFallback}>☕</span> : (
                        <Image src={`/assets/colattao/collection/${choice.slug}.webp`} alt="" width={96} height={96} sizes="72px"
                          onError={() => setFailed((previous) => [...new Set([...previous, choice.slug])])} />
                      )}
                    </span>
                    <span className={styles.flavorLabel}>{choice.label}</span>
                    <span className={styles.selectionMark} aria-hidden="true">{selected === index ? "✓" : ""}</span>
                  </span>
                </label>
              ))}
            </div>
        </fieldset>

        <div className={styles.actions}>
            <button ref={playRef} type="button" onClick={onPlay} className={styles.play}><span className={styles.playIcon} aria-hidden="true">▶</span> Play Fall Rush <span aria-hidden="true">→</span></button>
            <a href="/menu#fall-drinks" className={styles.flavorMenu}>View fall menu <span aria-hidden="true">↗</span></a>
        </div>

        <div className={styles.details}>
          <p className={styles.eyebrow}>In your cup</p>
          <p className={styles.ingredients}>{item.description}</p>
          <p className={styles.flavorNote}>{drink.note}</p>
        </div>
      </section>
      <footer className={styles.footer}><span>Colattao Coffee House</span><span>Virginia Beach, Virginia</span><a href="https://finacalleos.com" target="_blank" rel="noopener noreferrer">Experience by Fina Calle <span aria-hidden="true">↗</span></a></footer>
    </main>
  );
}
