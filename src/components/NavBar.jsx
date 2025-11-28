import { useState, useEffect, useRef } from "react";

export default function NavBar({
  currentUser,
  searchText,
  setSearchText,
  setMainTab,
  openAuth,
  handleLogout,
  handleResetAll,
  requireAuth,
  resetForm,
  setShowForm,
  conversations,
  favoriteProducts,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Dropdown dışına tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo - Depop tarzı */}
        <div
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => setMainTab("home")}
        >
          <div className="w-9 h-9 rounded-lg bg-electric text-white flex items-center justify-center font-black text-xl">
            L
          </div>
          <span className="text-2xl logo-text text-black hidden sm:block">
            lowkal
          </span>
        </div>

        {/* Arama barı - Depop tarzı, ortada */}
        <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Ürün, kategori veya açıklama ara..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full text-sm px-4 py-2.5 pl-10 rounded-full border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
              🔍
            </span>
          </div>
        </div>

        {/* Sağ taraf - Depop tarzı ikonlar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Sell Now butonu */}
              <button
                onClick={() => {
                  resetForm();
                  if (!requireAuth("login")) setShowForm(true);
                }}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition"
              >
                İLAN VER
              </button>

              {/* Mesajlar ikonu */}
              <button
                onClick={() => setMainTab("messages")}
                className="relative p-2 hover:bg-neutral-100 rounded-lg transition"
                title="Mesajlar"
              >
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {conversations.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              {/* Favoriler ikonu */}
              <button
                onClick={() => {
                  setMainTab("profile");
                }}
                className="relative p-2 hover:bg-neutral-100 rounded-lg transition"
                title="Favoriler"
              >
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {favoriteProducts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[10px] font-semibold text-red-500 bg-white rounded-full px-1">
                    {favoriteProducts.length > 9 ? "9+" : favoriteProducts.length}
                  </span>
                )}
              </button>

              {/* Kilit ikonu - Ayarlar için */}
              <button
                onClick={() => setMainTab("profile")}
                className="p-2 hover:bg-neutral-100 rounded-lg transition"
                title="Ayarlar"
              >
                <svg
                  className="w-5 h-5 text-electric"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </button>

              {/* Profil avatar + dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-1.5 hover:opacity-80 transition ${
                    showDropdown ? "ring-2 ring-black rounded-lg" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-300 text-white flex items-center justify-center text-xs font-semibold">
                    {currentUser.firstName?.[0]?.toLowerCase()}
                    {currentUser.lastName?.[0]?.toLowerCase()}
                  </div>
                  <div className="w-4 h-4 border border-black rounded flex items-center justify-center">
                    <span className="text-black text-[10px]">▼</span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                    <button
                      onClick={() => {
                        setMainTab("profile");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-neutral-50 transition"
                    >
                      Your profile
                    </button>
                    <div className="border-t border-neutral-100"></div>
                    <button
                      onClick={() => {
                        setMainTab("selling-hub");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-neutral-50 transition"
                    >
                      Your selling hub
                    </button>
                    <div className="border-t border-neutral-100"></div>
                    <button
                      onClick={() => {
                        setMainTab("purchases");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-neutral-50 transition"
                    >
                      Purchases
                    </button>
                    <div className="border-t border-neutral-100"></div>
                    <button
                      onClick={() => {
                        setMainTab("settings");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-neutral-50 transition"
                    >
                      Settings
                    </button>
                    <div className="border-t border-neutral-100"></div>
                    <button
                      onClick={() => {
                        setMainTab("resolution");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-neutral-50 transition"
                    >
                      Resolution Center
                    </button>
                    <div className="border-t border-neutral-100"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-neutral-50 transition"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuth("login")}
                className="text-sm font-medium text-black hover:text-neutral-600 transition"
              >
                Giriş
              </button>
              <button
                onClick={() => openAuth("signup")}
                className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition"
              >
                Kayıt ol
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

