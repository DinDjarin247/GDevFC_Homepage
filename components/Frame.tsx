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
  /**
   * true 면 좁은 화면(모바일)에서 배지/헤더/여백/테두리를 모두 없애고
   * 패널이 뷰포트를 그대로 채우는 전체화면 모드가 된다. 데스크톱에는
   * 영향이 없다 — 헤더의 BACK 링크가 사라지므로, 이 모드를 켤 때는
   * 화면 안에 별도의 나가기 버튼을 반드시 마련해야 한다.
   */
  immersiveMobile?: boolean;
  children: ReactNode;
};

/** 모든 화면이 공유하는 CRT 패널 셸 */
export default function Frame({
  badge,
  header,
  background,
  fullBleedBody = false,
  immersiveMobile = false,
  children,
}: FrameProps) {
  return (
    <main
      className={`${styles.page} ${immersiveMobile ? styles.immersive : ''} ${
        fullBleedBody ? styles.fixedHeight : ''
      }`}
    >
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
