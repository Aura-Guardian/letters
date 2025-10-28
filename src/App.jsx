import React, { useState, useEffect, useRef } from "react";

/* helper: preview text inside each card */
function getPreview(text, lines = 3) {
  const split = text.trim().split("\n");
  const sliced = split.slice(0, lines).join(" ");
  const short = sliced.length > 260 ? sliced.slice(0, 260) + "..." : sliced;
  return short || text.slice(0, 260);
}

/* starter letters */
const INITIAL_LETTERS = [
  {
    id: 1,
    title: "quiet 2am, thinking of you",
    date: "2025-10-26",
    body:
      "i know you don’t always believe me when i tell you you’re beautiful.\n" +
      "but tonight i watched the way you exist in this world and i swear it felt holy.\n" +
      "there’s softness in you that shouldn’t have to defend itself.\n" +
      "i just want you to rest in a place that doesn’t ask you to prove you’re worth loving.\n" +
      "this is me trying to build that place.",
    favorite: true,
  },
  {
    id: 2,
    title: "the way you laugh when you're tired",
    date: "2025-10-15",
    body:
      "you sounded exhausted today but you still stayed with me on call.\n" +
      "there’s this tiny laugh you do when you’re running on fumes.\n" +
      "please know i notice that.\n" +
      "i notice you even when you feel invisible to everyone else.\n" +
      "that’s my promise.",
    favorite: false,
  },
  {
    id: 3,
    title: "our friday ritual",
    date: "2025-10-11",
    body:
      "you said fridays feel cursed for you.\n" +
      "so from now on, every friday belongs to you.\n" +
      "a soft message. a promise. a calm corner.\n" +
      "if the world is loud on friday, this will be the quiet in it.",
    favorite: false,
  },
];

/* --- tiny rose cluster (4 petals + glow) --- */
function TinyRose() {
  return (
    <div
      className="
        absolute bottom-2 right-2
        w-12 h-12
        pointer-events-none select-none
      "
    >
      {/* glow behind flower */}
      <div
        className="
          absolute bottom-[6px] right-[6px]
          w-8 h-8
          rounded-full
          bg-[rgba(255,200,210,0.35)]
          blur-[8px]
        "
      />

      {/* back petal (upper-left) */}
      <div
        className="
          absolute
          left-[6px] bottom-[14px]
          w-5 h-6
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,215,225,1)_0%,rgba(180,70,90,0.28)_70%)]
          rotate-[-25deg]
          shadow-[0_2px_4px_rgba(0,0,0,0.25)]
        "
        style={{ zIndex: 2 }}
      />

      {/* back petal (upper-right) */}
      <div
        className="
          absolute
          right-[10px] bottom-[14px]
          w-5 h-6
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,210,220,1)_0%,rgba(160,60,80,0.25)_70%)]
          rotate-[25deg]
          shadow-[0_2px_4px_rgba(0,0,0,0.25)]
        "
        style={{ zIndex: 2 }}
      />

      {/* lower-left petal */}
      <div
        className="
          absolute
          left-[4px] bottom-[6px]
          w-5 h-5
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,200,210,1)_0%,rgba(200,80,100,0.35)_70%)]
          rotate-[-10deg]
          shadow-[0_2px_4px_rgba(0,0,0,0.3)]
        "
        style={{ zIndex: 3 }}
      />

      {/* lower-right petal */}
      <div
        className="
          absolute
          right-[8px] bottom-[6px]
          w-5 h-5
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,205,215,1)_0%,rgba(180,60,80,0.3)_70%)]
          rotate-[10deg]
          shadow-[0_2px_4px_rgba(0,0,0,0.3)]
        "
        style={{ zIndex: 3 }}
      />

      {/* rose core */}
      <div
        className="
          absolute
          left-[18px] bottom-[14px]
          w-4 h-4
          rounded-full
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,230,230,1)_0%,rgba(190,80,90,0.45)_70%)]
          border border-[rgba(180,70,80,0.4)]
          shadow-[0_1px_2px_rgba(0,0,0,0.4)]
        "
        style={{ zIndex: 4 }}
      />
    </div>
  );
}

