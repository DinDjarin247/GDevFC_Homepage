'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import LoginScroll from '@/components/LoginScroll';
import styles from './GlobalAuthCorner.module.css';

/** 모든 화면 우측 상단 귀퉁이에 붙는 로그인/로그아웃 위젯 (Frame이 전 페이지에 렌더링). */
export default function GlobalAuthCorner() {
  const { session, profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (loading) return null;

  return (
    <>
      {session ? (
        <div className={styles.pill}>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.name}>{profile?.codename ?? '...'}</span>
          <button type="button" className={styles.logout} onClick={() => signOut()}>
            LOGOUT
          </button>
        </div>
      ) : (
        <button type="button" className={styles.loginBtn} onClick={() => setOpen(true)}>
          ▸ LOGIN
        </button>
      )}

      {open && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <LoginScroll onClose={() => setOpen(false)} onSuccess={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
