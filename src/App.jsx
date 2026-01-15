import React, { useEffect, useRef, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; 
import {
  listenToLetters,
  addLetter as addLetterDB,
  updateLetter as updateLetterDB,
  deleteLetter as deleteLetterDB,
  toggleFavorite as toggleFavoriteDB,
  createComment,
  listenToComments,
} from "./firebase";

/* helper: short preview for cards */
function getPreview(text, lines = 3) {
  const split = (text || "").trim().split("\n");
  const sliced = split.slice(0, lines).join(" ");
  const short = sliced.length > 260 ? sliced.slice(0, 260) + "..." : sliced;
  return short || (text || "").slice(0, 260);
}

/* ----- tiny 4-petal rose ----- */
function TinyRose() {
  return (
    <div className="absolute bottom-2 right-2 w-10 h-10 pointer-events-none select-none">
      <div className="absolute left-[6px] bottom-[8px] w-5 h-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,210,215,1)_0%,rgba(180,70,90,0.35)_70%)] opacity-70 shadow-[0_1px_3px_rgba(0,0,0,0.15)]" />
      <div className="absolute left-[2px] bottom-[6px] w-4 h-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,200,210,1)_0%,rgba(200,80,100,0.4)_70%)] rotate-[-20deg] opacity-90 shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
      <div className="absolute right-[2px] bottom-[6px] w-4 h-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,205,215,1)_0%,rgba(180,60,80,0.4)_70%)] rotate-[20deg] opacity-90 shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
      <div className="absolute left-[10px] bottom-[4px] w-4 h-5 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,220,225,1)_0%,rgba(220,100,120,0.45)_70%)] shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
      <div className="absolute left-[12px] bottom-[10px] w-3 h-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,230,230,1)_0%,rgba(190,80,90,0.5)_70%)] border border-[rgba(180,70,80,0.4)] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
    </div>
  );
}

/* ----- background clouds ----- */
function SoftClouds() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute -top-20 -left-24 w-72 h-72 rounded-full bg-[rgba(110,110,110,0.18)] blur-[40px]" />
        <div className="absolute -top-10 left-16 w-56 h-56 rounded-full bg-[rgba(90,90,90,0.12)] blur-[50px]" />
        <div className="absolute top-10 -left-10 w-64 h-64 rounded-full bg-[rgba(70,70,70,0.08)] blur-[60px]" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[rgba(80,80,80,0.15)] blur-[55px]" />
        <div className="absolute bottom-10 right-24 w-64 h-64 rounded-full bg-[rgba(60,60,60,0.10)] blur-[60px]" />
        <div className="absolute bottom-28 right-10 w-48 h-48 rounded-full bg-[rgba(40,40,40,0.07)] blur-[70px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-[rgba(50,50,50,0.07)] blur-[80px]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-[.08] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 20% 30%, #000 20%, transparent 20%), radial-gradient(1.5px 1.5px at 70% 60%, #000 20%, transparent 20%)",
          backgroundSize: "120px 120px, 160px 160px",
        }}
      />
    </>
  );
}

/* ----- Letter Card ----- */
function LetterCard({ letter, onOpen, onToggleFavorite }) {
  if (!letter) return null; // Safety check
  
  return (
    <div
      onClick={() => onOpen(letter)}
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
          onToggleFavorite(letter);
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
          {letter.title || "Untitled"}
        </div>
        <div className="text-[0.7rem] text-[#3b2f2f]/60 mb-2">{letter.date || ""}</div>
        <div className="text-sm leading-relaxed text-[#3b2f2f]/90 whitespace-pre-line">
          {getPreview(letter.body)}
        </div>
      </div>
      <TinyRose />
    </div>
  );
}

