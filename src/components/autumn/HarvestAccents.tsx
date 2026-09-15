import styles from "./autumn.module.css";

/** Quiet, static line art; deliberately separate from the moving placeholder leaves. */
export default function HarvestAccents() {
  return (
    <svg className={styles.harvest} viewBox="0 0 240 70" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 27C8 20 3 37 10 50c5 10 26 13 39 3 12-10 5-29-9-26M28 28c-3-6-1-11 4-14l4 3c-6 2-6 5-5 11" />
        <ellipse cx="29" cy="43" rx="10" ry="17" />
        <path d="M20 27c-9 10-7 25 1 31m16-31c9 10 7 25-1 31M65 48l43-14 3 7-43 14Zm9 11 38-7 1 6-38 7ZM70 50l-2 3m12 9-2 2" />
        <path d="M134 31c-13-9-24 4-20 17 3 10 8 15 15 12 7 4 15-4 19-14 4-12-3-21-14-15Zm-1 0c-2-7 0-11 4-15m-3 7c5-8 13-8 18-5-5 7-11 8-18 5" />
        <path d="M164 59c10-10 18-17 26-21m-16 11c-13-3-13-13-12-20 10 3 16 11 12 20Zm10-8c-3-12 4-19 11-23 4 10 0 18-11 23Zm-7 8c13 0 21 5 22 13-10 1-18-3-22-13Zm21-15c10-7 19-7 27-3-7 7-16 9-27 3" />
      </g>
    </svg>
  );
}
