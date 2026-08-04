'use client';

import { useEffect, useRef } from 'react';

type Handlers = {
  onPrev?: () => void;
  onNext?: () => void;
  onEnter?: () => void;
  /** Space 도 Enter 로 취급할지 (타이틀 화면의 PRESS START 용) */
  allowSpace?: boolean;
};

/** 입력 요소 안에서는 아케이드 조작키를 가로채지 않는다 */
function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    tag === 'BUTTON' ||
    tag === 'A' ||
    el.isContentEditable
  );
}

/**
 * 화살표/Enter 로 화면을 조작하는 공용 훅.
 * - 마운트 직후 짧은 유예 시간을 둬서, 직전 페이지에서 넘어온 keyup/Enter 가
 *   곧바로 다음 화면으로 튀는 것을 막는다.
 * - 포커스가 폼 요소나 버튼에 있으면 기본 동작에 맡긴다.
 */
export function useArcadeKeys({
  onPrev,
  onNext,
  onEnter,
  allowSpace = false,
}: Handlers) {
  const ready = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ready.current = true;
    }, 250);

    const onKey = (e: KeyboardEvent) => {
      if (!ready.current || e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      } else if (onEnter && (e.key === 'Enter' || (allowSpace && e.key === ' '))) {
        e.preventDefault();
        onEnter();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [onPrev, onNext, onEnter, allowSpace]);
}
