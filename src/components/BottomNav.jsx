export default function BottomNav({ mainTab, setMainTab, currentUser, requireAuth, resetForm, setShowForm }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-neutral-200 bg-white/80 backdrop-blur-sm z-40 safe-area-bottom">
      <div className="max-w-7xl mx-auto flex items-center justify-around py-2">
        {/* Home */}
        <button
          onClick={() => setMainTab("home")}
          className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
            mainTab === "home" ? "text-black" : "text-neutral-400"
          }`}
        >
          <span className="text-2xl">
            {mainTab === "home" ? "🏠" : "🏡"}
          </span>
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => setMainTab("search")}
          className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
            mainTab === "search" ? "text-black" : "text-neutral-400"
          }`}
        >
          <span className="text-2xl">
            {mainTab === "search" ? "🔍" : "🔎"}
          </span>
          <span className="text-[10px] font-medium">Ara</span>
        </button>

        {/* Sell - Depop tarzı */}
        <button
          onClick={() => {
            resetForm();
            if (!requireAuth("login")) setShowForm(true);
          }}
          className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-black"
        >
          <span className="w-10 h-10 rounded-full bg-electric text-white flex items-center justify-center text-xl font-bold shadow-lg hover:bg-electric/90 transition">
            +
          </span>
          <span className="text-[10px] font-medium">İLAN VER</span>
        </button>

        {/* Messages */}
        <button
          onClick={() => setMainTab("messages")}
          className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
            mainTab === "messages" ? "text-black" : "text-neutral-400"
          }`}
        >
          <span className="text-2xl relative">
            {mainTab === "messages" ? "💬" : "💭"}
            {/* Bildirim badge - eğer mesaj varsa */}
          </span>
          <span className="text-[10px] font-medium">Mesajlar</span>
        </button>

        {/* Activity */}
        <button
          onClick={() => setMainTab("activity")}
          className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
            mainTab === "activity" ? "text-black" : "text-neutral-400"
          }`}
        >
          <span className="text-2xl relative">
            {mainTab === "activity" ? "⚡" : "🔔"}
            {/* Bildirim badge */}
          </span>
          <span className="text-[10px] font-medium">Etkinlik</span>
        </button>
      </div>
    </nav>
  );
}

