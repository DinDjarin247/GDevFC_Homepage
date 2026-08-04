'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Frame from '@/components/Frame';
import SysBar from '@/components/SysBar';
import { useArcadeKeys } from '@/lib/useArcadeKeys';
import site from '@/data/site.json';
import styles from './home.module.css';

/** 타이틀 화면 — Enter / Space / 클릭으로 SELECT MODE 진입 */
export default function HomePage() {
  const router = useRouter();

  const start = useCallback(() => {
    router.push('/select');
  }, [router]);

  useEffect(() => {
    router.prefetch('/select');
  }, [router]);

  useArcadeKeys({ onEnter: start, allowSpace: true });

  return (
    <Frame badge={site.badge} header={<SysBar />}>
      <div className={styles.stage}>
        <h1 className={styles.title}>{site.title}</h1>
        <p className={styles.tagline}>{site.tagline}</p>
        <button type="button" className={styles.start} onClick={start}>
          <span className={styles.caret} aria-hidden="true">
            ▸
          </span>
          {site.startLabel}
        </button>
      </div>
    </Frame>
  );
}
