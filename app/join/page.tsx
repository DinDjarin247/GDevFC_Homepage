import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import JoinForm from '@/components/JoinForm';
import join from '@/data/join.json';
import styles from './join.module.css';

export const metadata = { title: 'JOIN THE PARTY — G DEV. F.C.' };

export default function JoinPage() {
  const { info, form } = join;

  return (
    <Frame
      badge={join.badge}
      header={<ScreenHeader title={join.heading} tone="magenta" />}
    >
      <div className={styles.grid}>
        <div className={styles.info}>
          <section>
            <h2 className={styles.blockTitle}>
              {info.eligibility.headingMain}
              <span className={styles.slash} aria-hidden="true">
                /
              </span>
              {info.eligibility.headingSub}
            </h2>
            <p className={styles.blockText}>{info.eligibility.text}</p>
            <ul className={styles.tags}>
              {info.eligibility.tags.map((tag) => (
                <li className={styles.tag} key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className={styles.blockTitle}>{info.process.heading}</h2>
            <p className={styles.blockText}>{info.process.text}</p>
          </section>

          <p className={styles.note}>{info.note}</p>
        </div>

        <JoinForm
          endpoint={join.formspreeEndpoint}
          fields={form.fields}
          submitLabel={form.submitLabel}
          successLabel={form.successLabel}
          successMessage={form.successMessage}
          errorMessage={form.errorMessage}
          sendingLabel={form.sendingLabel}
        />
      </div>
    </Frame>
  );
}
