import play from '@/data/play.json';
import styles from './RotateGate.module.css';

type RotateGateProps = {
  children: React.ReactNode;
};

/**
 * 좁은 화면(모바일) + 세로 방향일 때 실제 콘텐츠 대신 "가로로 돌려주세요"
 * 안내를 보여준다. 데스크톱이나 이미 가로 방향인 화면에는 아무 영향 없다.
 * Screen Orientation Lock API 는 iOS Safari 미지원이라 쓰지 않고,
 * CSS `orientation` 미디어쿼리만으로 판단한다.
 */
export default function RotateGate({ children }: RotateGateProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.gate} aria-hidden="true">
        <span className={styles.icon}>📱</span>
        <h2 className={styles.title}>{play.rotate.title}</h2>
        <p className={styles.desc}>{play.rotate.desc}</p>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
