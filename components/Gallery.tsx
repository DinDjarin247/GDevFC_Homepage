'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import styles from './Gallery.module.css';

const BUCKET = 'gallery';
const SIGNED_URL_TTL = 60 * 60; // 1시간

type GalleryItem = {
  id: string;
  title: string | null;
  image_path: string;
  created_at: string;
  uploader_id: string;
  profiles: { codename: string } | null;
  url: string | null;
};

export default function Gallery() {
  const { session, profile } = useAuth();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('gallery_items')
      .select('id, title, image_path, created_at, uploader_id, profiles(codename)')
      .order('created_at', { ascending: false });

    if (fetchError || !data) {
      setLoading(false);
      return;
    }

    const withUrls = await Promise.all(
      (data as unknown as GalleryItem[]).map(async (item) => {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(item.image_path, SIGNED_URL_TTL);
        return { ...item, url: signed?.signedUrl ?? null };
      })
    );

    setItems(withUrls);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !session) {
      setError('업로드할 이미지를 선택하세요.');
      return;
    }
    setError('');
    setUploading(true);

    const ext = file.name.split('.').pop() ?? 'png';
    const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file);

    if (uploadError) {
      setError('업로드에 실패했습니다.');
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from('gallery_items').insert({
      uploader_id: session.user.id,
      title: title.trim() || null,
      image_path: path,
    });

    if (insertError) {
      setError('저장에 실패했습니다.');
    } else {
      setTitle('');
      setFile(null);
      (e.target as HTMLFormElement).reset();
      await load();
    }

    setUploading(false);
  }

  async function onDelete(item: GalleryItem) {
    await supabase.storage.from(BUCKET).remove([item.image_path]);
    await supabase.from('gallery_items').delete().eq('id', item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  const canDelete = (item: GalleryItem) =>
    profile && (profile.id === item.uploader_id || profile.role === 'admin');

  return (
    <div className={styles.wrap}>
      <form className={styles.uploadForm} onSubmit={onUpload}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="galleryTitle">
            제목 (선택)
          </label>
          <input
            id="galleryTitle"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 플레이테스트 스크린샷"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="galleryFile">
            이미지
          </label>
          <input
            id="galleryFile"
            className={styles.input}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <button type="submit" className={styles.submit} disabled={uploading}>
          {uploading ? 'UPLOADING...' : '▸ UPLOAD'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {loading ? (
        <p className={styles.empty}>불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>아직 업로드된 이미지가 없습니다.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div className={styles.card} key={item.id}>
              {canDelete(item) && (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => onDelete(item)}
                >
                  삭제
                </button>
              )}
              {item.url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img className={styles.thumb} src={item.url} alt={item.title ?? '갤러리 이미지'} />
              )}
              <div className={styles.meta}>
                <p className={styles.itemTitle}>{item.title ?? '(제목 없음)'}</p>
                <span className={styles.itemSub}>
                  {item.profiles?.codename ?? '???'} ·{' '}
                  {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
