import React, { useState } from "react";
import { login, register } from "../auth";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { resetPassword } from "../auth";

const LoginModal = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Only used in sign-up
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const userDoc = await getDoc(doc(db, "usernames", username));
      if (!userDoc.exists()) {
        setMessage("Username not found.");
        return;
      }

      const userEmail = userDoc.data().email;

      const user = await login(userEmail, password);

      if (!user.emailVerified) {
        setMessage("Please verify your email before logging in.");
        return;
      }

      setMessage("Login successful!");
      onClose();
    } catch (err) {
      setMessage("Login failed: " + err.message);
    }
  };

  const handleSignup = async () => {
    try {
      const userDoc = await getDoc(doc(db, "usernames", username));
      if (userDoc.exists()) {
        setMessage("Username already taken.");
        return;
      }

      // ✅ FIXED: include username here
      await register(email, password, username);

      // Save username mapping separately (optional if done in register)
      await setDoc(doc(db, "usernames", username), { email });

      setMessage(
        "Verification email sent! Please check your inbox before logging in."
      );
      setTimeout(onClose, 1500);
    } catch (err) {
      setMessage("Signup failed: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">
          {isSignUp ? "Sign Up" : "Login"}
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600"
        />

        {isSignUp && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600"
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600"
        />

        {message && (
          <p className="text-sm text-red-400 mb-2 whitespace-pre-line">
            {message}
          </p>
        )}

        <div className="flex justify-between gap-2">
          {!isSignUp ? (
            <button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded w-full"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleSignup}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded w-full"
            >
              Sign Up
            </button>
          )}
          <button
            onClick={() => {
              if (!username) {
                setMessage("Please enter your username to reset password.");
                return;
              }
              getDoc(doc(db, "usernames", username))
                .then((docSnap) => {
                  if (!docSnap.exists()) {
                    setMessage("Username not found.");
                    return;
                  }
                  const userEmail = docSnap.data().email;
                  return resetPassword(userEmail).then(() =>
                    setMessage("Password reset email sent.")
                  );
                })
                .catch((err) => setMessage("Error: " + err.message));
            }}
            className="text-sm text-blue-300 hover:underline mt-2"
          >
            Forgot Password?
          </button>
        </div>

        <button
          onClick={() => {
            setIsSignUp((prev) => !prev);
            setMessage("");
          }}
          className="mt-3 text-sm text-gray-300 hover:underline w-full text-center"
        >
          {isSignUp
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