/* --- background dreamy "cloud" clusters (mauve toned) --- */
function SoftClouds() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {/* top-left cluster */}
      <div
        className="
          absolute -top-32 -left-32
          w-[24rem] h-[24rem]
          rounded-full
          bg-[rgba(180,160,170,0.22)]
          blur-[60px]
        "
      />
      <div
        className="
          absolute -top-10 left-20
          w-[18rem] h-[18rem]
          rounded-full
          bg-[rgba(140,110,130,0.18)]
          blur-[70px]
        "
      />
      <div
        className="
          absolute top-16 -left-10
          w-[20rem] h-[20rem]
          rounded-full
          bg-[rgba(120,90,110,0.12)]
          blur-[80px]
        "
      />

      {/* bottom-right cluster */}
      <div
        className="
          absolute -bottom-40 -right-24
          w-[26rem] h-[26rem]
          rounded-full
          bg-[rgba(150,120,130,0.2)]
          blur-[70px]
        "
      />
      <div
        className="
          absolute bottom-6 right-32
          w-[20rem] h-[20rem]
          rounded-full
          bg-[rgba(110,80,95,0.16)]
          blur-[80px]
        "
      />
      <div
        className="
          absolute bottom-24 right-6
          w-[16rem] h-[16rem]
          rounded-full
          bg-[rgba(90,60,75,0.12)]
          blur-[90px]
        "
      />

      {/* faint central haze */}
      <div
        className="
          absolute
          top-[45%] left-[50%]
          -translate-x-1/2 -translate-y-1/2
          w-[32rem] h-[32rem]
          rounded-full
          bg-[rgba(160,130,140,0.08)]
          blur-[100px]
        "
      />
    </div>
  );
}

