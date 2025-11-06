// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// ---------- YOUR PROJECT CONFIG ----------
const firebaseConfig = {
  apiKey: "AIzaSyDrjoPKmmHSfmbUCQaBo0y0KWvK5aZWyVo",
  authDomain: "letters-cffb8.firebaseapp.com",
  projectId: "letters-cffb8",
  storageBucket: "letters-cffb8.firebasestorage.app",
  messagingSenderId: "29545574327",
  appId: "1:29545574327:web:ba61307069f10fbf794232",
};
// ----------------------------------------

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* =========================
   LETTERS (CRUD + listener)
   ========================= */

export function listenToLetters(cb) {
  // newest first (by date string, fallback to createdAt)
  const lettersRef = collection(db, "letters");
  const q = query(lettersRef, orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    const out = [];
    snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
    cb(out);
  });
}

export async function addLetter({ title, body, date }) {
  const lettersRef = collection(db, "letters");
  const payload = {
    title: title || "(untitled)",
    body: body || "",
    date: date || new Date().toISOString().slice(0, 10),
    favorite: false,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(lettersRef, payload);
  return docRef.id;
}

export async function updateLetter(id, updates) {
  const ref = doc(db, "letters", id);
  await updateDoc(ref, updates);
}

export async function deleteLetter(id) {
  const ref = doc(db, "letters", id);
  await deleteDoc(ref);
}

export async function toggleFavorite(id, current) {
  const ref = doc(db, "letters", id);
  await updateDoc(ref, { favorite: !current });
}

/* =========================
   COMMENTS (CRUD + listener)
   Each comment has: text, author, letterId
   ========================= */

export function listenToComments(letterId, cb) {
  const commentsRef = collection(db, "comments");
  const q = query(
    commentsRef,
    where("letterId", "==", letterId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const out = [];
    snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
    cb(out);
  });
}

export async function createComment({ letterId, text, author }) {
  const commentsRef = collection(db, "comments");
  await addDoc(commentsRef, {
    letterId,
    text: text || "",
    author: (author || "").trim(),
    createdAt: serverTimestamp(),
  });
}

export async function updateComment(id, updates) {
  const ref = doc(db, "comments", id);
  await updateDoc(ref, updates);
}

export async function deleteComment(id) {
  const ref = doc(db, "comments", id);
  await deleteDoc(ref);
}
