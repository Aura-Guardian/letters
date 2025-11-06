import React, { useState, useEffect, useRef } from "react";
import {
  listenToLetters,
  createLetter,
  updateLetter,
  trashLetter,
  restoreLetterFromTrash,
  listenToComments,
  createComment,
} from "./firebase"; // <-- we import our Firestore helpers

/* helper: preview text inside each card */
function getPreview(text, lines = 3) {
  const split = text.trim().split("\n");
  const sliced = split.slice(0, lines).join(" ");
  const short = sliced.length > 260 ? sliced.slice(0, 260) + "..." : sliced;
  return short || text.slice(0, 260);
}

/* rose for card corner */
function TinyRose() {
  return (
    <div
      className="
        absolute bottom-2 right-2
        w-10 h-10
        pointer-events-none select-none
      "
    >
      {/* back petal */}
      <div
        className="
          absolute left-[6px] bottom-[8px]
          w-5 h-5
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,210,215,1)_0%,rgba(180,70,90,0.35)_70%)]
          opacity-70
          blur-[0.5px]
          shadow-[0_1px_3px_rgba(0,0,0,0.15)]
        "
      />
      {/* left petal */}
      <div
        className="
          absolute left-[2px] bottom-[6px]
          w-4 h-5
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,200,210,1)_0%,rgba(200,80,100,0.4)_70%)]
          rotate-[-20deg]
          opacity-90
          shadow-[0_2px_4px_rgba(0,0,0,0.15)]
        "
      />
      {/* right petal */}
      <div
        className="
          absolute right-[2px] bottom-[6px]
          w-4 h-5
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,205,215,1)_0%,rgba(180,60,80,0.4)_70%)]
          rotate-[20deg]
          opacity-90
          shadow-[0_2px_4px_rgba(0,0,0,0.15)]
        "
      />
      {/* front/bottom petal */}
      <div
        className="
          absolute left-[10px] bottom-[4px]
          w-4 h-5
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,220,225,1)_0%,rgba(220,100,120,0.45)_70%)]
          rotate-[0deg]
          opacity-95
          shadow-[0_2px_4px_rgba(0,0,0,0.2)]
        "
      />
      {/* rose core */}
      <div
        className="
          absolute left-[12px] bottom-[10px]
          w-3 h-3
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,230,230,1)_0%,rgba(190,80,90,0.5)_70%)]
          border border-[rgba(180,70,80,0.4)]
          shadow-[0_1px_2px_rgba(0,0,0,0.4)]
        "
      />
    </div>
  );
}

/* grey-ish dreamy cloud haze behind everything */
function SoftClouds() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <div
        className="
          absolute -top-20 -left-24
          w-72 h-72 rounded-full
          blur-[40px]
          bg-[rgba(110,110,110,0.18)]
        "
      />
      <div
        className="
          absolute -top-10 left-16
          w-56 h-56 rounded-full
          blur-[50px]
          bg-[rgba(90,90,90,0.12)]
        "
      />
      <div
        className="
          absolute top-10 -left-10
          w-64 h-64 rounded-full
          blur-[60px]
          bg-[rgba(70,70,70,0.08)]
        "
      />
      <div
        className="
          absolute -bottom-24 -right-16
          w-80 h-80 rounded-full
          blur-[55px]
          bg-[rgba(80,80,80,0.15)]
        "
      />
      <div
        className="
          absolute bottom-10 right-24
          w-64 h-64 rounded-full
          blur-[60px]
          bg-[rgba(60,60,60,0.10)]
        "
      />
      <div
        className="
          absolute bottom-28 right-10
          w-48 h-48 rounded-full
          blur-[70px]
          bg-[rgba(40,40,40,0.07)]
        "
      />
      <div
        className="
          absolute top-[45%] left-[50%]
          -translate-x-1/2 -translate-y-1/2
          w-[30rem] h-[30rem]
          rounded-full
          blur-[80px]
          bg-[rgba(50,50,50,0.07)]
        "
      />
    </div>
  );
}

