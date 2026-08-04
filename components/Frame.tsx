import type { ReactNode } from 'react';
import styles from './Frame.module.css';

type FrameProps = {
  /** 좌측 상단 라임 배지 텍스트 */
  badge: string;
  /** 상단 바 내용 (SysBar 또는 ScreenHeader) */
  header: ReactNode;
  children: ReactNode;
};

/** 모든 화면이 공유하는 CRT 패널 셸 */
export default function Frame({ badge, header, children }: FrameProps) {
  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <span className={styles.badge}>{badge}</span>
        <div className={styles.header}>{header}</div>
        <div className={styles.body}>{children}</div>
      </div>
    </main>
  );
}
