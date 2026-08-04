'use client';

import { useState, type FormEvent } from 'react';
import styles from '@/app/join/join.module.css';

type Field = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  options?: string[];
};

type JoinFormProps = {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
  successLabel: string;
  successMessage: string;
  errorMessage: string;
  sendingLabel: string;
};

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function JoinForm({
  endpoint,
  fields,
  submitLabel,
  successLabel,
  successMessage,
  errorMessage,
  sendingLabel,
}: JoinFormProps) {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);

      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>
          <span className={styles.caret} aria-hidden="true">
            ▸
          </span>
          {successLabel}
        </p>
        <p className={styles.successText}>{successMessage}</p>
        <button
          type="button"
          className={styles.again}
          onClick={() => setStatus('idle')}
        >
          다시 작성하기
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
      {fields.map((field) => (
        <div className={styles.field} key={field.name}>
          <label className={styles.label} htmlFor={field.name}>
            {field.label}
          </label>

          {field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              className={styles.select}
              required={field.required}
              defaultValue=""
            >
              <option value="" disabled>
                {field.placeholder}
              </option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              className={styles.input}
              placeholder={field.placeholder}
              required={field.required}
              autoComplete="off"
            />
          )}
        </div>
      ))}

      {status === 'error' && (
        <p className={styles.error} role="alert">
          {errorMessage}
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
        {status === 'sending' ? sendingLabel : submitLabel}
      </button>
    </form>
  );
}
