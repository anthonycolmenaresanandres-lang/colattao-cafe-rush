import Image from "next/image";
import appTheme from "@/config/theme";
import styles from "./autumn.module.css";

export default function FallPromo() {
  return (
    <section className={styles.promo} aria-labelledby="fall-promo-title">
      <Image src={appTheme.brand.logoPath} alt={appTheme.brand.displayName}
        width={1024} height={341} priority className={styles.logo} />
      <p className={styles.eyebrow}>Coffee · Community</p>
      <h2 id="fall-promo-title" className={styles.promoTitle}><em>Fall</em> Drinks</h2>
      <p className={styles.together}>Good Coffee Brings People Together</p>
      <div className={styles.promoDrinks} aria-hidden="true">
        {["pumpkin-pie", "caramel-apple", "campfire", "maple-pecan"].map((drink) => (
          <Image key={drink} src={`/assets/colattao/menu/autumn/${drink}.webp`} alt=""
            width={180} height={180} sizes="80px" className={styles.promoDrink} />
        ))}
      </div>
      <a href="#fall-drinks" className={styles.promoLink}>Explore fall drinks <span aria-hidden="true">↓</span></a>
      <details className={styles.poster}>
        <summary>View the fall collection</summary>
        <Image src="/assets/colattao/menu/autumn/owner-fall-menu.webp"
          alt="Colattao Fall Drinks seasonal poster featuring Pumpkin Pie Latte, Caramel Apple Latte, Campfire Cappuccino or Matcha, and Maple Pecan Latte."
          width={990} height={1280} sizes="(max-width: 470px) 86vw, 390px" />
      </details>
    </section>
  );
}
