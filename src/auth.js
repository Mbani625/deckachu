import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseApp } from "./firebaseConfig";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// SIGN UP: stores data in both users and usernames collections
export async function register(email, password, username) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  const uid = user.uid;

  // Store profile info under users/{uid}
  await setDoc(doc(db, "users", uid), {
    email,
    username,
    createdAt: new Date(),
  });

  // Store username → email mapping under usernames/{username}
  await setDoc(doc(db, "usernames", username), {
    email,
  });

  // ✅ Send verification email
  await sendEmailVerification(user);

  // ✅ Log the user out right after sending email
  await signOut(auth);

  return user;
}

// LOGIN: username is resolved to email elsewhere in LoginModal
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export function logout() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
