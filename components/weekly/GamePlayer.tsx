'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import weekly from '@/data/weekly-gg.json';
import type { WeeklyGame } from '@/lib/types';
import styles from '@/app/weekly-gg/weekly-gg.module.css';

type Phase = 'idle' | 'loading' | 'ready' | 'error';

/**
 * 게임 실행 화면.
 *
 * 웹 빌드는 iframe 안에서 돌린다 — 게임의 CSS·전역 변수·키 입력이 홈페이지와
 * 섞이지 않게 하려는 것이다. 다만 빌드가 같은 출처(public/)에서 나오고 세이브에
 * localStorage·IndexedDB 를 쓰므로 allow-same-origin 은 열어둔다. 즉 이 격리는
 * "서로 방해하지 않게"이지 "믿을 수 없는 코드를 가두는" 보안 경계가 아니다.
 * 그래서 빌드는 운영진이 확인한 것만 저장소에 올린다.
 *
 * ▶ 를 누르기 전에는 iframe 을 아예 만들지 않는다. 들어오자마자 수십 MB 를
 * 받게 하지 않으려는 것이다.
 */
export default function GamePlayer({ game }: { game: WeeklyGame }) {
  const { labels } = weekly;
  const play = game.play;

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  // 다시 불러오기 — key 를 바꿔 iframe 을 새로 만든다
  const [run, setRun] = useState(0);
  const [touchOnly, setTouchOnly] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // 마우스·키보드가 없는 기기인지 — 화면 폭이 아니라 입력 장치로 판단한다
    setTouchOnly(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }, []);

  // Unity 임베드 페이지가 보내는 로딩 진행률 (public/wgg-builds/<id>/index.html 의 report)
  useEffect(() => {
    if (phase === 'idle') return;
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.source !== frameRef.current?.contentWindow) return;
      const data = e.data as { source?: string; type?: string; value?: number };
      if (!data || data.source !== 'weekly-gg') return;
      if (data.type === 'progress' && typeof data.value === 'number') {
        setProgress(data.value);
        // Unity 는 onload 뒤에도 한참 더 받는다 — 진행률이 오면 다시 로딩으로 돌린다
        if (data.value < 1) setPhase('loading');
      } else if (data.type === 'ready') {
        setPhase('ready');
      } else if (data.type === 'error') {
        setPhase('error');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [phase]);

  const start = useCallback(() => {
    setProgress(0);
    setPhase('loading');
    setRun((n) => n + 1);
  }, []);

  const fullscreen = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
    // 전체화면이 되면 키 입력이 게임으로 가도록 초점을 넘긴다
    frameRef.current?.focus();
  }, []);

  if (play.type === 'download') {
    return (
      <div className={`${styles.stageBox} ${styles.stagePanel}`}>
        <p className={styles.panelNote}>{labels.windowsOnly}</p>
        <a className={styles.playButton} href={play.file} download>
          <span className={styles.glyph} aria-hidden="true">
            ▼
          </span>
          {labels.download_}
          <small>{play.size}</small>
        </a>
        <p className={styles.panelRun}>
          <b>{labels.howToRun}</b> {play.run}
        </p>
        {touchOnly && <p className={styles.panelWarn}>{labels.pcOnly}</p>}
      </div>
    );
  }

  if (play.type === 'soon') {
    return (
      <div className={`${styles.stageBox} ${styles.stagePanel}`}>
        <strong className={styles.soon}>COMING SOON</strong>
        <p className={styles.panelNote}>{play.note}</p>
      </div>
    );
  }

  const pcOnly = !play.mobile && touchOnly;
  // 빌드 주소는 폴더("/wgg-builds/<id>/")로 적는다. Vercel 은 폴더 주소만 열고
  // ".../index.html" 은 404 로 돌리는데, next dev 는 반대로 public 폴더의 index.html 을
  // 폴더 주소로 내주지 않는다. 그래서 개발 서버에서만 파일 이름을 붙인다.
  const src = process.env.NODE_ENV === 'development' ? `${play.src}index.html` : play.src;

  return (
    <div className={styles.player}>
      <div
        ref={stageRef}
        className={styles.stageBox}
        style={{
          aspectRatio: play.aspect,
          // 세로로 짧은 화면에서 게임이 뷰포트를 넘치지 않도록, 높이가 아니라 폭을 줄여 비율을 지킨다
          maxWidth: `calc(78dvh * ${play.aspect.replace('/', ' / ').replace(/\s+/g, ' ')})`,
        }}
      >
        {phase === 'idle' ? (
          <div className={styles.cover}>
            {game.thumbnail && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img className={styles.coverImg} src={game.thumbnail} alt="" />
            )}
            <button type="button" className={styles.playButton} onClick={start}>
              <span className={styles.glyph} aria-hidden="true">
                ▶
              </span>
              {labels.play}
            </button>
            {pcOnly && <p className={styles.panelWarn}>{labels.pcOnly}</p>}
          </div>
        ) : (
          <>
            <iframe
              key={run}
              ref={frameRef}
              className={styles.frame}
              src={src}
              title={game.title}
              scrolling={play.scroll ? 'auto' : 'no'}
              sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-modals allow-popups allow-downloads"
              allow="fullscreen; gamepad; autoplay"
              onLoad={() => {
                // 일반 HTML 게임은 여기서 끝. Unity 는 이후 progress 메시지가 이어진다
                setPhase((p) => (p === 'loading' ? 'ready' : p));
                frameRef.current?.focus();
              }}
            />
            {phase === 'loading' && (
              <div className={styles.loading} role="status">
                <span className={styles.loadingLabel}>{labels.loading}</span>
                <span className={styles.bar}>
                  <span
                    className={progress > 0 ? styles.barFill : styles.barIdle}
                    style={progress > 0 ? { width: `${Math.round(progress * 100)}%` } : undefined}
                  />
                </span>
              </div>
            )}
            {phase === 'error' && (
              <div className={styles.loading} role="alert">
                <span className={styles.loadingLabel}>LOAD FAILED</span>
                <button type="button" className={styles.tool} onClick={start}>
                  {labels.restart}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.tool}
          onClick={fullscreen}
          disabled={phase === 'idle'}
        >
          ⛶ {labels.fullscreen}
        </button>
        <button type="button" className={styles.tool} onClick={start} disabled={phase === 'idle'}>
          ↻ {labels.restart}
        </button>
        <a className={styles.tool} href={src} target="_blank" rel="noreferrer">
          ↗ {labels.newTab}
        </a>
      </div>
    </div>
  );
}
