// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  listenToLetters,
  addLetter as addLetterDB,
  updateLetter as updateLetterDB,
  deleteLetter as deleteLetterDB,
  toggleFavorite as toggleFavoriteDB,
  listenToComments,
  createComment,
  updateComment,
  deleteComment,
} from "./firebase";

/* small helper for card preview */
function getPreview(text, lines = 3) {
  const split = (text || "").trim().split("\n");
  const sliced = split.slice(0, lines).join(" ");
  const short = sliced.length > 260 ? sliced.slice(0, 260) + "..." : sliced;
  return short || (text || "").slice(0, 260);
}

/* tiny rose (pure CSS) */
function TinyRose() {
  return (
    <div className="absolute bottom-2 right-2 w-10 h-10 pointer-events-none select-none">
      <div className="absolute left-[6px] bottom-[8px] w-5 h-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,210,215,1)_0%,rgba(180,70,90,0.35)_70%)] opacity-70 blur-[0.5px] shadow-[0_1px_3px_rgba(0,0,0,0.15)]" />
      <div className="absolute left-[2px] bottom-[6px] w-4 h-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,200,210,1)_0%,rgba(200,80,100,0.4)_70%)] rotate-[-20deg] opacity-90 shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
      <div className="absolute right-[2px] bottom-[6px] w-4 h-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,205,215,1)_0%,rgba(180,60,80,0.4)_70%)] rotate-[20deg] opacity-90 shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
      <div className="absolute left-[10px] bottom-[4px] w-4 h-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,220,225,1)_0%,rgba(220,100,120,0.45)_70%)] opacity-95 shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
      <div className="absolute left-[12px] bottom-[10px] w-3 h-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,230,230,1)_0%,rgba(190,80,90,0.5)_70%)] border border-[rgba(180,70,80,0.4)] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
    </div>
  );
}

/* very soft gray "clouds" background (pure CSS) */
function SoftClouds() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <div className="absolute -top-20 -left-24 w-72 h-72 rounded-full bg-[rgba(110,110,110,0.18)] blur-[40px]" />
      <div className="absolute -top-10 left-16 w-56 h-56 rounded-full bg-[rgba(90,90,90,0.12)] blur-[50px]" />
      <div className="absolute top-10 -left-10 w-64 h-64 rounded-full bg-[rgba(70,70,70,0.08)] blur-[60px]" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[rgba(80,80,80,0.15)] blur-[55px]" />
      <div className="absolute bottom-10 right-24 w-64 h-64 rounded-full bg-[rgba(60,60,60,0.10)] blur-[60px]" />
      <div className="absolute bottom-28 right-10 w-48 h-48 rounded-full bg-[rgba(40,40,40,0.07)] blur-[70px]" />
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-[rgba(50,50,50,0.07)] blur-[80px]" />
    </div>
  );
}

