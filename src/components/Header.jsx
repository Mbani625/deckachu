import { useState } from "react";
import { logout } from "../auth";

export default function Header({ user, onShowLogin }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="flex items-center justify-between bg-gray-900 text-white px-3 pb-2 sm:flex-row sm:items-center sm:gap-4">
      {/* Site Title */}
      <h1 className="text-2xl font-bold tracking-wide">Deckachu</h1>

      {/* DESKTOP BUTTONS */}
      <div className="hidden sm:flex gap-2 items-center">
        <a
          href="https://discord.com/oauth2/authorize?client_id=1383073892431691888&permissions=274877974528&integration_type=0&scope=applications.commands+bot"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded text-sm"
        >
          Discord Bot
        </a>

        {user ? (
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={onShowLogin}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
          >
            Login / Sign Up
          </button>
        )}
      </div>

      {/* MOBILE MENU */}
      <div className="relative sm:hidden">
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
