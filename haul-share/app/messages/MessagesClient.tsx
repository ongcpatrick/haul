'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Conversation, Message } from '@/lib/types';

const WORKER = 'https://haul-ai.haulapp.workers.dev';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function convName(conv: Conversation, currentUserId: string) {
  if (conv.type === 'group') return conv.name ?? 'Group chat';
  const other = conv.members.find((m) => m.id !== currentUserId);
  return other?.display_name ?? other?.username ?? 'DM';
}

function convAvatar(conv: Conversation, currentUserId: string) {
  if (conv.type === 'group') return null;
  const other = conv.members.find((m) => m.id !== currentUserId);
  return other?.avatar_url ?? null;
}

function convInitial(conv: Conversation, currentUserId: string) {
  const name = convName(conv, currentUserId);
  return name[0]?.toUpperCase() ?? '?';
}

interface Props {
  currentUserId: string;
  initialActiveId: string | null;
}

export default function MessagesClient({ currentUserId, initialActiveId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialActiveId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setConversations(json.data);
      }
    } catch { /* noop */ } finally {
      setLoadingConvs(false);
    }
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    setLoadingMsgs(true);
    const res = await fetch(`/api/messages/${id}`);
    if (!res.ok) { setLoadingMsgs(false); return; }
    const json = await res.json();
    if (json.success) setMessages(json.data);
    setLoadingMsgs(false);
    // mark read locally
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, unread_count: 0 } : c));
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const id = setInterval(() => loadMessages(activeId), 3_000);
    return () => clearInterval(id);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);

  const openConv = (id: string) => {
    setActiveId(id);
    setMessages([]);
    window.history.replaceState(null, '', `/messages?c=${id}`);
  };

  const send = async () => {
    if (!activeId || (!text.trim() && true) || sending) return;
    if (!text.trim()) return;
    setSending(true);
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: activeId,
      sender_id: currentUserId,
      body: text.trim(),
      haul_id: null,
      created_at: new Date().toISOString(),
      sender: { id: currentUserId, username: 'me', display_name: null, avatar_url: null },
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');
    try {
      await fetch(`/api/messages/${activeId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body: text.trim() }),
      });
      loadMessages(activeId);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[var(--bg)]">

      {/* ── Left Sidebar ─────────────────────────────── */}
      <aside className={`flex flex-col border-r border-[var(--border)] bg-white w-full sm:w-80 flex-shrink-0 ${activeId ? 'hidden sm:flex' : 'flex'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
          <h1 className="text-lg font-extrabold text-[var(--text)]">Messages</h1>
          <button
            type="button"
            onClick={() => setShowNewDM(true)}
            aria-label="New message"
            className="p-2 rounded-full hover:bg-[var(--bg)] text-[var(--primary)] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M12 8v4M10 10h4" />
            </svg>
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-[var(--muted)]">No messages yet.</p>
              <button
                type="button"
                onClick={() => setShowNewDM(true)}
                className="mt-4 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const avatar = convAvatar(conv, currentUserId);
              const initial = convInitial(conv, currentUserId);
              const name = convName(conv, currentUserId);
              const last = conv.last_message;
              const isActive = conv.id === activeId;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => openConv(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg)] transition-colors text-left ${isActive ? 'bg-[var(--bg)]' : ''}`}
                >
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt="" className="w-12 h-12 rounded-full border border-[var(--border)] flex-shrink-0 object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-[var(--text)]' : 'font-semibold text-[var(--text)]'}`}>
                        {name}
                      </p>
                      {last && <span className="text-[10px] text-[var(--muted)] flex-shrink-0">{timeAgo(last.created_at as string)}</span>}
                    </div>
                    {last && (
                      <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)]'}`}>
                        {last.haul_id ? 'Shared a haul' : last.body ?? ''}
                      </p>
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Right: Thread ─────────────────────────────── */}
      <section className={`flex flex-col flex-1 min-w-0 ${!activeId ? 'hidden sm:flex' : 'flex'}`}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[var(--text)]">Your messages</p>
              <p className="text-sm text-[var(--muted)] mt-1">Send private hauls and messages to a friend or group.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewDM(true)}
              className="px-6 py-2.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-full hover:bg-[var(--primary-h)] transition-colors"
            >
              Send message
            </button>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-white">
              <button
                type="button"
                onClick={() => { setActiveId(null); window.history.replaceState(null, '', '/messages'); }}
                className="sm:hidden p-1.5 -ml-1.5 text-[var(--muted)] hover:text-[var(--text)]"
                aria-label="Back"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {convAvatar(activeConv, currentUserId) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={convAvatar(activeConv, currentUserId)!} alt="" className="w-9 h-9 rounded-full border border-[var(--border)] object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
                  {convInitial(activeConv, currentUserId)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[var(--text)] truncate">{convName(activeConv, currentUserId)}</p>
                {activeConv.type === 'direct' && (() => {
                  const other = activeConv.members.find((m) => m.id !== currentUserId);
                  return other ? (
                    <Link href={`/u/${other.username}`} className="text-xs text-[var(--primary)] hover:underline">
                      @{other.username}
                    </Link>
                  ) : null;
                })()}
                {activeConv.type === 'group' && (
                  <p className="text-xs text-[var(--muted)]">
                    {activeConv.members.map((m) => m.username).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={threadRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
              {loadingMsgs && messages.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-[var(--muted)]">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender_id === currentUserId;
                  const prevMsg = messages[i - 1];
                  const showAvatar = !isMe && msg.sender.id !== prevMsg?.sender_id;

                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {/* Avatar placeholder for alignment */}
                      {!isMe && (
                        <div className="w-7 flex-shrink-0">
                          {showAvatar && (
                            msg.sender.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={msg.sender.avatar_url} alt="" className="w-7 h-7 rounded-full border border-[var(--border)] object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--muted)]">
                                {msg.sender.username[0]?.toUpperCase()}
                              </div>
                            )
                          )}
                        </div>
                      )}

                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                        {/* Haul card attachment */}
                        {msg.haul_id && (
                          <Link
                            href={`/feed`}
                            className="block bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-md transition-shadow max-w-[200px]"
                          >
                            <div className="h-24 bg-[var(--bg)] flex items-center justify-center text-xs text-[var(--muted)]">
                              Haul
                            </div>
                            <p className="text-xs font-semibold text-[var(--text)] px-2 py-1.5 truncate">View haul</p>
                          </Link>
                        )}

                        {/* Text bubble */}
                        {msg.body && (
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-[var(--primary)] text-white rounded-br-sm'
                              : 'bg-[var(--surface)] text-[var(--text)] rounded-bl-sm'
                          }`}>
                            {msg.body}
                          </div>
                        )}

                        <span className="text-[10px] text-[var(--muted)] px-1">{timeAgo(msg.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[var(--border)] bg-white">
              <div className="flex items-center gap-2 bg-[var(--bg)] rounded-full px-4 py-2 border border-[var(--border)] focus-within:border-[var(--primary)] transition-colors">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="Message..."
                  maxLength={2000}
                  className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!text.trim() || sending}
                  className="text-[var(--primary)] font-semibold text-sm disabled:opacity-40 transition-opacity"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── New DM Modal ─────────────────────────────── */}
      {showNewDM && (
        <NewDMModal
          currentUserId={currentUserId}
          onClose={() => setShowNewDM(false)}
          onCreated={(id) => {
            setShowNewDM(false);
            loadConversations();
            openConv(id);
          }}
        />
      )}
    </div>
  );
}

// ── New DM / Group Chat creation modal ──────────────────────────────────────

interface NewDMModalProps {
  currentUserId: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}

function NewDMModal({ currentUserId, onClose, onCreated }: NewDMModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; username: string; display_name: string | null; avatar_url: string | null }[]>([]);
  const [selected, setSelected] = useState<typeof results>([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setResults(json.data.filter((u: { id: string }) => u.id !== currentUserId));
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, currentUserId]);

  const toggle = (user: typeof results[number]) => {
    setSelected((prev) => prev.some((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]);
  };

  const create = async () => {
    if (!selected.length || creating) return;
    setCreating(true);
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userIds: selected.map((u) => u.id),
        name: selected.length > 1 ? (groupName.trim() || null) : null,
      }),
    });
    const json = await res.json();
    setCreating(false);
    if (json.success) onCreated(json.data.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)]">
          <button type="button" onClick={onClose} className="p-1 text-[var(--muted)] hover:text-[var(--text)]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <h2 className="font-bold text-[var(--text)] flex-1 text-center">New message</h2>
          <button
            type="button"
            onClick={create}
            disabled={!selected.length || creating}
            className="text-sm font-bold text-[var(--primary)] disabled:opacity-40"
          >
            {creating ? '...' : 'Next'}
          </button>
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {selected.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => toggle(u)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-[var(--primary)] text-[var(--primary)] bg-white"
              >
                {u.username}
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Group name (shown when 2+ selected) */}
        {selected.length >= 2 && (
          <div className="px-4 pt-2">
            <input
              type="text"
              placeholder="Group name (optional)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
            />
          </div>
        )}

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
            <span className="text-sm font-semibold text-[var(--text)]">To:</span>
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="flex-1 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {searching ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.map((u) => {
            const isSelected = selected.some((s) => s.id === u.id);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => toggle(u)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg)] transition-colors"
              >
                {u.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full border border-[var(--border)] object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
                    {u.username[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[var(--text)]">{u.display_name ?? u.username}</p>
                  <p className="text-xs text-[var(--muted)]">@{u.username}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
