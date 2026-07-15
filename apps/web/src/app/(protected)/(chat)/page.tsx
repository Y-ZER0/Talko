export default function ChatPage() {
  return (
    <div className="flex items-center justify-center h-full bg-bg">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-muted flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A8478"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text mb-1">
          Select a conversation
        </h2>
        <p className="text-sm text-text-muted">
          Choose from your existing conversations or start a new one
        </p>
      </div>
    </div>
  );
}
