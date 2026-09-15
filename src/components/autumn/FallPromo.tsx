import Image from "next/image";
import appTheme from "@/config/theme";
import HarvestAccents from "./HarvestAccents";
import styles from "./autumn.module.css";

export default function FallPromo() {
  return (
    <section className={styles.promo} aria-labelledby="fall-promo-title">
      <Image src={appTheme.brand.logoPath} alt={appTheme.brand.displayName}
        width={1024} height={341} priority className={styles.logo} />
      <p className={styles.eyebrow}>Coffee · Community · Autumn</p>
      <h2 id="fall-promo-title" className={styles.promoTitle}><em>Fall</em> Drinks</h2>
      <p className={styles.together}>Good Coffee Brings People Together</p>
      <HarvestAccents />
      <a href="#fall-drinks" className={styles.promoLink}>Explore fall drinks <span aria-hidden="true">↓</span></a>
    </section>
  );
}
