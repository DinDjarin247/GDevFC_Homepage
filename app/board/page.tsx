import { Suspense } from 'react';
import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import AuthGate from '@/components/AuthGate';
import Board from '@/components/Board';
import CampfireScene from '@/components/CampfireScene';
import styles from './board.module.css';

export const metadata = { title: 'BOARD — G DEV. F.C.' };

export default function BoardPage() {
  return (
    <Frame
      badge="board"
      header={<ScreenHeader title="게시판" tone="magenta" />}
      background={<CampfireScene className={styles.bg} />}
    >
      <Suspense fallback={null}>
        <AuthGate>
          <Board />
        </AuthGate>
      </Suspense>
    </Frame>
  );
}
