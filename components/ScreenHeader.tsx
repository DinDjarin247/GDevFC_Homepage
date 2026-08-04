import Link from 'next/link';
import styles from './Bars.module.css';

type ScreenHeaderProps = {
  title: string;
  /** 타이틀 색상 계열 */
  tone?: 'lime' | 'magenta';
  /** 뒤로가기 목적지 */
  backHref?: string;
  /** 우측에 표시할 텍스트 (예: "ONLINE", "01/06") */
  aside?: string;
};

/** 하위 페이지 상단의 BACK / 타이틀 / 상태 바 */
export default function ScreenHeader({
  title,
  tone = 'lime',
  backHref = '/select',
  aside,
}: ScreenHeaderProps) {
  return (
    <div className={styles.screenHeader}>
      <Link href={backHref} className={styles.back}>
        <span aria-hidden="true">‹</span> BACK
      </Link>
      <h1 className={`${styles.title} ${styles[tone]}`}>{title}</h1>
      {aside && <span className={styles.aside}>{aside}</span>}
    </div>
  );
}
