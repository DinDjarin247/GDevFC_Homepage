'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { codenameToEmail, normalizeCodename, type Profile } from '@/lib/auth';

export type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  /** 최초 세션 확인이 끝났는지 (아직이면 로그인/로그아웃 화면을 깜빡이지 않도록 대기) */
  loading: boolean;
  signIn: (codename: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, codename, role, created_at')
    .eq('id', userId)
    .single();
  return data ?? null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      setProfile(data.session ? await fetchProfile(data.session.user.id) : null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setProfile(nextSession ? await fetchProfile(nextSession.user.id) : null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(codename: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: codenameToEmail(normalizeCodename(codename)),
      password,
    });
    if (error) return { error: '코드네임 또는 비밀번호가 올바르지 않습니다.' };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
