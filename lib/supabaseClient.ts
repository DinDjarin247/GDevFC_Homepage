import { createClient } from '@supabase/supabase-js';

// Supabase 환경변수가 아직 설정되지 않아도(.env.local 미설정) 정적 export 빌드와
// 로그인 전 페이지 렌더링이 깨지지 않도록 더미 값으로 폴백한다. createClient는 빈
// 문자열을 넘기면 즉시 예외를 던지므로, 실제 값이 없을 땐 유효한 형태의 더미
// URL/키를 대신 넣어 "요청은 실패하지만 앱은 죽지 않는" 상태로만 만든다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/** 브라우저에서 Supabase REST API를 직접 호출하는 싱글턴 클라이언트. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
