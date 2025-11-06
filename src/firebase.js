// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";

// ---- your config (unchanged) ----
const firebaseConfig = {
  apiKey: "AIzaSyDrjoPKmmHSfmbUCQaBo0y0KWvK5aZWyVo",
  authDomain: "letters-cffb8.firebaseapp.com",
  projectId: "letters-cffb8",
  storageBucket: "letters-cffb8.firebasestorage.app",
  messagingSenderId: "29545574327",
  appId: "1:29545574327:web:ba61307069f10fbf794232",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ---------- LETTERS ----------
export function listenToLetters(callback, onError) {
  const qLetters = query(
    collection(db, "letters"),
    orderBy("createdAt", "desc") // safe without composite indexes
  );
  return onSnapshot(
    qLetters,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(rows);
    },
    (err) => onError?.(err)
  );
}

export async function addLetter({ title, date, body }) {
  const col = collection(db, "letters");
  await addDoc(col, {
    title: title.trim(),
    date: (date || "").trim() || new Date().toISOString().slice(0, 10),
    body: body.trim(),
    favorite: false,
    createdAt: serverTimestamp(),
  });
}

export async function updateLetter(id, updates) {
  const ref = doc(db, "letters", id);
  await updateDoc(ref, updates);
}

export async function toggleFavorite(id, current) {
  const ref = doc(db, "letters", id);
  await updateDoc(ref, { favorite: !current });
}

export async function deleteLetter(id) {
  const ref = doc(db, "letters", id);
  await deleteDoc(ref);
}

// ---------- COMMENTS ----------
export async function createComment({ letterId, author, text }) {
  const col = collection(db, "comments");
  await addDoc(col, {
    letterId,
    author: author?.trim() || "someone",
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
}

export function listenToComments(letterId, callback, onError) {
  const q = query(collection(db, "comments"), where("letterId", "==", letterId));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return ta - tb;
      });
      callback(rows);
    },
    (err) => onError?.(err)
  );
}