/* ----- LOGIN COMPONENT ----- */
function LoginScreen({ onLogin }) { // Helper component logic moved inside
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError("Incorrect email or password.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdf6ec] text-[#3b2f2f] font-serif relative overflow-hidden">
        <SoftClouds />
        <div className="z-10 bg-white/60 p-8 rounded-xl border border-[#b69f83]/40 shadow-xl w-full max-w-sm text-center">
            <h2 className="text-2xl mb-6 font-handwritten">Who goes there?</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="p-2 rounded border border-[#b69f83]/30 bg-white/80 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="p-2 rounded border border-[#b69f83]/30 bg-white/80 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="bg-[#3b2f2f] text-[#fdf6ec] py-2 rounded hover:bg-[#2a2222] transition">
                    Unlock
                </button>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </form>
        </div>
    </div>
  );
}

/* ----- MAIN APP ----- */
export default function App() {
  // 1. ALL HOOKS MUST BE DECLARED AT THE TOP
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // letters
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // composer
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newBody, setNewBody] = useState("");

  // modal
  const [openLetter, setOpenLetter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBody, setEditBody] = useState("");
  const [typedText, setTypedText] = useState("");
  
  // comments
  const [comments, setComments] = useState([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  
  const typingIntervalRef = useRef(null);
  const commentsUnsubRef = useRef(null);

  // --- USE EFFECTS ---

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Letters Listener (only runs if user exists)
  useEffect(() => {
    if (!user) return; 

    const unsub = listenToLetters(
      (rows) => {
        setLetters(rows);
        setLoading(false);
      },
      (err) => {
        console.error("letters listener error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  // Typewriter effect (MOVED UP HERE so it's not after a return)
  useEffect(() => {
    if (!openLetter || isEditing) return;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    const full = openLetter.body || "";
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      i += 1;
      setTypedText(full.slice(0, i));
      if (i >= full.length) clearInterval(typingIntervalRef.current);
    }, 15);
    return () => typingIntervalRef.current && clearInterval(typingIntervalRef.current);
  }, [openLetter, isEditing]);


  // --- HELPER FUNCTIONS ---

  // filter
  const filteredLetters = letters.filter((l) => {
    if (!l) return false;
    const q = search.toLowerCase();
    const title = l.title || "";
    const date = l.date || "";
    const body = l.body || "";
    
    const matches =
      title.toLowerCase().includes(q) ||
      date.toLowerCase().includes(q) ||
      body.toLowerCase().includes(q);
    const fav = showOnlyFavorites ? l.favorite : true;
    return matches && fav;
  });

  async function addLetter() {
    if (!newTitle.trim() || !newBody.trim()) return;
    await addLetterDB({ title: newTitle, date: newDate, body: newBody });
    setNewTitle("");
    setNewDate("");
    setNewBody("");
  }

  async function onToggleFavorite(letter) {
    try {
      await toggleFavoriteDB(letter.id, letter.favorite);
      if (openLetter?.id === letter.id) {
        setOpenLetter({ ...openLetter, favorite: !openLetter.favorite });
      }
    } catch (e) {
      console.error(e);
    }
  }

  function openModal(letter) {
    setOpenLetter(letter);
    setTypedText("");
    setIsEditing(false);
    setEditTitle(letter.title);
    setEditDate(letter.date || "");
    setEditBody(letter.body);
    setComments([]);
    setNewCommentAuthor("");
    setNewCommentText("");

    if (commentsUnsubRef.current) commentsUnsubRef.current();
    commentsUnsubRef.current = listenToComments(
      letter.id,
      (rows) => setComments(rows),
      (err) => console.error("comments subscribe error:", err)
    );
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

  async function saveEdits() {
    if (!openLetter) return;
    const updates = {
      title: editTitle.trim() || "(untitled)",
      date: (editDate || "").trim(),
      body: editBody.trim(),
    };
    await updateLetterDB(openLetter.id, updates);
    setOpenLetter({ ...openLetter, ...updates });
    setIsEditing(false);
    setTypedText("");
  }

  async function removeLetter() {
    if (!openLetter) return;
    await deleteLetterDB(openLetter.id);
    closeModal();
  }

  async function handleAddComment() {
    if (!openLetter || !newCommentText.trim()) return;
    try {
      await createComment({
        letterId: openLetter.id,
        author: newCommentAuthor,
        text: newCommentText,
      });
      setNewCommentText("");
    } catch (e) {
      console.error("add comment failed:", e);
      alert("Could not add comment. Please try again.");
    }
  }

  // --- RENDERING ---
  // Returns happen LAST
  if (authLoading) return <div className="min-h-screen bg-[#fdf6ec]" />;
  if (!user) return <LoginScreen />;

  return (
    <div
      className="relative min-h-screen bg-[#fdf6ec] text-[#3b2f2f] font-serif flex flex-col"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0) 60%),
          radial-gradient(circle at 80% 30%, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0) 60%),
          radial-gradient(circle at 50% 80%, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)
        `,
        backgroundBlendMode: "screen",
      }}
    >
      <SoftClouds />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* HEADER */}
        <header className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-semibold text-[#3b2f2f] leading-none font-handwritten">
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
                    ? "bg-red-100 text-red-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]"
                    : "bg-[#fdf6ec]/80 text-[#3b2f2f] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]"
                }`}
              >
                {showOnlyFavorites ? "♥ only" : "all"}
              </button>
            </div>

            {/* trash panel restored toggle */}
            <div className="hidden" />

            <div className="flex flex-col items-start text-left opacity-50 cursor-not-allowed">
              <label className="text-[0.7rem] text-[#3b2f2f]/70 mb-1">typing sound</label>
              <button
                className="px-3 py-1 rounded text-sm border border-[rgba(182,159,131,0.4)] bg-[#fdf6ec]/40 text-[#3b2f2f]/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]"
                disabled
              >
                off
              </button>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 mx-auto px-4 pb-24">
          {/* grid */}
          <section className="flex-1 min-w-0">
            {loading ? (
              <div className="text-sm text-[#3b2f2f]/60 italic">loading…</div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {filteredLetters.length === 0 ? (
                  <div className="text-sm text-[#3b2f2f]/60 italic">
                    nothing matches that search yet.
                  </div>
                ) : (
                  filteredLetters.map((l) => (
                    <LetterCard
                      key={l.id}
                      letter={l}
                      onOpen={openModal}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))
                )}
              </div>
            )}
          </section>

          {/* compose */}
          <aside className="w-full lg:w-[320px] flex-shrink-0 bg-[#fdf6ec]/90 border border-[rgba(182,159,131,0.4)] rounded-xl shadow-[0_20px_30px_rgba(0,0,0,0.15)] p-4 h-fit">
            <div className="text-lg font-semibold text-[#3b2f2f] mb-2 leading-none font-handwritten">
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

            <label className="block text-xs text-[#3b2f2f]/70 mb-1">date</label>
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
              className="w-full text-center text-sm font-medium bg-[#3b2f2f] text-[#fdf6ec] rounded py-2 shadow hover:shadow-xl transition-shadow"
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
            className="relative w-full max-w-2xl bg-[#fdf6ec]/95 border border-[rgba(182,159,131,0.4)] rounded-xl shadow-[0_24px_40px_rgba(0,0,0,0.4)] text-[#3b2f2f] flex flex-col max-h-[85vh]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 10%, rgba(255,255,255,.6) 0%, rgba(0,0,0,0) 70%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-[rgba(182,159,131,0.3)]">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <>
                    <input
                      className="w-full mb-2 bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)] font-semibold"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      className="w-full bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-[0.7rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)] text-[#3b2f2f]/60"
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

              {/* action cluster */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleFavorite(openLetter)}
                  className="px-3 py-1 rounded bg-[#fdf6ec] border border-[rgba(182,159,131,0.5)] text-sm shadow hover:shadow-lg"
                  title="favorite"
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
                      onClick={removeLetter}
                      className="px-3 py-1 rounded bg-[#3b2f2f] text-[#fdf6ec] text-sm shadow hover:shadow-lg"
                    >
                      delete
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
                        setEditTitle(openLetter.title);
                        setEditDate(openLetter.date || "");
                        setEditBody(openLetter.body);
                        setTypedText("");
                      }}
                      className="px-3 py-1 rounded bg-[#fdf6ec] border border-[rgba(182,159,131,0.5)] text-sm shadow hover:shadow-lg"
                    >
                      cancel
                    </button>
                  </>
                )}

                <button
                  onClick={closeModal}
                  className="px-3 py-1 rounded bg-[#3b2f2f] text-[#fdf6ec] text-sm shadow hover:shadow-lg"
                >
                  close
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed font-[400] text-[#3b2f2f] whitespace-pre-line">
              {isEditing ? (
                <textarea
                  className="w-full h-full min-h-[10rem] resize-none bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm leading-relaxed shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
              ) : (
                <>
                  {typedText}
                  <span className="inline-block w-2 h-4 align-baseline bg-[#3b2f2f] ml-1 animate-pulse" />
                </>
              )}
            </div>

            {/* COMMENTS */}
            <div className="border-t border-[rgba(182,159,131,0.3)] px-5 py-3">
              <div className="text-[0.75rem] text-[#3b2f2f]/70 mb-2">
                notes back to this letter:
              </div>
              {comments.length === 0 ? (
                <div className="text-[0.75rem] italic text-[#3b2f2f]/50 mb-3">
                  no replies yet.
                </div>
              ) : (
                <ul className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <li key={c.id} className="text-sm">
                      <span className="font-semibold">{c.author || "someone"}</span>
                      <span className="text-[#3b2f2f]/70"> — </span>
                      <span>{c.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2">
                <input
                  className="bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm"
                  placeholder="your name"
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-white/70 border border-[rgba(182,159,131,0.4)] rounded px-2 py-1 text-sm"
                    placeholder="write back to this letter..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-3 py-1 rounded bg-[#3b2f2f] text-[#fdf6ec] text-xs shadow hover:shadow-lg"
                  >
                    add
                  </button>
                </div>
              </div>

              <div className="text-[0.7rem] text-[#3b2f2f]/60 mt-3 italic">
                just for you, my muse.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
