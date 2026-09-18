'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Frame from '@/components/Frame';
import SysBar from '@/components/SysBar';
import GateScene from '@/components/GateScene';
import { useArcadeKeys } from '@/lib/useArcadeKeys';
import site from '@/data/site.json';
import styles from './home.module.css';

/** 성문이 열리는 걸 보여주고 넘어가는 시간 */
const GATE_OPEN_MS = 520;

/** 타이틀 화면 — Enter / Space / 클릭으로 SELECT MODE 진입 */
export default function HomePage() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    // 연타로 타이머가 겹쳐 두 번 이동하지 않도록 한 번만 받는다
    if (timer.current) return;
    setEntering(true);
    timer.current = setTimeout(() => router.push('/select'), GATE_OPEN_MS);
  }, [router]);

  useEffect(() => {
    router.prefetch('/select');
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router]);

  useArcadeKeys({ onEnter: start, allowSpace: true });

  return (
    <Frame
      badge={site.badge}
      header={<SysBar />}
      background={<GateScene className={styles.bg} opening={entering} />}
    >
      <div className={styles.stage}>
        <div className={styles.content}>
          <h1 className={styles.title}>{site.title}</h1>
          <p className={styles.tagline}>{site.tagline}</p>
          <button type="button" className={styles.start} onClick={start} disabled={entering}>
            <span className={styles.caret} aria-hidden="true">
              ▸
            </span>
            {site.startLabel}
          </button>
        </div>
      </div>
    </Frame>
  );
}