export default function App() {
  /* ===== global state ===== */
  const [letters, setLetters] = useState([]);
  const [search, setSearch] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // compose form
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newBody, setNewBody] = useState("");

  // modal letter
  const [openLetter, setOpenLetter] = useState(null);

  // edit letter
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBody, setEditBody] = useState("");

  // comments
  const [comments, setComments] = useState([]);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

  // edit comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // typewriter
  const [typedText, setTypedText] = useState("");
  const typingIntervalRef = useRef(null);

  /* ===== listen to letters (realtime) ===== */
  useEffect(() => {
    const unsub = listenToLetters(setLetters);
    return () => unsub();
  }, []);

  /* ===== derived filtered list ===== */
  const filteredLetters = letters.filter((l) => {
    const q = search.trim().toLowerCase();
    const m =
      l.title?.toLowerCase().includes(q) ||
      (l.date || "").toLowerCase().includes(q) ||
      l.body?.toLowerCase().includes(q);
    const f = showOnlyFavorites ? !!l.favorite : true;
    return m && f;
  });

  /* ===== actions: letters ===== */
  async function addLetter() {
    if (!newTitle.trim() || !newBody.trim()) return;
    await addLetterDB({
      title: newTitle.trim(),
      date: newDate.trim() || new Date().toISOString().slice(0, 10),
      body: newBody.trim(),
    });
    setNewTitle("");
    setNewDate("");
    setNewBody("");
  }

  async function toggleFavorite(letter) {
    await toggleFavoriteDB(letter.id, letter.favorite);
  }

  async function removeLetter(id) {
    await deleteLetterDB(id);
    closeModal();
  }

  async function saveEdits() {
    if (!openLetter) return;
    await updateLetterDB(openLetter.id, {
      title: editTitle.trim() || "(untitled)",
      date: editDate.trim(),
      body: editBody.trim(),
    });
    setIsEditing(false);
    setTypedText("");
  }

  /* ===== comments: add/edit/delete ===== */
  async function addComment() {
    if (!openLetter || !commentText.trim()) return;
    await createComment({
      letterId: openLetter.id,
      text: commentText.trim(),
      author: commentAuthor.trim(),
    });
    setCommentText("");
  }

  function startEditComment(c) {
    setEditingCommentId(c.id);
    setEditingCommentText(c.text || "");
  }
  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentText("");
  }
  async function saveEditComment() {
    if (!editingCommentId || !editingCommentText.trim()) return;
    await updateComment(editingCommentId, { text: editingCommentText.trim() });
    setEditingCommentId(null);
    setEditingCommentText("");
  }
  async function removeComment(id) {
    await deleteComment(id);
  }

  /* ===== open / close modal ===== */
  function openModal(letter) {
    setOpenLetter(letter);
    setIsEditing(false);
    setEditTitle(letter.title || "");
    setEditDate(letter.date || "");
    setEditBody(letter.body || "");
    setTypedText("");
    setCommentText("");
    setCommentAuthor("");
    setEditingCommentId(null);
    setEditingCommentText("");

    // attach live comments
    if (letter?.id) {
      if (commentsUnsubRef.current) commentsUnsubRef.current();
      commentsUnsubRef.current = listenToComments(letter.id, setComments);
    }
  }

  function closeModal() {
    setOpenLetter(null);
    setTypedText("");
    setIsEditing(false);
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (commentsUnsubRef.current) {
      commentsUnsubRef.current();
      commentsUnsubRef.current = null;
    }
  }

  const commentsUnsubRef = useRef(null);

  /* ===== typewriter effect ===== */
  useEffect(() => {
    if (!openLetter || isEditing) return;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    let idx = 0;
    const full = openLetter.body || "";
    typingIntervalRef.current = setInterval(() => {
      idx += 1;
      setTypedText(full.slice(0, idx));
      if (idx >= full.length) clearInterval(typingIntervalRef.current);
    }, 15);
    return () => clearInterval(typingIntervalRef.current);
  }, [openLetter, isEditing]);

  /* ===== presentational subcomponents ===== */
  function LetterCard({ letter }) {
    return (
      <div
        onClick={() => openModal(letter)}
        className="relative cursor-pointer bg-[#fdf6ec]/90 border border-[rgba(182,159,131,0.4)] rounded-xl shadow-[0_20px_30px_rgba(0,0,0,0.15)] p-4 transition-shadow hover:shadow-xl max-w-[260px]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(255,255,255,.6) 0%, rgba(0,0,0,0) 70%)",
        }}
      >
        <div className="absolute -top-2 left-4 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-200 to-yellow-600 border border-yellow-800/40 shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(letter);
          }}
          className="absolute top-3 right-3 text-lg leading-none"
          title="favorite"
        >
          <span
            className={
              letter.favorite
                ? "text-red-500 drop-shadow-[0_0_4px_rgba(255,0,0,0.4)]"
                : "text-stone-400 hover:text-red-400"
            }
          >
            ♥
          </span>
        </button>

        <div className="pr-8">
          <div className="text-[1.05rem] font-semibold leading-snug text-[#3b2f2f]">
            {letter.title}
          </div>
          <div className="text-[0.7rem] text-[#3b2f2f]/60 mb-2">{letter.date}</div>
          <div className="text-sm leading-relaxed text-[#3b2f2f]/90 whitespace-pre-line">
            {getPreview(letter.body)}
          </div>
        </div>

        <TinyRose />
      </div>
    );
  }

  /* ===== render ===== */
  return (
    <div
      className="relative min-h-screen bg-[#fdf6ec] text-[#3b2f2f] font-serif flex flex-col"
      style={{
        // subtle paper texture via layered gradients
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0) 60%),
          radial-gradient(circle at 80% 30%, rgba(255,255,255,0.20) 0%, rgba(0,0,0,0) 60%),
          radial-gradient(circle at 50% 80%, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)
        `,
        backgroundBlendMode: "screen",
      }}
    >
      <SoftClouds />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* header */}
        <header className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-semibold leading-none font-handwritten">
              written with ink and heart ♡
            </div>
            <div className="text-[0.8rem] text-[#3b2f2f]/70 mt-2 italic">
              a sanctuary for all we are
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[#3b2f2f] text-sm">
            <div className="flex flex-col items-start text-left">
              <label className="text-[0.7rem] text-[#3b2f2f]/70 mb-1">
                search by title / date / words
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. friday, 2025-10, smile"
                className="bg-[#fdf6ec]/80 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)] placeholder:text-[rgba(182,159,131,0.6)]"
              />
            </div>

            <div className="flex flex-col items-start text-left">
              <label className="text-[0.7rem] text-[#3b2f2f]/70 mb-1">
                show only pinned favorites
              </label>
              <button
                onClick={() => setShowOnlyFavorites((v) => !v)}
                className={`px-3 py-1 rounded text-sm border border-[rgba(182,159,131,0.4)] shadow ${
                  showOnlyFavorites
                    ? "bg-red-100 text-red-600"
                    : "bg-[#fdf6ec]/80 text-[#3b2f2f]"
                }`}
              >
                {showOnlyFavorites ? "♥ only" : "all"}
              </button>
            </div>
          </div>
        </header>

        {/* main */}
        <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 mx-auto px-4 pb-24">
          {/* grid */}
          <section className="flex-1 min-w-0">
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filteredLetters.length === 0 && (
                <div className="text-sm text-[#3b2f2f]/60 italic">
                  nothing matches that search yet.
                </div>
              )}
              {filteredLetters.map((l) => (
                <LetterCard key={l.id} letter={l} />
              ))}
            </div>
          </section>

          {/* composer */}
          <aside className="w-full lg:w-[320px] flex-shrink-0 bg-[#fdf6ec]/90 border border-[rgba(182,159,131,0.4)] rounded-xl shadow-[0_20px_30px_rgba(0,0,0,0.15)] p-4 h-fit">
            <div className="text-lg font-semibold mb-2 leading-none font-handwritten">
              write a new letter
            </div>
            <div className="text-[0.75rem] text-[#3b2f2f]/70 mb-4 leading-snug">
              where our memories find their forever
            </div>

            <label className="block text-xs text-[#3b2f2f]/70 mb-1">title</label>
            <input
              className="w-full mb-3 bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="do you remember?"
            />

            <label className="block text-xs text-[#3b2f2f]/70 mb-1">date (optional)</label>
            <input
              className="w-full mb-3 bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              placeholder="YYYY-MM-DD"
            />

            <label className="block text-xs text-[#3b2f2f]/70 mb-1">body</label>
            <textarea
              className="w-full h-32 resize-none mb-4 bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm leading-relaxed shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="write like always..."
            />

            <button
              onClick={addLetter}
              className="w-full text-center text-sm font-medium bg-[#3b2f2f] text-[#fdf6ec] rounded py-2 shadow hover:shadow-xl"
            >
              add to board
            </button>
          </aside>
        </main>
      </div>

      {/* MODAL */}
      {openLetter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.45)] px-4 py-8"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl bg-[#fdf6ec]/95 border border-[rgba(182,159,131,0.4)] rounded-xl shadow-[0_24px_40px_rgba(0,0,0,0.4)] text-[#3b2f2f] flex flex-col max-h-[86vh]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 10%, rgba(255,255,255,.6) 0%, rgba(0,0,0,0) 70%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-[rgba(182,159,131,0.3)]">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <>
                    <input
                      className="w-full mb-2 bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      className="w-full bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-[0.7rem] text-[#3b2f2f]/60 focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      placeholder="YYYY-MM-DD"
                    />
                  </>
                ) : (
                  <>
                    <div className="text-lg font-semibold leading-tight break-words">
                      {openLetter.title}
                    </div>
                    <div className="text-[0.7rem] text-[#3b2f2f]/60">{openLetter.date}</div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleFavorite(openLetter)}
                  className="px-3 py-1 rounded bg-[#fdf6ec] border border-[rgba(182,159,131,0.5)] text-sm shadow hover:shadow-lg"
                >
                  {openLetter.favorite ? "♥" : "♡"}
                </button>

                {!isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setTypedText("");
                      }}
                      className="px-3 py-1 rounded bg-[#fdf6ec] border border-[rgba(182,159,131,0.5)] text-sm shadow hover:shadow-lg"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => removeLetter(openLetter.id)}
                      className="px-3 py-1 rounded bg-[#3b2f2f] text-[#fdf6ec] text-sm shadow hover:shadow-lg"
                    >
                      delete
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-3 py-1 rounded bg-[#3b2f2f] text-[#fdf6ec] text-sm shadow hover:shadow-lg"
                    >
                      close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={saveEdits}
                      className="px-3 py-1 rounded bg-[#3b2f2f] text-[#fdf6ec] text-sm shadow hover:shadow-lg"
                    >
                      save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditTitle(openLetter.title || "");
                        setEditDate(openLetter.date || "");
                        setEditBody(openLetter.body || "");
                        setTypedText("");
                      }}
                      className="px-3 py-1 rounded bg-[#fdf6ec] border border-[rgba(182,159,131,0.5)] text-sm shadow hover:shadow-lg"
                    >
                      cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* body (scrollable) */}
            <div className="flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed whitespace-pre-line">
              {isEditing ? (
                <textarea
                  className="w-full h-full min-h-[10rem] resize-none bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
              ) : (
                <>
                  {typedText}
                  <span className="inline-block w-2 h-4 align-baseline bg-[#3b2f2f] ml-1 animate-pulse" />
                </>
              )}

              {/* comments */}
              {!isEditing && (
                <div className="mt-6 pt-4 border-t border-[rgba(182,159,131,0.3)]">
                  <div className="text-[0.8rem] mb-2 text-[#3b2f2f]/70">
                    notes back to this letter:
                  </div>

                  {/* existing comments */}
                  <ul className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
                    {comments.length === 0 && (
                      <li className="text-[0.8rem] italic text-[#3b2f2f]/60">
                        no replies yet.
                      </li>
                    )}
                    {comments.map((c) => {
                      const isEditingC = editingCommentId === c.id;
                      return (
                        <li
                          key={c.id}
                          className="text-sm flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-[0.8rem]">
                              <span className="font-semibold">
                                {c.author || "someone"}
                              </span>
                              <span className="text-[#3b2f2f]/70"> — </span>
                              {!isEditingC ? (
                                <span className="break-words">{c.text}</span>
                              ) : (
                                <input
                                  className="w-full bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm"
                                  value={editingCommentText}
                                  onChange={(e) =>
                                    setEditingCommentText(e.target.value)
                                  }
                                />
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 flex items-center gap-1">
                            {!isEditingC ? (
                              <>
                                <button
                                  onClick={() => startEditComment(c)}
                                  className="px-2 py-1 rounded bg-[#fdf6ec] border border-[rgba(182,159,131,0.5)] text-[0.7rem] shadow hover:shadow-lg"
                                >
                                  edit
                                </button>
                                <button
                                  onClick={() => removeComment(c.id)}
                                  className="px-2 py-1 rounded bg-[#3b2f2f] text-[#fdf6ec] text-[0.7rem] shadow hover:shadow-lg"
                                >
                                  delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={saveEditComment}
                                  className="px-2 py-1 rounded bg-[#3b2f2f] text-[#fdf6ec] text-[0.7rem] shadow hover:shadow-lg"
                                >
                                  save
                                </button>
                                <button
                                  onClick={cancelEditComment}
                                  className="px-2 py-1 rounded bg-[#fdf6ec] border border-[rgba(182,159,131,0.5)] text-[0.7rem] shadow hover:shadow-lg"
                                >
                                  cancel
                                </button>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* add comment */}
                  <div className="flex items-center gap-2">
                    <input
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="your name (optional)"
                      className="flex-1 bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="write back to this letter..."
                      className="flex-1 bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-2 text-sm"
                    />
                    <button
                      onClick={addComment}
                      className="px-3 py-2 rounded bg-[#3b2f2f] text-[#fdf6ec] text-sm shadow hover:shadow-lg"
                    >
                      add
                    </button>
                  </div>

                  <div className="mt-3 text-[0.7rem] italic text-[#3b2f2f]/60">
                    just for you, my muse.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
