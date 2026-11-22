'use client';

import { useState, type FormEvent } from 'react';
import join from '@/data/join.json';
import weekly from '@/data/weekly-gg.json';
import form from '@/app/join/join.module.css';
import styles from '@/app/weekly-gg/weekly-gg.module.css';

type Status = 'idle' | 'sending' | 'success' | 'error';

const EMPTY = {
  title: '',
  creator: '',
  email: '',
  link: '',
  buildType: '웹 빌드 (HTML5 · WebGL)',
  tagline: '',
  controls: '',
  note: '',
  consent: false,
};

const BUILD_TYPES = ['웹 빌드 (HTML5 · WebGL)', 'PC 빌드 (Windows exe)', '잘 모르겠음'];

/**
 * 게임 제출 — 업로드 화면 대신 "드라이브 링크를 메일로 보내는" 폼.
 * 정적 사이트라 파일을 받아둘 서버가 없고, 운영진이 빌드를 확인한 뒤 직접 올리기 때문이다.
 * 전송은 지원하기 폼과 같은 Formspree 로 가고, 메일 제목으로 구분한다.
 * 입력란 모양은 지원하기(CHARACTER CREATE) 폼의 것을 그대로 쓴다.
 */
export default function SubmitForm() {
  const { submit } = weekly;
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values.title.trim() || !values.creator.trim() || !values.email.trim() || !values.link.trim()) {
      setError('게임 제목 · 제작자 이름 · 이메일 · 드라이브 링크는 필수입니다.');
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(values.link.trim())) {
      setError('드라이브 링크는 https:// 로 시작하는 주소여야 합니다.');
      return;
    }
    if (!values.consent) {
      setError('개인정보 수집에 동의해 주세요.');
      return;
    }

    setError('');
    setStatus('sending');

    const payload = new FormData();
    // Formspree 예약 필드 — 메일 제목, 그리고 email 필드가 곧 답장 주소가 된다
    payload.append('_subject', `${submit.subjectPrefix} ${values.title.trim()}`);
    payload.append('email', values.email.trim());
    payload.append('게임 제목', values.title.trim());
    payload.append('제작자', values.creator.trim());
    payload.append('빌드 링크', values.link.trim());
    payload.append('빌드 종류', values.buildType);
    payload.append('한 줄 소개', values.tagline);
    payload.append('조작법', values.controls);
    payload.append('전할 말', values.note);

    try {
      const res = await fetch(join.formspreeEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload,
      });
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
      setValues(EMPTY);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={form.success} role="status">
        <p className={form.successTitle}>
          <span className={form.caret} aria-hidden="true">
            ▸
          </span>
          {submit.successLabel}
        </p>
        <p className={form.successText}>{submit.successMessage}</p>
        <button type="button" className={form.again} onClick={() => setStatus('idle')}>
          {submit.againLabel}
        </button>
      </div>
    );
  }

  const field = (
    key: 'title' | 'creator' | 'email' | 'link' | 'tagline',
    label: string,
    sub: string,
    placeholder: string,
    type = 'text'
  ) => (
    <label className={form.field}>
      <span className={form.labelRow}>
        <span className={form.label}>{label}</span>
        <span className={form.sub}>{sub}</span>
      </span>
      <input
        className={form.input}
        type={type}
        value={values[key]}
        onChange={set(key)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </label>
  );

  return (
    <form className={`${form.form} ${styles.submitForm}`} onSubmit={onSubmit} noValidate>
      {field('title', 'GAME TITLE', '게임 제목', '예: 새벽의 타자기')}
      {field('creator', 'CREATOR', '제작자 이름', '홍길동')}
      {field('email', 'EMAIL', '등록 안내를 받을 이메일', 'example@email.com', 'email')}
      {field('link', 'BUILD LINK', '구글 드라이브 공유 링크', 'https://drive.google.com/...', 'url')}
      <p className={form.hint}>
        공유 설정을 &quot;링크가 있는 모든 사용자&quot;로 바꿔 주세요. 폴더째 압축한 zip 하나가 가장 좋습니다.
      </p>

      <div className={form.field}>
        <span className={form.labelRow}>
          <span className={form.label}>BUILD TYPE</span>
          <span className={form.sub}>빌드 종류</span>
        </span>
        <div className={form.genreRow}>
          {BUILD_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`${form.genre} ${values.buildType === t ? form.on : ''}`}
              aria-pressed={values.buildType === t}
              onClick={() => setValues((v) => ({ ...v, buildType: t }))}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {field('tagline', 'ONE LINE', '한 줄 소개', '어떤 게임인지 한 문장으로')}

      <label className={form.field}>
        <span className={form.labelRow}>
          <span className={form.label}>CONTROLS</span>
          <span className={form.sub}>조작법</span>
        </span>
        <textarea
          className={form.textarea}
          value={values.controls}
          onChange={set('controls')}
          placeholder={'WASD: 이동\nSpace: 점프'}
        />
      </label>

      <label className={form.field}>
        <span className={form.labelRow}>
          <span className={form.label}>NOTE</span>
          <span className={form.sub}>전할 말 (선택)</span>
        </span>
        <textarea
          className={form.textarea}
          value={values.note}
          onChange={set('note')}
          placeholder="실행 방법, 알려진 버그, 버전 단계(프로토/알파/베타) 등"
        />
      </label>

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={values.consent}
          onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
        />
        <span>{submit.consent}</span>
      </label>

      {error && <p className={form.error}>{error}</p>}
      {status === 'error' && <p className={form.error}>{submit.errorMessage}</p>}

      <button type="submit" className={form.submit} disabled={status === 'sending'}>
        <span className={form.caret} aria-hidden="true">
          ▸
        </span>
        {status === 'sending' ? submit.sendingLabel : submit.submitLabel}
      </button>
    </form>
  );
}
