import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import EventsBoard from '@/components/EventsBoard';
import TentScene from '@/components/TentScene';
import styles from './events.module.css';

export const metadata = { title: '캘린더 — G DEV. F.C.' };

export default function EventsPage() {
  return (
    <Frame
      badge="calendar"
      header={<ScreenHeader title="캘린더" tone="magenta" />}
      background={<TentScene className={styles.bg} />}
    >
      <section className={styles.intro} aria-labelledby="events-heading">
        <p className={styles.eyebrow}>✦ THE SEER&apos;S TENT ✦</p>
        <h2 id="events-heading" className={styles.heading}>
          수정구슬에 비친 다가올 일정
        </h2>
        <p className={styles.description}>
          게임잼, 전시회, 컨퍼런스 — 별이 알려주는 동아리 밖 행사 소식을 점성술사가 읽어드립니다.
        </p>
      </section>

      <EventsBoard />
    </Frame>
  );
}
