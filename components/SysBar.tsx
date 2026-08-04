import site from '@/data/site.json';
import styles from './Bars.module.css';

type SysBarProps = {
  /** 상태 표시 앞에 점을 찍을지 (SELECT MODE 화면) */
  dot?: boolean;
  /** 좌측 시스템 라벨에 글리치 효과를 줄지 */
  glitch?: boolean;
};

/** 홈 / 셀렉트 화면의 상단 시스템 바 */
export default function SysBar({ dot = false, glitch = false }: SysBarProps) {
  const label = `${site.sysLabel} // ${site.version}`;

  return (
    <>
      <span
        className={`${styles.sysLabel} ${glitch ? styles.glitch : ''}`}
        data-text={label}
      >
        {label}
      </span>
      <span className={styles.status}>
        {dot && <i className={styles.dot} aria-hidden="true" />}
        {site.statusLabel}
      </span>
    </>
  );
}
