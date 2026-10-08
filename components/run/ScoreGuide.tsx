import { COIN_POINTS, POINTS_PER_M, SMASH_POINTS } from './RunGame';
import styles from './ScoreGuide.module.css';

/**
 * 소개 화면의 "점수는 이렇게 매긴다" — 학점(쿠키런의 젤리)이 왜 중요한지 한눈에.
 * 숫자는 게임 코드(RunGame)의 값을 그대로 가져와 설명과 실제가 어긋나지 않게 한다.
 */
export default function ScoreGuide() {
  return (
    <section className={styles.wrap}>
      <h2 className={styles.title}>HOW TO SCORE</h2>
      <p className={styles.formula}>
        <span className={styles.run}>거리</span> + <span className={styles.credit}>학점</span> +{' '}
        <span className={styles.smash}>부수기</span> = <b>SCORE</b>
      </p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <i className={styles.iconRun} aria-hidden="true" />
          <p className={styles.cardTitle}>거리</p>
          <p className={styles.points}>1m = {POINTS_PER_M}점</p>
          <p className={styles.desc}>오래 달릴수록 쌓인다. 기본 점수.</p>
        </div>
        <div className={`${styles.card} ${styles.key}`}>
          <i className={styles.iconCredit} aria-hidden="true" />
          <p className={styles.cardTitle}>학점</p>
          <p className={styles.grades}>
            <span className={styles.gB}>B</span> {COIN_POINTS}점
            <span className={styles.gA}>A</span> {COIN_POINTS * 2}점
            <span className={styles.gAp}>A+</span> {COIN_POINTS * 3}점
          </p>
          <p className={styles.desc}>
            쿠키런의 젤리처럼 길을 따라 줄지어 있다. <b>점수의 큰 몫</b> — 같은 거리를 달려도 학점을 얼마나
            모았느냐가 순위를 가른다. 포물선으로 놓인 줄은 점프 궤적 그대로, 낮게 깔린 줄은 슬라이드로 쓸어 담는다.
          </p>
          <p className={styles.desc}>
            <b>갈림길</b> — 위 길(발판)은 위험하지만 파랑 A · 금색 A+ 가, 아래 길은 쉽지만 초록 B 가 놓여 있다.
            위에서 떨어져도 아래 길로 떨어질 뿐이니 욕심낼지는 당신 몫.
          </p>
        </div>
        <div className={styles.card}>
          <i className={styles.iconSmash} aria-hidden="true" />
          <p className={styles.cardTitle}>부수기</p>
          <p className={styles.points}>1개 = {SMASH_POINTS}점</p>
          <p className={styles.desc}>아메리카노 질주 · 거대화 · 타나의 대시로 장애물을 부수면.</p>
        </div>
      </div>

      <p className={styles.tip}>
        HUD 의 SCORE 아래에 세 갈래가 따로 쌓이고, 결과 화면에서 계산식 그대로 보여준다. 스테디는 학점이 1.5배.
      </p>
    </section>
  );
}
