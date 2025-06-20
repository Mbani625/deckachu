// src/components/DeckNotesModal.jsx
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DeckNotesModal({ initialNotes = "", onSave, onClose }) {
  const [editMode, setEditMode] = useState(initialNotes === "");
  const [draft, setDraft] = useState(initialNotes);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {editMode ? "Edit Notes" : "Deck Notes"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Toggle buttons */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded ${
              !editMode ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => setEditMode(false)}
          >
            View
          </button>
          <button
            className={`px-3 py-1 rounded ${
              editMode ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        </div>

        {/* Body */}
        {editMode ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full h-64 bg-gray-800 text-white p-4 rounded resize-none"
            placeholder="Write your deck primer here… (Markdown supported)"
          />
        ) : (
          <div className="prose max-w-none prose-invert">
            {draft ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">
                No notes yet – switch to **Edit** to add some!
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          {editMode && (
            <button
              onClick={() => {
                onSave(draft.trim());
                setEditMode(false);
              }}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
            >
              Save
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
