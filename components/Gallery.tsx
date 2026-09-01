'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import styles from './Gallery.module.css';

const BUCKET = 'gallery';
const SIGNED_URL_TTL = 60 * 60; // 1시간
const MAX_IMAGES = 10;

type GalleryImageRow = { image_path: string; sort_order: number };

type GalleryItem = {
  id: string;
  title: string | null;
  created_at: string;
  uploader_id: string;
  profiles: { codename: string } | null;
  gallery_images: GalleryImageRow[];
  coverUrl: string | null;
};

type GalleryDetail = GalleryItem & {
  images: { path: string; url: string | null }[];
};

export default function Gallery() {
  const { session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('item');

  if (itemId) return <GalleryDetailView itemId={itemId} />;
  return <GalleryGrid onOpen={(id) => router.push(`/gallery?item=${id}`)} sessionReady={!!session} />;
}

function GalleryGrid({
  onOpen,
  sessionReady,
}: {
  onOpen: (id: string) => void;
  sessionReady: boolean;
}) {
  const { session } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('gallery_items')
      .select('id, title, created_at, uploader_id, profiles(codename), gallery_images(image_path, sort_order)')
      .order('created_at', { ascending: false });

    if (fetchError || !data) {
      setLoading(false);
      return;
    }

    const withUrls = await Promise.all(
      (data as unknown as GalleryItem[]).map(async (item) => {
        const cover = [...item.gallery_images].sort((a, b) => a.sort_order - b.sort_order)[0];
        if (!cover) return { ...item, coverUrl: null };
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(cover.image_path, SIGNED_URL_TTL);
        return { ...item, coverUrl: signed?.signedUrl ?? null };
      })
    );

    setItems(withUrls);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionReady) load();
  }, [sessionReady, load]);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length === 0 || !session) {
      setError('업로드할 이미지를 선택하세요.');
      return;
    }
    if (files.length > MAX_IMAGES) {
      setError(`이미지는 최대 ${MAX_IMAGES}장까지 가능합니다.`);
      return;
    }
    setError('');
    setUploading(true);

    const { data: inserted, error: insertError } = await supabase
      .from('gallery_items')
      .insert({ uploader_id: session.user.id, title: title.trim() || null })
      .select('id')
      .single();

    if (insertError || !inserted) {
      setError('저장에 실패했습니다.');
      setUploading(false);
      return;
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
        const path = `${session.user.id}/${inserted.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
        if (uploadError) throw uploadError;
        const { error: imgError } = await supabase
          .from('gallery_images')
          .insert({ gallery_item_id: inserted.id, image_path: path, sort_order: i });
        if (imgError) throw imgError;
      }
      setTitle('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
    } catch {
      setError('이미지 업로드 중 일부가 실패했습니다.');
    }

    setUploading(false);
  }

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
            이미지 (여러 장 선택 가능, 최대 {MAX_IMAGES}장)
          </label>
          <input
            ref={fileInputRef}
            id="galleryFile"
            className={styles.input}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
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
            <button
              type="button"
              className={styles.card}
              key={item.id}
              onClick={() => onOpen(item.id)}
            >
              {item.coverUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img className={styles.thumb} src={item.coverUrl} alt={item.title ?? '갤러리 이미지'} />
              )}
              {item.gallery_images.length > 1 && (
                <span className={styles.countBadge}>+{item.gallery_images.length - 1}</span>
              )}
              <div className={styles.meta}>
                <p className={styles.itemTitle}>{item.title ?? '(제목 없음)'}</p>
                <span className={styles.itemSub}>
                  {item.profiles?.codename ?? '???'} ·{' '}
                  {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryDetailView({ itemId }: { itemId: string }) {
  const { profile } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<GalleryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_items')
      .select('id, title, created_at, uploader_id, profiles(codename), gallery_images(image_path, sort_order)')
      .eq('id', itemId)
      .single();

    if (!data) {
      setItem(null);
      setLoading(false);
      return;
    }

    const raw = data as unknown as GalleryItem;
    const ordered = [...raw.gallery_images].sort((a, b) => a.sort_order - b.sort_order);
    const images = await Promise.all(
      ordered.map(async (img) => {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(img.image_path, SIGNED_URL_TTL);
        return { path: img.image_path, url: signed?.signedUrl ?? null };
      })
    );

    setItem({ ...raw, coverUrl: null, images });
    setLoading(false);
  }, [itemId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete() {
    if (!item) return;
    const paths = item.images.map((i) => i.path);
    if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from('gallery_items').delete().eq('id', itemId);
    router.push('/gallery');
  }

  const canDelete = !!item && !!profile && (profile.id === item.uploader_id || profile.role === 'admin');

  if (loading) return <p className={styles.empty}>불러오는 중...</p>;
  if (!item) return <p className={styles.empty}>이미지를 찾을 수 없습니다.</p>;

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.backLink} onClick={() => router.push('/gallery')}>
        ‹ 목록으로
      </button>

      <div className={styles.detailHead}>
        <div>
          <h2 className={styles.detailTitle}>{item.title ?? '(제목 없음)'}</h2>
          <span className={styles.itemSub}>
            {item.profiles?.codename ?? '???'} · {new Date(item.created_at).toLocaleDateString('ko-KR')}
          </span>
        </div>
        {canDelete && (
          <button type="button" className={styles.deleteBtn} onClick={onDelete}>
            삭제
          </button>
        )}
      </div>

      <div className={styles.detailImages}>
        {item.images.map(
          (img, i) =>
            img.url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={img.path} src={img.url} alt={`${item.title ?? '이미지'} ${i + 1}`} className={styles.detailImage} />
            )
        )}
      </div>
    </div>
  );
}
