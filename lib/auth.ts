/** 코드네임 로그인을 Supabase Auth 이메일/비밀번호 로그인으로 매핑하기 위한 헬퍼. */

export const MEMBER_EMAIL_DOMAIN = 'members.gdevfc.local';

/** "COBRA-07" 같은 코드네임을 Supabase Auth용 합성 이메일로 변환한다. */
export function codenameToEmail(codename: string): string {
  return `${codename.trim().toLowerCase()}@${MEMBER_EMAIL_DOMAIN}`;
}

/** 입력 코드네임을 저장/비교용으로 정규화한다 (대문자, 앞뒤 공백 제거). */
export function normalizeCodename(codename: string): string {
  return codename.trim().toUpperCase();
}

export type Role = 'member' | 'admin';

export type Profile = {
  id: string;
  codename: string;
  role: Role;
  created_at: string;
};