export default function App() {
  // letters from Firestore
  const [letters, setLetters] = useState([]);

  // search/filter UI
  const [search, setSearch] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // new letter form (input fields)
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newBody, setNewBody] = useState("");

  // modal / open letter
  const [openLetter, setOpenLetter] = useState(null);

  // edit mode fields
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBody, setEditBody] = useState("");

  // typewriter animation
  const [typedText, setTypedText] = useState("");
  const typingIntervalRef = useRef(null);

  // trash panel toggle UI
  const [showTrashPanel, setShowTrashPanel] = useState(false);

  // comments
  const [comments, setComments] = useState([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  /* STEP 1: listen to letters from Firestore */
  useEffect(() => {
    const unsubscribe = listenToLetters((incoming) => {
      // incoming is ALL letters (including deleted ones).
      setLetters(incoming);
    });
    return unsubscribe;
  }, []);

  /* STEP 2: when modal opens, subscribe to that letter's comments */
  useEffect(() => {
    if (!openLetter) {
      setComments([]);
      return;
    }
    const unsub = listenToComments(openLetter.id, (incomingComments) => {
      setComments(incomingComments);
    });
    return unsub;
  }, [openLetter]);

  /* filter logic for visible board cards (not deleted) */
  const filteredLetters = letters.filter((l) => {
    if (l.deleted) return false;

    const q = search.toLowerCase();
    const matchesSearch =
      (l.title || "").toLowerCase().includes(q) ||
      (l.date || "").toLowerCase().includes(q) ||
      (l.body || "").toLowerCase().includes(q);

    const matchesFav = showOnlyFavorites ? l.favorite : true;
    return matchesSearch && matchesFav;
  });

  /* list of trashed letters for restore panel */
  const trashedLetters = letters.filter((l) => l.deleted);

  /* actions */
  async function handleToggleFavorite(letter) {
    await updateLetter(letter.id, { favorite: !letter.favorite });
    if (openLetter && openLetter.id === letter.id) {
      setOpenLetter({ ...letter, favorite: !letter.favorite });
    }
  }

  async function handleDelete(letter) {
    // soft-delete (mark deleted: true)
    await trashLetter(letter.id);
    if (openLetter?.id === letter.id) {
      closeModal();
    }
  }

  async function handleRestore(id) {
    await restoreLetterFromTrash(id);
  }

  async function handleAddLetter() {
    if (!newTitle.trim() || !newBody.trim()) return;

    await createLetter({
      title: newTitle.trim(),
      date: newDate.trim() || new Date().toISOString().slice(0, 10),
      body: newBody.trim(),
      favorite: false,
    });

    setNewTitle("");
    setNewDate("");
    setNewBody("");
  }

  function openModal(letter) {
    setOpenLetter(letter);
    setIsEditing(false);
    setTypedText("");
    setEditTitle(letter.title || "");
    setEditDate(letter.date || "");
    setEditBody(letter.body || "");
  }

  function closeModal() {
    setOpenLetter(null);
    setTypedText("");
    setIsEditing(false);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
  }

  async function saveEdits() {
    if (!openLetter) return;
    const updates = {
      title: editTitle.trim() || "(untitled)",
      date: editDate.trim(),
      body: editBody.trim(),
    };
    await updateLetter(openLetter.id, updates);
    setOpenLetter({ ...openLetter, ...updates });
    setIsEditing(false);
    setTypedText("");
  }

  /* typewriter animation when viewing (not editing) */
  useEffect(() => {
    if (!openLetter || isEditing) return;
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    const fullText = openLetter.body || "";
    let index = 0;
    typingIntervalRef.current = setInterval(() => {
      index += 1;
      setTypedText(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(typingIntervalRef.current);
      }
    }, 15);
    return () => {
      clearInterval(typingIntervalRef.current);
    };
  }, [openLetter, isEditing]);

  /* add a comment */
  async function handleAddComment() {
    if (!openLetter) return;
    if (!newCommentText.trim()) return;
    await createComment({
      letterId: openLetter.id,
      author: newCommentAuthor.trim() || "someone who loves you",
      text: newCommentText.trim(),
    });
    setNewCommentText("");
  }

  /* letter card */
  function LetterCard({ letter }) {
    return (
      <div
        onClick={() => openModal(letter)}
        className="
          relative cursor-pointer
          bg-[#fdf6ec]/90
          border border-[rgba(182,159,131,0.4)]
          rounded-xl
          shadow-[0_20px_30px_rgba(0,0,0,0.15)]
          p-4
          transition-shadow hover:shadow-xl
          max-w-[260px]
          bg-[length:200px_200px]
          bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.03)_0%,rgba(0,0,0,0)_70%)]
        "
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)",
        }}
      >
        {/* tiny pin */}
        <div
          className="
            absolute -top-2 left-4
            w-3 h-3
            rounded-full
            bg-gradient-to-b from-yellow-200 to-yellow-600
            border border-yellow-800/40
            shadow-[0_2px_4px_rgba(0,0,0,0.4)]
          "
        />

        {/* tiny rose */}
        <TinyRose />

        {/* favorite heart in corner */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite(letter);
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

        {/* title/date/preview */}
        <div className="pr-8">
          <div className="text-[1.05rem] font-semibold leading-snug text-[#3b2f2f] break-words">
            {letter.title}
          </div>
          <div className="text-[0.7rem] text-[#3b2f2f]/60 mb-2">
            {letter.date}
          </div>
          <div className="text-sm leading-relaxed text-[#3b2f2f]/90 whitespace-pre-line">
            {getPreview(letter.body || "")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        relative min-h-screen
        bg-[#fdf6ec] text-[#3b2f2f] font-serif
        flex flex-col
      "
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0) 60%),
          radial-gradient(circle at 80% 30%, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0) 60%),
          radial-gradient(circle at 50% 80%, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)
        `,
        backgroundBlendMode: "screen",
      }}
    >
      {/* background soft clouds */}
      <SoftClouds />

      {/* all visible content sits above clouds */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* HEADER */}
        <header
          className="
            w-full max-w-5xl mx-auto
            px-4 py-6
            flex flex-col gap-6
            text-center
          "
        >
          {/* heading */}
          <div className="flex flex-col items-center">
            <div className="text-2xl font-semibold text-[#3b2f2f] leading-none font-handwritten">
              written with ink and heart ♡
            </div>
            <div className="text-[0.8rem] text-[#3b2f2f]/70 mt-2 italic">
              a sanctuary for all we are
            </div>
          </div>

          {/* controls */}
          <div
            className="
              flex flex-wrap justify-center gap-6
              text-[#3b2f2f] text-sm
            "
          >
            {/* search */}
            <div className="flex flex-col items-start text-left">
              <label className="text-[0.7rem] text-[#3b2f2f]/70 mb-1">
                search by title / date / words
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. friday, 2025-10, smile"
                className="
                  bg-[#fdf6ec]/80
                  border border-[rgba(182,159,131,0.4)]
                  rounded
                  px-2 py-1
                  text-sm
                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                  focus:outline-none
                  focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
                  placeholder:text-[rgba(182,159,131,0.6)]
                "
              />
            </div>

            {/* favorites filter */}
            <div className="flex flex-col items-start text-left">
              <label className="text-[0.7rem] text-[#3b2f2f]/70 mb-1">
                show only pinned favorites
              </label>
              <button
                onClick={() => setShowOnlyFavorites((v) => !v)}
                className={`
                  px-3 py-1 rounded text-sm border border-[rgba(182,159,131,0.4)]
                  ${
                    showOnlyFavorites
                      ? "bg-red-100 text-red-600"
                      : "bg-[#fdf6ec]/80 text-[#3b2f2f]"
                  }
                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                `}
              >
                {showOnlyFavorites ? "♥ only" : "all"}
              </button>
            </div>

            {/* restore panel toggle */}
            <div className="flex flex-col items-start text-left">
              <label className="text-[0.7rem] text-[#3b2f2f]/70 mb-1">
                recently deleted
              </label>
              <button
                onClick={() => setShowTrashPanel((v) => !v)}
                className="
                  px-3 py-1 rounded text-sm border border-[rgba(182,159,131,0.4)]
                  bg-[#fdf6ec]/80 text-[#3b2f2f]
                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                  hover:bg-[#fffaf4]
                "
              >
                {showTrashPanel ? "hide" : "restore…"}
              </button>
            </div>

            {/* typing sound placeholder */}
            <div className="flex flex-col items-start text-left opacity-50 cursor-not-allowed">
              <label className="text-[0.7rem] text-[#3b2f2f]/70 mb-1">
                typing sound
              </label>
              <button
                className="
                  px-3 py-1 rounded text-sm border border-[rgba(182,159,131,0.4)]
                  bg-[#fdf6ec]/40 text-[#3b2f2f]/40
                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                "
                disabled
              >
                off
              </button>
            </div>
          </div>

          {/* TRASH PANEL */}
          {showTrashPanel && (
            <div
              className="
                w-full max-w-md mx-auto
                bg-[#fffaf4]/90
                border border-[rgba(182,159,131,0.4)]
                rounded-xl
                shadow-[0_20px_30px_rgba(0,0,0,0.15)]
                p-4 text-left text-sm
              "
            >
              {trashedLetters.length === 0 ? (
                <div className="text-[#3b2f2f]/60 italic text-center text-xs">
                  nothing in the bin.
                </div>
              ) : (
                <ul className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {trashedLetters.map((t) => (
                    <li
                      key={t.id}
                      className="
                        flex items-start justify-between gap-2
                        border-b border-[rgba(182,159,131,0.2)] pb-2
                      "
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#3b2f2f] text-sm leading-tight break-words">
                          {t.title}
                        </div>
                        <div className="text-[0.7rem] text-[#3b2f2f]/60">
                          {t.date}
                        </div>
                        <div className="text-[0.7rem] text-[#3b2f2f]/80 line-clamp-2">
                          {t.body}
                        </div>
                      </div>

                      <button
                        className="
                          flex-shrink-0 self-center
                          px-2 py-1 text-[0.7rem]
                          rounded
                          bg-[#3b2f2f] text-[#fdf6ec]
                          shadow hover:shadow-lg transition-shadow
                        "
                        onClick={() => handleRestore(t.id)}
                      >
                        restore
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </header>

        {/* MAIN: cards + composer */}
        <main
          className="
            w-full max-w-6xl
            flex flex-col lg:flex-row
            gap-10
            mx-auto
            px-4 pb-24
          "
        >
          {/* grid of letters */}
          <section className="flex-1 min-w-0">
            <div
              className="
                grid gap-8
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              {filteredLetters.length === 0 && (
                <div className="text-sm text-[#3b2f2f]/60 italic">
                  nothing matches that search yet.
                </div>
              )}
              {filteredLetters.map((letter) => (
                <LetterCard key={letter.id} letter={letter} />
              ))}
            </div>
          </section>

          {/* write new letter */}
          <aside
            className="
              w-full lg:w-[320px]
              flex-shrink-0
              bg-[#fdf6ec]/90
              border border-[rgba(182,159,131,0.4)]
              rounded-xl
              shadow-[0_20px_30px_rgba(0,0,0,0.15)]
              p-4
              h-fit
            "
          >
            <div
              className="
                text-lg font-semibold text-[#3b2f2f] mb-2 leading-none font-handwritten
              "
            >
              write a new letter
            </div>
            <div className="text-[0.75rem] text-[#3b2f2f]/70 mb-4 leading-snug italic">
              where our memories find their forever
            </div>

            <label className="block text-xs text-[#3b2f2f]/70 mb-1">
              title
            </label>
            <input
              className="
                w-full mb-3
                bg-white/70
                border border-[rgba(182,159,131,0.4)]
                rounded
                px-2 py-1
                text-sm
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
              "
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="do you remember?"
            />

            <label className="block text-xs text-[#3b2f2f]/70 mb-1">
              date (optional)
            </label>
            <input
              className="
                w-full mb-3
                bg-white/70
                border border-[rgba(182,159,131,0.4)]
                rounded
                px-2 py-1
                text-sm
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
              "
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              placeholder="YYYY-MM-DD"
            />

            <label className="block text-xs text-[#3b2f2f]/70 mb-1">
              body
            </label>
            <textarea
              className="
                w-full h-32 resize-none mb-4
                bg-white/70
                border border-[rgba(182,159,131,0.4)]
                rounded
                px-2 py-1
                text-sm leading-relaxed
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
              "
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="write like always..."
            />

            <button
              onClick={handleAddLetter}
              className="
                w-full text-center text-sm font-medium
                bg-[#3b2f2f] text-[#fdf6ec]
                rounded py-2
                shadow hover:shadow-xl
                transition-shadow
              "
            >
              add to board
            </button>
          </aside>
        </main>
      </div>

      {/* MODAL FOR OPEN LETTER */}
      {openLetter && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-[rgba(0,0,0,0.45)]
            px-4 py-8
          "
          onClick={closeModal}
        >
          <div
            className="
              relative w-full max-w-2xl
              bg-[#fdf6ec]/95
              border border-[rgba(182,159,131,0.4)]
              rounded-xl
              shadow-[0_24px_40px_rgba(0,0,0,0.4)]
              text-[#3b2f2f]
              flex flex-col
              max-h-[80vh]
            "
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 10%, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER (title + top-right actions) */}
            <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-[rgba(182,159,131,0.3)]">
              {/* left: viewing or editing fields */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <>
                    <input
                      className="
                        w-full mb-2
                        bg-white/70
                        border border-[rgba(182,159,131,0.4)]
                        rounded
                        px-2 py-1
                        text-sm font-semibold
                        shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                        focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
                      "
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      className="
                        w-full
                        bg-white/70
                        border border-[rgba(182,159,131,0.4)]
                        rounded
                        px-2 py-1
                        text-[0.7rem] text-[#3b2f2f]/60
                        shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                        focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
                      "
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
                    <div className="text-[0.7rem] text-[#3b2f2f]/60">
                      {openLetter.date}
                    </div>
                  </>
                )}
              </div>

              {/* top-right action group: styled like small pills */}
              <div className="flex flex-col gap-2 items-end text-xs leading-none">
                {/* favorite */}
                <button
                  onClick={() => handleToggleFavorite(openLetter)}
                  className="
                    px-2 py-1 rounded
                    bg-[#fffaf4] text-[#3b2f2f]
                    border border-[rgba(182,159,131,0.4)]
                    shadow hover:shadow-md
                    text-sm
                  "
                  title="favorite"
                >
                  <span
                    className={
                      openLetter.favorite
                        ? "text-red-500 drop-shadow-[0_0_4px_rgba(255,0,0,0.4)]"
                        : "text-stone-400 hover:text-red-400"
                    }
                  >
                    ♥
                  </span>
                </button>

                {!isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setTypedText("");
                      }}
                      className="
                        px-2 py-1 rounded
                        bg-[#fffaf4] text-[#3b2f2f]
                        border border-[rgba(182,159,131,0.4)]
                        shadow hover:shadow-md
                      "
                    >
                      edit
                    </button>
                    <button
                      onClick={() => handleDelete(openLetter)}
                      className="
                        px-2 py-1 rounded
                        bg-[#fff5f5] text-[#3b2f2f]
                        border border-[rgba(182,159,131,0.4)]
                        shadow hover:shadow-md
                        hover:text-red-600
                      "
                    >
                      delete
                    </button>
                    <button
                      onClick={closeModal}
                      className="
                        px-2 py-1 rounded
                        bg-[#3b2f2f] text-[#fdf6ec]
                        shadow hover:shadow-md
                      "
                    >
                      close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={saveEdits}
                      className="
                        px-2 py-1 rounded
                        bg-[#3b2f2f] text-[#fdf6ec]
                        shadow hover:shadow-md
                      "
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
                      className="
                        px-2 py-1 rounded
                        bg-[#fffaf4] text-[#3b2f2f]
                        border border-[rgba(182,159,131,0.4)]
                        shadow hover:shadow-md
                      "
                    >
                      cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* BODY (scrollable middle) */}
            <div
              className="
                flex-1 overflow-y-auto
                px-5 py-4
                text-sm leading-relaxed font-[400]
                text-[#3b2f2f]
                whitespace-pre-line
              "
            >
              {isEditing ? (
                <textarea
                  className="
                    w-full h-full min-h-[10rem] resize-none
                    bg-white/70
                    border border-[rgba(182,159,131,0.4)]
                    rounded
                    px-2 py-1
                    text-sm leading-relaxed
                    shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                    focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
                  "
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
              ) : (
                <>
                  {typedText}
                  <span
                    className="
                      inline-block w-2 h-4 align-baseline
                      bg-[#3b2f2f] ml-1
                      animate-pulse
                    "
                  />
                </>
              )}

              {/* COMMENTS SECTION (only show when not editing) */}
              {!isEditing && (
                <div className="mt-6 border-t border-[rgba(182,159,131,0.3)] pt-4">
                  <div className="text-xs text-[#3b2f2f]/60 mb-2">
                    notes back to this letter:
                  </div>

                  <div className="space-y-3 max-h-32 overflow-y-auto pr-1 text-[0.8rem] leading-relaxed">
                    {comments.length === 0 && (
                      <div className="text-[#3b2f2f]/40 italic text-[0.75rem]">
                        no replies yet.
                      </div>
                    )}
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="
                          bg-white/60
                          rounded
                          border border-[rgba(182,159,131,0.3)]
                          p-2
                          shadow-[0_2px_4px_rgba(0,0,0,0.05)]
                        "
                      >
                        <div className="text-[0.7rem] text-[#3b2f2f]/60 mb-1 italic">
                          {c.author || "someone"}
                        </div>
                        <div className="text-[#3b2f2f] whitespace-pre-line">
                          {c.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* add new comment row */}
                  <div className="mt-4 flex flex-col gap-2 text-[0.8rem]">
                    <input
                      className="
                        bg-white/70
                        border border-[rgba(182,159,131,0.4)]
                        rounded px-2 py-1 text-xs
                        shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                        focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
                      "
                      placeholder="your name (optional)"
                      value={newCommentAuthor}
                      onChange={(e) => setNewCommentAuthor(e.target.value)}
                    />
                    <textarea
                      className="
                        bg-white/70
                        border border-[rgba(182,159,131,0.4)]
                        rounded px-2 py-1 text-xs
                        resize-none h-16
                        shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                        focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
                      "
                      placeholder="write back to this letter..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    <button
                      onClick={handleAddComment}
                      className="
                        self-end
                        px-3 py-1 rounded
                        bg-[#3b2f2f] text-[#fdf6ec]
                        text-[0.7rem]
                        shadow hover:shadow-md
                        transition-shadow
                      "
                    >
                      send
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER strip */}
            {!isEditing && (
              <div
                className="
                  border-t border-[rgba(182,159,131,0.3)]
                  px-5 py-3
                  text-[0.7rem] text-[#3b2f2f]/60
                  flex justify-between items-center
                "
              >
                <div className="italic">just for you, my muse.</div>
                <button
                  onClick={closeModal}
                  className="
                    px-3 py-1 rounded
                    bg-[#3b2f2f] text-[#fdf6ec]
                    text-xs
                    shadow hover:shadow-xl
                    transition-shadow
                  "
                >
                  close
                </button>
              </div>
            )}

            {isEditing && (
              <div
                className="
                  border-t border-[rgba(182,159,131,0.3)]
                  px-5 py-3
                  text-[0.7rem] text-[#3b2f2f]/60
                  flex justify-end gap-2
                "
              >
                <button
                  onClick={saveEdits}
                  className="
                    px-3 py-1 rounded
                    bg-[#3b2f2f] text-[#fdf6ec]
                    text-xs
                    shadow hover:shadow-xl
                    transition-shadow
                  "
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
                  className="
                    px-3 py-1 rounded
                    bg-[#fffaf4] text-[#3b2f2f]
                    text-xs
                    border border-[rgba(182,159,131,0.5)]
                    shadow hover:shadow-xl
                    transition-shadow
                  "
                >
                  cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
