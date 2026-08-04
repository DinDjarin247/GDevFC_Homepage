import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import about from '@/data/about.json';
import site from '@/data/site.json';
import styles from './about.module.css';

export const metadata = { title: 'ABOUT — G DEV. F.C.' };

export default function AboutPage() {
  return (
    <Frame
      badge={about.badge}
      header={<ScreenHeader title={about.heading} aside={site.statusLabel} />}
    >
      <p className={styles.intro}>{about.intro}</p>

      <div className={styles.grid}>
        <section>
          <h2 className={styles.sectionTitle}>{about.history.heading}</h2>
          <dl className={styles.history}>
            {about.history.items.map((item, i) => (
              <div className={styles.historyRow} key={`${item.year}-${i}`}>
                <dt className={styles.year}>{item.year}</dt>
                <dd className={styles.historyText}>{item.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>{about.activities.heading}</h2>
          <ul className={styles.tags}>
            {about.activities.items.map((item) => (
              <li className={styles.tag} key={item}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.contact}>
          <h2 className={styles.sectionTitle}>{about.contact.heading}</h2>
          <div className={styles.links}>
            {about.contact.items.map((item) => (
              <a
                key={item.label}
                className={styles.link}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </Frame>
  );
}
