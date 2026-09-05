'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import PollView from './PollView';
import styles from './Board.module.css';

const ATTACHMENTS_BUCKET = 'board-attachments';
const SIGNED_URL_TTL = 60 * 60; // 1시간
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENTS = 5;

const CATEGORIES = [
  { id: 'free', label: '자유게시판' },
  { id: 'notice', label: '공지' },
  { id: 'info', label: '정보공유' },
  { id: 'recruit', label: '프로젝트 구인' },
] as const;

type Category = (typeof CATEGORIES)[number]['id'];

function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

const CATEGORY_BADGE_CLASS: Record<Category, string> = {
  free: 'badgeFree',
  notice: 'badgeNotice',
  info: 'badgeInfo',
  recruit: 'badgeRecruit',
};

const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTIONS = 6;

type PostRow = {
  id: string;
  title: string;
  category: Category;
  author_id: string;
  created_at: string;
  profiles: { codename: string } | null;
  comments: { count: number }[];
};

type PostDetail = {
  id: string;
  title: string;
  content: string;
  category: Category;
  author_id: string;
  created_at: string;
  updated_at: string;
  profiles: { codename: string } | null;
};

type CommentRow = {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles: { codename: string } | null;
};

type AttachmentRow = {
  id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  sort_order: number;
  url: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function uploadAttachments(files: File[], uid: string, postId: string) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const path = `${uid}/${postId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .upload(path, file);
    if (uploadError) throw uploadError;
    const { error: insertError } = await supabase.from('post_attachments').insert({
      post_id: postId,
      file_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      sort_order: i,
    });
    if (insertError) throw insertError;
  }
}

function validateFiles(files: File[]): string | null {
  if (files.length > MAX_ATTACHMENTS) return `첨부파일은 최대 ${MAX_ATTACHMENTS}개까지 가능합니다.`;
  const tooBig = files.find((f) => f.size > MAX_ATTACHMENT_SIZE);
  if (tooBig) return `${tooBig.name} 파일이 5MB를 초과합니다.`;
  return null;
}

async function createPoll(postId: string, question: string, options: string[]) {
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({ post_id: postId, question })
    .select('id')
    .single();
  if (pollError || !poll) throw pollError;

  const rows = options.map((label, i) => ({ poll_id: poll.id, label, sort_order: i }));
  const { error: optionsError } = await supabase.from('poll_options').insert(rows);
  if (optionsError) throw optionsError;
}

export default function Board() {
  const { session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('post');

  if (postId) return <PostDetailView postId={postId} />;
  return <BoardList onOpen={(id) => router.push(`/board?post=${id}`)} sessionReady={!!session} />;
}

function BoardList({
  onOpen,
  sessionReady,
}: {
  onOpen: (id: string) => void;
  sessionReady: boolean;
}) {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('free');
  const [files, setFiles] = useState<File[]>([]);
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('id, title, category, author_id, created_at, profiles(codename), comments(count)')
      .order('created_at', { ascending: false });
    setPosts((data as unknown as PostRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionReady) load();
  }, [sessionReady, load]);

  // 전체 보기에서는 공지를 맨 위에 고정하고, 그 안/나머지는 기존 최신순을 유지한다.
  const visiblePosts = (filter === 'all' ? posts : posts.filter((p) => p.category === filter))
    .slice()
    .sort((a, b) => Number(b.category === 'notice') - Number(a.category === 'notice'));

  function resetCompose() {
    setTitle('');
    setContent('');
    setCategory('free');
    setFiles([]);
    setPollEnabled(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function updatePollOption(i: number, value: string) {
    setPollOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  function addPollOption() {
    setPollOptions((prev) => (prev.length < MAX_POLL_OPTIONS ? [...prev, ''] : prev));
  }

  function removePollOption(i: number) {
    setPollOptions((prev) => (prev.length > MIN_POLL_OPTIONS ? prev.filter((_, idx) => idx !== i) : prev));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력하세요.');
      return;
    }
    const fileError = validateFiles(files);
    if (fileError) {
      setError(fileError);
      return;
    }
    const trimmedOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (pollEnabled && (!pollQuestion.trim() || trimmedOptions.length < MIN_POLL_OPTIONS)) {
      setError(`투표를 추가하려면 질문과 선택지 ${MIN_POLL_OPTIONS}개 이상이 필요합니다.`);
      return;
    }

    setError('');
    setSubmitting(true);

    const { data: inserted, error: insertError } = await supabase
      .from('posts')
      .insert({ author_id: profile.id, title: title.trim(), content: content.trim(), category })
      .select('id')
      .single();

    if (insertError || !inserted) {
      setSubmitting(false);
      setError('글 등록에 실패했습니다.');
      return;
    }

    try {
      if (files.length > 0) await uploadAttachments(files, profile.id, inserted.id);
      if (pollEnabled) await createPoll(inserted.id, pollQuestion.trim(), trimmedOptions);
    } catch {
      setError('글은 등록됐지만 첨부파일/투표 저장 중 일부가 실패했습니다.');
    }

    setSubmitting(false);
    resetCompose();
    setComposing(false);
    await load();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.categoryTabs}>
        <button
          type="button"
          className={`${styles.tab} ${filter === 'all' ? styles.tabOn : ''}`}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.tab} ${filter === c.id ? styles.tabOn : ''}`}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <span className={styles.commentsTitle}>▸ {filter === 'all' ? 'ALL POSTS' : categoryLabel(filter).toUpperCase()}</span>
        <button
          type="button"
          className={styles.newBtn}
          onClick={() => setComposing((c) => !c)}
        >
          {composing ? 'CLOSE' : '+ NEW POST'}
        </button>
      </div>

      {composing && (
        <form className={styles.composeForm} onSubmit={onSubmit}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
          />
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요."
          />
          <div className={styles.fileField}>
            <label className={styles.fileLabel}>
              첨부파일 (선택, 최대 {MAX_ATTACHMENTS}개 · 파일당 5MB)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            {files.length > 0 && (
              <p className={styles.fileHint}>
                {files.map((f) => f.name).join(', ')}
              </p>
            )}
          </div>

          <label className={styles.pollToggle}>
            <input
              type="checkbox"
              checked={pollEnabled}
              onChange={(e) => setPollEnabled(e.target.checked)}
            />
            투표 추가
          </label>

          {pollEnabled && (
            <div className={styles.pollBuilder}>
              <input
                className={styles.input}
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="투표 질문"
              />
              {pollOptions.map((opt, i) => (
                <div className={styles.pollOptionRow} key={i}>
                  <input
                    className={styles.input}
                    value={opt}
                    onChange={(e) => updatePollOption(i, e.target.value)}
                    placeholder={`선택지 ${i + 1}`}
                  />
                  {pollOptions.length > MIN_POLL_OPTIONS && (
                    <button
                      type="button"
                      className={styles.pollRemove}
                      onClick={() => removePollOption(i)}
                      aria-label="선택지 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < MAX_POLL_OPTIONS && (
                <button type="button" className={styles.pollAdd} onClick={addPollOption}>
                  + 선택지 추가
                </button>
              )}
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.composeActions}>
            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? 'POSTING...' : '▸ POST'}
            </button>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => {
                resetCompose();
                setComposing(false);
              }}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className={styles.empty}>불러오는 중...</p>
      ) : visiblePosts.length === 0 ? (
        <p className={styles.empty}>아직 등록된 글이 없습니다.</p>
      ) : (
        <div className={styles.list}>
          {visiblePosts.map((post) => (
            <button
              key={post.id}
              type="button"
              className={`${styles.row} ${post.category === 'notice' ? styles.rowNotice : ''}`}
              onClick={() => onOpen(post.id)}
            >
              <span className={styles.rowTitle}>
                <span className={`${styles.categoryBadge} ${styles[CATEGORY_BADGE_CLASS[post.category]]}`}>
                  {categoryLabel(post.category)}
                </span>
                {post.title}
              </span>
              <span className={styles.rowMeta}>
                {post.profiles?.codename ?? '???'} · {formatDate(post.created_at)} · 댓글{' '}
                {post.comments?.[0]?.count ?? 0}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PostDetailView({ postId }: { postId: string }) {
  const { profile } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('free');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: postData }, { data: attachmentData }, { data: commentData }] = await Promise.all([
      supabase
        .from('posts')
        .select('id, title, content, category, author_id, created_at, updated_at, profiles(codename)')
        .eq('id', postId)
        .single(),
      supabase
        .from('post_attachments')
        .select('id, file_path, file_name, mime_type, size_bytes, sort_order')
        .eq('post_id', postId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('comments')
        .select('id, content, author_id, created_at, profiles(codename)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true }),
    ]);

    setPost((postData as unknown as PostDetail) ?? null);
    setComments((commentData as unknown as CommentRow[]) ?? []);

    const rawAttachments = (attachmentData as unknown as AttachmentRow[]) ?? [];
    const withUrls = await Promise.all(
      rawAttachments.map(async (a) => {
        const isImage = a.mime_type?.startsWith('image/');
        const { data: signed } = await supabase.storage
          .from(ATTACHMENTS_BUCKET)
          .createSignedUrl(a.file_path, SIGNED_URL_TTL, isImage ? undefined : { download: a.file_name });
        return { ...a, url: signed?.signedUrl ?? null };
      })
    );
    setAttachments(withUrls);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDeletePost() {
    if (attachments.length > 0) {
      await supabase.storage.from(ATTACHMENTS_BUCKET).remove(attachments.map((a) => a.file_path));
    }
    await supabase.from('posts').delete().eq('id', postId);
    router.push('/board');
  }

  function startEdit() {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCategory(post.category);
    setEditError('');
    setEditing(true);
  }

  async function onSaveEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      setEditError('제목과 내용을 입력하세요.');
      return;
    }
    setEditError('');
    setSaving(true);
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
        category: editCategory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);
    setSaving(false);
    if (updateError) {
      setEditError('수정에 실패했습니다.');
      return;
    }
    setEditing(false);
    await load();
  }

  async function onDeleteComment(commentId: string) {
    await supabase.from('comments').delete().eq('id', commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  async function onSubmitComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile || !commentText.trim()) return;
    setSubmitting(true);
    await supabase.from('comments').insert({
      post_id: postId,
      author_id: profile.id,
      content: commentText.trim(),
    });
    setCommentText('');
    setSubmitting(false);
    await load();
  }

  // 수정은 작성자 본인만. 삭제는 작성자 본인 + 관리자(CHESS-01)도 가능(모더레이션 안전장치).
  const isOwner = (authorId: string) => !!profile && profile.id === authorId;
  const canDelete = (authorId: string) => isOwner(authorId) || profile?.role === 'admin';

  if (loading) return <p className={styles.empty}>불러오는 중...</p>;
  if (!post) return <p className={styles.empty}>글을 찾을 수 없습니다.</p>;

  const images = attachments.filter((a) => a.mime_type?.startsWith('image/'));
  const files = attachments.filter((a) => !a.mime_type?.startsWith('image/'));

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.backLink}
        onClick={() => router.push('/board')}
      >
        ‹ 목록으로
      </button>

      <div className={styles.detail}>
        {editing ? (
          <form className={styles.composeForm} onSubmit={onSaveEdit}>
            <select
              className={styles.select}
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              className={styles.input}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="제목"
            />
            <textarea
              className={styles.textarea}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="내용을 입력하세요."
            />
            {editError && <p className={styles.error}>{editError}</p>}
            <div className={styles.composeActions}>
              <button type="submit" className={styles.submit} disabled={saving}>
                {saving ? 'SAVING...' : '▸ SAVE'}
              </button>
              <button type="button" className={styles.cancel} onClick={() => setEditing(false)}>
                취소
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.postHead}>
            <span className={`${styles.categoryBadge} ${styles[CATEGORY_BADGE_CLASS[post.category]]}`}>
              {categoryLabel(post.category)}
            </span>
            <h2 className={styles.postTitle}>{post.title}</h2>
            <div className={styles.postMeta}>
              <span>
                {post.profiles?.codename ?? '???'} · {formatDate(post.created_at)}
                {post.updated_at !== post.created_at && ' (수정됨)'}
              </span>
              {(isOwner(post.author_id) || canDelete(post.author_id)) && (
                <span className={styles.metaActions}>
                  {isOwner(post.author_id) && (
                    <button type="button" className={styles.editBtn} onClick={startEdit}>
                      수정
                    </button>
                  )}
                  {canDelete(post.author_id) && (
                    <button type="button" className={styles.deleteBtn} onClick={onDeletePost}>
                      삭제
                    </button>
                  )}
                </span>
              )}
            </div>
          </div>
        )}

        {!editing && (
          <>
            <p className={styles.postBody}>{post.content}</p>

            {images.length > 0 && (
              <div className={styles.postImages}>
                {images.map(
                  (img) =>
                    img.url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img key={img.id} src={img.url} alt={img.file_name} className={styles.postImage} />
                    )
                )}
              </div>
            )}

            {files.length > 0 && (
              <div className={styles.fileList}>
                {files.map((f) => (
                  <a
                    key={f.id}
                    href={f.url ?? '#'}
                    className={styles.fileItem}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📎 {f.file_name} <span className={styles.fileSize}>{formatSize(f.size_bytes)}</span>
                  </a>
                ))}
              </div>
            )}

            <PollView postId={postId} />
          </>
        )}

        <div className={styles.comments}>
          <p className={styles.commentsTitle}>▸ COMMENTS ({comments.length})</p>

          {comments.map((c) => (
            <div className={styles.comment} key={c.id}>
              <div className={styles.commentMeta}>
                <span>
                  {c.profiles?.codename ?? '???'} · {formatDate(c.created_at)}
                </span>
                {canDelete(c.author_id) && (
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => onDeleteComment(c.id)}
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className={styles.commentBody}>{c.content}</p>
            </div>
          ))}

          <form className={styles.commentForm} onSubmit={onSubmitComment}>
            <textarea
              className={styles.commentInput}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요."
              rows={2}
            />
            <button type="submit" className={styles.commentSubmit} disabled={submitting}>
              등록
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
