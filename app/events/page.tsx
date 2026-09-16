import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import EventsBoard from '@/components/EventsBoard';
import styles from './events.module.css';

export const metadata = { title: '외부행사 — G DEV. F.C.' };

export default function EventsPage() {
  return (
    <Frame badge="events" header={<ScreenHeader title="외부행사" tone="lime" />}>
      <section className={styles.intro} aria-labelledby="events-heading">
        <p className={styles.eyebrow}>BEYOND THE GAME</p>
        <h2 id="events-heading" className={styles.heading}>
          함께 만드는 경험, 더 넓은 무대로
        </h2>
        <p className={styles.description}>
          게임잼, 전시회, 컨퍼런스 등 동아리 밖에서 만나는 다양한 행사 소식을 전합니다.
        </p>
      </section>

      <EventsBoard />
    </Frame>
  );
}
