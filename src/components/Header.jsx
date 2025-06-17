/// Header.jsx
import { logout } from "../auth";

export default function Header({ user, onShowLogin }) {
  return (
    <div className="flex flex-col items-center justify-between bg-gray-900 text-white p-4 sm:flex-row sm:items-center sm:gap-4">
      <h1 className="text-2xl font-bold tracking-wide">Deckachu</h1>

      <a
        href="https://discord.com/oauth2/authorize?client_id=1383073892431691888&permissions=274877974528&integration_type=0&scope=applications.commands+bot"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded text-sm mt-2 sm:mt-0"
      >
        ➕ Add Bot to Discord
      </a>

      <div className="mt-2 sm:mt-0">
        {user ? (
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={onShowLogin}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded"
          >
            Login / Sign Up
          </button>
        )}
      </div>
    </div>
  );
}
