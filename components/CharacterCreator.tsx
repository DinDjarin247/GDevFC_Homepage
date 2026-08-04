'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import join from '@/data/join.json';
import styles from '@/app/join/join.module.css';

type Status = 'idle' | 'sending' | 'success' | 'error';

const EMPTY = {
  name: '',
  playerId: '',
  job: '',
  favoriteGame: '',
  genres: [] as string[],
  originStory: '',
  inventory: '',
};

export default function CharacterCreator() {
  const { fields, classes, emptyMark } = join;

  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const selectedClass = classes.find((c) => c.id === form.job);
  const accent = selectedClass?.color;

  /** 클래스 색을 CSS 변수로 흘려보낸다 (미선택 시 기본 토큰 사용) */
  const accentVar = (accent ? { '--class-color': accent } : {}) as CSSProperties;

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleGenre = (genre: string) =>
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(genre)
        ? f.genres.filter((g) => g !== genre)
        : [...f.genres, genre],
    }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim() || !form.playerId.trim() || !form.job) {
      setError('이름 · 학번 · 클래스는 필수입니다.');
      return;
    }

    setError('');
    setStatus('sending');

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('playerId', form.playerId);
    payload.append('class', selectedClass ? selectedClass.label : '');
    payload.append('favoriteGame', form.favoriteGame);
    payload.append('genre', form.genres.join(', '));
    payload.append('originStory', form.originStory);
    payload.append('inventory', form.inventory);

    try {
      const res = await fetch(join.formspreeEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload,
      });

      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);

      setForm(EMPTY);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.grid}>
        <div className={styles.success} role="status">
          <p className={styles.successTitle}>
            <span className={styles.caret} aria-hidden="true">
              ▸
            </span>
            {join.successLabel}
          </p>
          <p className={styles.successText}>{join.successMessage}</p>
          <button
            type="button"
            className={styles.again}
            onClick={() => setStatus('idle')}
          >
            {join.againLabel}
          </button>
        </div>
      </div>
    );
  }

  /** 값이 없으면 ??? 로 표시 */
  const preview = (value: string) => value.trim() || emptyMark;
  const isEmpty = (value: string) => !value.trim();

  return (
    <div className={styles.grid}>
      {/* ---------- 좌: 입력 ---------- */}
      <div>
        <h2 className={styles.panelTitle}>
          <span className={styles.panelMark} aria-hidden="true">
            ◂
          </span>
          {join.panelTitle}
        </h2>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.field}>
            <span className={styles.labelRow}>
              <label className={styles.label} htmlFor="name">
                {fields.name.label}
              </label>
              <span className={styles.sub}>{fields.name.sub}</span>
            </span>
            <input
              id="name"
              className={styles.input}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={fields.name.placeholder}
              autoComplete="off"
              required
            />
          </div>

          <div className={styles.field}>
            <span className={styles.labelRow}>
              <label className={styles.label} htmlFor="playerId">
                {fields.playerId.label}
              </label>
              <span className={styles.sub}>{fields.playerId.sub}</span>
            </span>
            <input
              id="playerId"
              className={styles.input}
              value={form.playerId}
              onChange={(e) => set('playerId', e.target.value)}
              placeholder={fields.playerId.placeholder}
              autoComplete="off"
              required
            />
          </div>

          <div className={styles.field}>
            <span className={styles.labelRow}>
              <span className={styles.label}>{fields.job.label}</span>
              <span className={styles.sub}>{fields.job.sub}</span>
            </span>
            <div className={styles.classGrid} role="radiogroup" aria-label="CLASS">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  role="radio"
                  aria-checked={form.job === cls.id}
                  className={`${styles.classCard} ${
                    form.job === cls.id ? styles.on : ''
                  }`}
                  style={{ '--class-color': cls.color } as CSSProperties}
                  onClick={() => set('job', cls.id)}
                >
                  <span className={styles.classIcon} aria-hidden="true">
                    {cls.icon}
                  </span>
                  <span className={styles.classLabel}>{cls.label}</span>
                  <span className={styles.classEn}>{cls.en}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.labelRow}>
              <label className={styles.label} htmlFor="favoriteGame">
                {fields.favoriteGame.label}
              </label>
              <span className={styles.sub}>{fields.favoriteGame.sub}</span>
            </span>
            <input
              id="favoriteGame"
              className={styles.input}
              value={form.favoriteGame}
              onChange={(e) => set('favoriteGame', e.target.value)}
              placeholder={fields.favoriteGame.placeholder}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.labelRow}>
              <span className={styles.label}>{fields.genres.label}</span>
              <span className={styles.sub}>{fields.genres.sub}</span>
            </span>
            <div className={styles.genreRow}>
              {join.genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  aria-pressed={form.genres.includes(genre)}
                  className={`${styles.genre} ${
                    form.genres.includes(genre) ? styles.on : ''
                  }`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.labelRow}>
              <label className={styles.label} htmlFor="originStory">
                {fields.originStory.label}
              </label>
              <span className={styles.sub}>{fields.originStory.sub}</span>
            </span>
            <textarea
              id="originStory"
              className={styles.textarea}
              value={form.originStory}
              onChange={(e) => set('originStory', e.target.value)}
              placeholder={fields.originStory.placeholder}
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.labelRow}>
              <label className={styles.label} htmlFor="inventory">
                {fields.inventory.label}
              </label>
              <span className={styles.sub}>{fields.inventory.sub}</span>
            </span>
            <input
              id="inventory"
              type="url"
              className={styles.input}
              value={form.inventory}
              onChange={(e) => set('inventory', e.target.value)}
              placeholder={fields.inventory.placeholder}
              autoComplete="off"
            />
            <p className={styles.hint}>{fields.inventory.hint}</p>
          </div>

          {(error || status === 'error') && (
            <p className={styles.error} role="alert">
              {error || join.errorMessage}
            </p>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={status === 'sending'}
          >
            <span className={styles.caret} aria-hidden="true">
              ▸
            </span>
            {status === 'sending' ? join.sendingLabel : join.submitLabel}
          </button>
        </form>
      </div>

      {/* ---------- 우: 실시간 카드 미리보기 ---------- */}
      <div className={styles.cardCol}>
        <h2 className={styles.panelTitle}>{join.cardTitle}</h2>

        <div className={styles.card} style={accentVar} aria-live="polite">
          <div className={styles.cardHead}>
            <span className={styles.cardAvatar} aria-hidden="true">
              {selectedClass ? selectedClass.icon : '?'}
            </span>
            <span className={styles.cardNames}>
              <p className={styles.cardName}>{preview(form.name)}</p>
              <span className={styles.cardClass}>
                {selectedClass ? selectedClass.en : emptyMark}
              </span>
            </span>
          </div>

          <div className={styles.cardRows}>
            <div className={styles.cardRow}>
              <span className={styles.cardKey}>PLAYER ID</span>
              <p
                className={`${styles.cardVal} ${
                  isEmpty(form.playerId) ? styles.empty : ''
                }`}
              >
                {preview(form.playerId)}
              </p>
            </div>

            <div className={styles.cardRow}>
              <span className={styles.cardKey}>FAVORITE GAME</span>
              <p
                className={`${styles.cardVal} ${
                  isEmpty(form.favoriteGame) ? styles.empty : ''
                }`}
              >
                {preview(form.favoriteGame)}
              </p>
            </div>

            <div className={styles.cardRow}>
              <span className={styles.cardKey}>ORIGIN STORY</span>
              <p
                className={`${styles.cardVal} ${styles.cardStory} ${
                  isEmpty(form.originStory) ? styles.empty : ''
                }`}
              >
                {preview(form.originStory)}
              </p>
            </div>

            <div className={styles.cardRow}>
              <span className={styles.cardKey}>INVENTORY</span>
              <p
                className={`${styles.cardVal} ${
                  isEmpty(form.inventory) ? styles.empty : ''
                }`}
              >
                {preview(form.inventory)}
              </p>
            </div>

            <div className={styles.cardRow}>
              <span className={styles.cardKey}>GENRE</span>
              {form.genres.length > 0 ? (
                <span className={styles.chips}>
                  {form.genres.map((genre) => (
                    <span className={styles.chip} key={genre}>
                      {genre}
                    </span>
                  ))}
                </span>
              ) : (
                <p className={`${styles.cardVal} ${styles.empty}`}>{emptyMark}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
