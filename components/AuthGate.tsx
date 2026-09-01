'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/useAuth';
import LoginScroll from '@/components/LoginScroll';
import styles from './AuthGate.module.css';

type AuthGateProps = {
  children: ReactNode;
};

/**
 * 로그인 상태면 children을 그대로 보여주고, 아니면 "고대 낡은 스크롤" 로그인 폼으로
 * 대체한다. 실제 접근 제어는 Supabase RLS가 담당하고(로그인 안 하면 쿼리 결과가
 * 비어있음) 이 컴포넌트는 UX만 처리한다.
 *
 * 이미 로그인된 상태로 페이지에 들어온 경우는 바로 children을 보여주고,
 * 이 화면에서 방금 로그인한 경우에만 스크롤이 보라 불꽃으로 타서 사라지는
 * 연출을 보여준 뒤 children으로 전환한다 (LoginScroll의 onSuccess).
 */
export default function AuthGate({ children }: AuthGateProps) {
  const { session, loading } = useAuth();
  const [checkedInitial, setCheckedInitial] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (loading || checkedInitial) return;
    setCheckedInitial(true);
    if (session) setRevealed(true);
  }, [loading, session, checkedInitial]);

  if (loading || !checkedInitial) return null;
  if (revealed) return <>{children}</>;

  return (
    <div className={styles.wrap}>
      <LoginScroll onSuccess={() => setRevealed(true)} />
    </div>
  );
}
