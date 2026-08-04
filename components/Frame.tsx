import type { ReactNode } from 'react';
import styles from './Frame.module.css';

type FrameProps = {
  /** 좌측 상단 라임 배지 텍스트 */
  badge: string;
  /** 상단 바 내용 (SysBar 또는 ScreenHeader) */
  header: ReactNode;
  /** 패널 전체(헤더 포함)를 가득 채우는 배경 레이어 — 예: 홈 화면 스타필드 */
  background?: ReactNode;
  /** true 면 본문의 max-width/좌우 여백을 없애고 패널 폭 전체를 채운다 (예: 게임 화면) */
  fullBleedBody?: boolean;
  children: ReactNode;
};

/** 모든 화면이 공유하는 CRT 패널 셸 */
export default function Frame({
  badge,
  header,
  background,
  fullBleedBody = false,
  children,
}: FrameProps) {
  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        {background && <div className={styles.bgLayer}>{background}</div>}
        <span className={styles.badge}>{badge}</span>
        <div className={styles.header}>{header}</div>
        <div className={`${styles.body} ${fullBleedBody ? styles.bodyFullBleed : ''}`}>
          {children}
        </div>
      </div>
    </main>
  );
}