export default function App() {
  // letters on board
  const [letters, setLetters] = useState(() => {
    const saved = localStorage.getItem("letters-for-her-letters");
    return saved ? JSON.parse(saved) : INITIAL_LETTERS;
  });

  // trash / recently deleted
  const [trash, setTrash] = useState(() => {
    const saved = localStorage.getItem("letters-for-her-trash");
    return saved ? JSON.parse(saved) : [];
  });

  // search/filter
  const [search, setSearch] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // new letter form
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newBody, setNewBody] = useState("");

  // modal state
  const [openLetter, setOpenLetter] = useState(null);

  // edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBody, setEditBody] = useState("");

  // typewriter animation
  const [typedText, setTypedText] = useState("");
  const typingIntervalRef = useRef(null);

  // show/hide recently deleted
  const [showTrashPanel, setShowTrashPanel] = useState(false);

  // persist letters & trash
  useEffect(() => {
    localStorage.setItem("letters-for-her-letters", JSON.stringify(letters));
  }, [letters]);

  useEffect(() => {
    localStorage.setItem("letters-for-her-trash", JSON.stringify(trash));
  }, [trash]);

  /* filter output for the grid */
  const filteredLetters = letters.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      l.title.toLowerCase().includes(q) ||
      (l.date || "").toLowerCase().includes(q) ||
      l.body.toLowerCase().includes(q);

    const matchesFav = showOnlyFavorites ? l.favorite : true;
    return matchesSearch && matchesFav;
  });

  /* actions */
  function toggleFavorite(id) {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, favorite: !l.favorite } : l))
    );

    if (openLetter && openLetter.id === id) {
      setOpenLetter((cur) => (cur ? { ...cur, favorite: !cur.favorite } : cur));
    }
  }

  function deleteLetter(id) {
    const target = letters.find((l) => l.id === id);
    if (!target) return;

    // move to trash
    setTrash((prev) => [target, ...prev]);

    // remove from main board
    setLetters((prev) => prev.filter((l) => l.id !== id));

    // close modal if it's open for the deleted letter
    if (openLetter?.id === id) {
      closeModal();
    }
  }

  function restoreLetter(id) {
    const target = trash.find((t) => t.id === id);
    if (!target) return;

    setLetters((prev) => [target, ...prev]);
    setTrash((prev) => prev.filter((t) => t.id !== id));
  }

  function addLetter() {
    if (!newTitle.trim() || !newBody.trim()) return;

    const entry = {
      id: Date.now(),
      title: newTitle.trim(),
      date: newDate.trim() || new Date().toISOString().slice(0, 10),
      body: newBody.trim(),
      favorite: false,
    };

    setLetters((prev) => [entry, ...prev]);
    setNewTitle("");
    setNewDate("");
    setNewBody("");
  }

  function openModal(letter) {
    setOpenLetter(letter);
    setTypedText("");
    setIsEditing(false);

    setEditTitle(letter.title);
    setEditDate(letter.date || "");
    setEditBody(letter.body);
  }

  function closeModal() {
    setOpenLetter(null);
    setTypedText("");
    setIsEditing(false);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
  }

  function saveEdits() {
    if (!openLetter) return;
    const id = openLetter.id;

    const updated = {
      ...openLetter,
      title: editTitle.trim() || "(untitled)",
      date: editDate.trim(),
      body: editBody.trim(),
    };

    // update in list
    setLetters((prev) => prev.map((l) => (l.id === id ? updated : l)));

    // reflect in modal
    setOpenLetter(updated);
    setIsEditing(false);
    setTypedText(""); // so it can replay on next open
  }

  /* typewriter for modal body (only when not editing) */
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

  /* single note card on the board */
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
          transition-shadow
          hover:shadow-xl
          max-w-[260px]
        "
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(255,255,255,.6) 0%, rgba(0,0,0,0) 70%)",
        }}
      >
        {/* little brass pin */}
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

        {/* favorite heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(letter.id);
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

        {/* content */}
        <div className="pr-8">
          <div className="text-[1.05rem] font-semibold leading-snug text-[#3b2f2f]">
            {letter.title}
          </div>
          <div className="text-[0.7rem] text-[#3b2f2f]/60 mb-2">
            {letter.date}
          </div>

          <div className="text-sm leading-relaxed text-[#3b2f2f]/90 whitespace-pre-line">
            {getPreview(letter.body)}
          </div>
        </div>

        {/* little rose decoration */}
        <TinyRose />
      </div>
    );
  }

  /* page wrapper */
  return (
    <div
      className="
        relative min-h-screen
        text-[#3b2f2f] font-serif
        flex flex-col
        bg-[#fdf6ec]
      "
      style={{
        /* subtle paper feel under the mauve cloud overlay */
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0) 60%),
          radial-gradient(circle at 80% 30%, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0) 60%),
          radial-gradient(circle at 50% 80%, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%),

          /* gentle paper noise pattern */
          repeating-radial-gradient(
            circle at 20% 30%,
            rgba(0,0,0,0.03) 0px,
            rgba(0,0,0,0.03) 1px,
            rgba(0,0,0,0) 2px,
            rgba(0,0,0,0) 4px
          ),

          /* faint warm vignette */
          radial-gradient(
            circle at 50% 40%,
            rgba(255,250,245,0.6) 0%,
            rgba(240,220,200,0.15) 40%,
            rgba(120,90,60,0.05) 70%,
            rgba(0,0,0,0) 80%
          )
        `,
        backgroundBlendMode: "screen,normal,normal",
        backgroundColor: "#fdf6ec",
      }}
    >
      {/* CLOUDS HOVERING OVER TEXTURE BUT UNDER CONTENT */}
      <SoftClouds />

      {/* MAIN CONTENT ABOVE CLOUDS */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* HEADER */}
        <header
          className="
            w-full
            max-w-5xl
            mx-auto
            px-4 py-6
            flex flex-col gap-6
            text-center
          "
        >
          {/* romantic heading */}
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
                  px-3 py-1 rounded text-sm border border-[rgba(182,159,131,0.4)] shadow
                  ${
                    showOnlyFavorites
                      ? "bg-red-100 text-red-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]"
                      : "bg-[#fdf6ec]/80 text-[#3b2f2f] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]"
                  }
                `}
              >
                {showOnlyFavorites ? "♥ only" : "all"}
              </button>
            </div>

            {/* recently deleted / restore */}
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
              {trash.length === 0 ? (
                <div className="text-[#3b2f2f]/60 italic text-center text-xs">
                  nothing in the bin.
                </div>
              ) : (
                <ul className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {trash.map((t) => (
                    <li
                      key={t.id}
                      className="
                        flex items-start justify-between gap-2
                        border-b border-[rgba(182,159,131,0.2)] pb-2
                      "
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#3b2f2f] text-sm leading-tight">
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
                        onClick={() => restoreLetter(t.id)}
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

        {/* MAIN CONTENT (board + composer) */}
        <main
          className="
            w-full max-w-6xl
            flex flex-col lg:flex-row
            gap-10
            mx-auto
            px-4 pb-24
          "
        >
          {/* board grid */}
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

          {/* compose panel */}
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

            <div className="text-[0.75rem] text-[#3b2f2f]/70 mb-4 leading-snug">
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
              onClick={addLetter}
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
                "radial-gradient(circle at 10% 10%, rgba(255,255,255,.6) 0%, rgba(0,0,0,0) 70%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER SECTION */}
            <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-[rgba(182,159,131,0.3)]">
              {/* editable title/date */}
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
                        text-sm
                        shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                        focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
                        font-semibold
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
                        text-[0.7rem]
                        shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_4px_rgba(0,0,0,0.08)]
                        focus:outline-none focus:ring-1 focus:ring-[rgba(182,159,131,0.4)]
                        text-[#3b2f2f]/60
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

              {/* right side controls */}
              <div className="flex flex-col items-end gap-2 text-xs text-[#3b2f2f]/70 leading-none">
                {/* fav toggle */}
                <button
                  onClick={() => toggleFavorite(openLetter.id)}
                  className="text-lg leading-none"
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
                        setTypedText(""); // pause typewriter during edit
                      }}
                      className="hover:text-[#3b2f2f] underline underline-offset-2"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => {
                        deleteLetter(openLetter.id);
                      }}
                      className="hover:text-red-600 underline underline-offset-2"
                    >
                      delete
                    </button>
                    <button
                      onClick={closeModal}
                      className="hover:text-[#3b2f2f] underline underline-offset-2"
                    >
                      close
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={saveEdits}
                      className="
                        px-2 py-1 rounded
                        bg-[#3b2f2f] text-[#fdf6ec]
                        shadow hover:shadow-lg transition-shadow
                      "
                    >
                      save
                    </button>
                    <button
                      onClick={() => {
                        // cancel editing
                        setIsEditing(false);
                        setEditTitle(openLetter.title);
                        setEditDate(openLetter.date || "");
                        setEditBody(openLetter.body);
                        setTypedText("");
                      }}
                      className="
                        px-2 py-1 rounded
                        bg-[#fdf6ec]
                        text-[#3b2f2f]
                        border border-[rgba(182,159,131,0.5)]
                        shadow hover:shadow-lg transition-shadow
                      "
                    >
                      cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SCROLLING BODY */}
            <div
              className="
                flex-1
                overflow-y-auto
                px-5 py-4
                text-sm leading-relaxed
                font-[400]
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
            </div>

            {/* FOOTER (only showing buttons, not scrollable) */}
            {!isEditing && (
              <div
                className="
                  border-t border-[rgba(182,159,131,0.3)]
                  px-5 py-3
                  text-[0.7rem] text-[#3b2f2f]/60
                  flex justify-between items-center
                "
              >
                <div className="italic">
                  just for you, my muse.
                </div>
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
                  flex justify-end items-center gap-2
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
                    setEditTitle(openLetter.title);
                    setEditDate(openLetter.date || "");
                    setEditBody(openLetter.body);
                    setTypedText("");
                  }}
                  className="
                    px-3 py-1 rounded
                    bg-[#fdf6ec] text-[#3b2f2f]
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
