import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import SubmitForm from '@/components/weekly/SubmitForm';
import weekly from '@/data/weekly-gg.json';
import styles from '../weekly-gg.module.css';

export const metadata = { title: 'SUBMIT — WEEKLY GG — G DEV. F.C.' };

export default function WeeklySubmitPage() {
  const { submit } = weekly;
  return (
    <Frame
      badge={weekly.badge}
      header={<ScreenHeader title={submit.heading} tone="magenta" backHref="/weekly-gg" />}
    >
      <div className={styles.submitWrap}>
        <p className={styles.intro}>{submit.intro}</p>
        <SubmitForm />
      </div>
    </Frame>
  );
}
