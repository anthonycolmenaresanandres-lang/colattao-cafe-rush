import Image from "next/image";
import type { MenuItem } from "@/data/colattaoMenu";
import styles from "./autumn.module.css";

const DRINK_ART: Record<string, string> = {
  "Pumpkin Pie Latte": "pumpkin-pie",
  "Caramel Apple Latte": "caramel-apple",
  "Campfire Cappuccino or Matcha": "campfire",
  "Maple Pecan Latte": "maple-pecan",
};

/** Presentation only: names, descriptions and prices still come from menu data. */
export default function FallDrinkItem({ item }: { item: MenuItem }) {
  const art = DRINK_ART[item.name];
  return (
    <li className={styles.drinkItem}>
      {art && (
        <div className={styles.drinkArt}>
          <Image src={`/assets/colattao/menu/autumn/${art}.webp`} alt=""
            width={360} height={360} sizes="(max-width: 359px) 104px, 132px"
            className={styles.drinkImage} />
        </div>
      )}
      <div className={styles.drinkCopy}>
        <h3>{item.name}</h3>
        {item.description && <p>{item.description}</p>}
        <span className={styles.drinkPrice}><span className="sr-only">Price: </span>{item.price ?? "Ask"}</span>
      </div>
    </li>
  );
}
