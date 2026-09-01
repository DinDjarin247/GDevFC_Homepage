'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import styles from './Board.module.css';

type PostRow = {
  id: string;
  title: string;
  author_id: string;
  created_at: string;
  profiles: { codename: string } | null;
  comments: { count: number }[];
};

type PostDetail = {
  id: string;
  title: string;
  content: string;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('id, title, author_id, created_at, profiles(codename), comments(count)')
      .order('created_at', { ascending: false });
    setPosts((data as unknown as PostRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionReady) load();
  }, [sessionReady, load]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력하세요.');
      return;
    }
    setError('');
    setSubmitting(true);
    const { error: insertError } = await supabase.from('posts').insert({
      author_id: profile.id,
      title: title.trim(),
      content: content.trim(),
    });
    setSubmitting(false);
    if (insertError) {
      setError('글 등록에 실패했습니다.');
      return;
    }
    setTitle('');
    setContent('');
    setComposing(false);
    await load();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.commentsTitle}>▸ ALL POSTS</span>
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
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.composeActions}>
            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? 'POSTING...' : '▸ POST'}
            </button>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => setComposing(false)}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className={styles.empty}>불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className={styles.empty}>아직 등록된 글이 없습니다.</p>
      ) : (
        <div className={styles.list}>
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              className={styles.row}
              onClick={() => onOpen(post.id)}
            >
              <span className={styles.rowTitle}>{post.title}</span>
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
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: postData }, { data: commentData }] = await Promise.all([
      supabase
        .from('posts')
        .select('id, title, content, author_id, created_at, updated_at, profiles(codename)')
        .eq('id', postId)
        .single(),
      supabase
        .from('comments')
        .select('id, content, author_id, created_at, profiles(codename)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true }),
    ]);
    setPost((postData as unknown as PostDetail) ?? null);
    setComments((commentData as unknown as CommentRow[]) ?? []);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDeletePost() {
    await supabase.from('posts').delete().eq('id', postId);
    router.push('/board');
  }

  function startEdit() {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
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

  // 게시판 U/D는 관리자 예외 없이 작성자 본인에게만 허용한다.
  const isOwner = (authorId: string) => !!profile && profile.id === authorId;

  if (loading) return <p className={styles.empty}>불러오는 중...</p>;
  if (!post) return <p className={styles.empty}>글을 찾을 수 없습니다.</p>;

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
            <h2 className={styles.postTitle}>{post.title}</h2>
            <div className={styles.postMeta}>
              <span>
                {post.profiles?.codename ?? '???'} · {formatDate(post.created_at)}
                {post.updated_at !== post.created_at && ' (수정됨)'}
              </span>
              {isOwner(post.author_id) && (
                <span className={styles.metaActions}>
                  <button type="button" className={styles.editBtn} onClick={startEdit}>
                    수정
                  </button>
                  <button type="button" className={styles.deleteBtn} onClick={onDeletePost}>
                    삭제
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {!editing && <p className={styles.postBody}>{post.content}</p>}

        <div className={styles.comments}>
          <p className={styles.commentsTitle}>▸ COMMENTS ({comments.length})</p>

          {comments.map((c) => (
            <div className={styles.comment} key={c.id}>
              <div className={styles.commentMeta}>
                <span>
                  {c.profiles?.codename ?? '???'} · {formatDate(c.created_at)}
                </span>
                {isOwner(c.author_id) && (
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
