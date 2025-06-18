import { useState } from "react";
import { logout } from "../auth";
import logo from "../assets/Deckachu icon.jpg";

export default function Header({ user, onShowLogin }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="flex items-center justify-between bg-gray-900 text-white px-3 pb-2">
      {/* Site Title */}
      <a href="/" className="flex items-center gap-2">
        <img src={logo} alt="Deckachu Logo" className="h-12 w-12 rounded" />
        <h1 className="text-2xl font-bold tracking-wide">Deckachu</h1>
      </a>

      {/* ALWAYS VISIBLE MENU BUTTON */}
      <div className="relative">
        <button
          onClick={() => setShowMobileMenu((prev) => !prev)}
          className="text-white text-2xl px-3 py-2"
        >
          ☰
        </button>

        {showMobileMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
            <a
              href="https://discord.com/oauth2/authorize?client_id=1383073892431691888&permissions=274877974528&integration_type=0&scope=applications.commands+bot"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-4 py-2 hover:bg-gray-800"
              onClick={() => setShowMobileMenu(false)}
            >
              Discord Bot
            </a>

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  onShowLogin();
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-800"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
