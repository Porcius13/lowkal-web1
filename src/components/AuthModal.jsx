export default function AuthModal({
  show,
  authMode,
  setAuthMode,
  authForm,
  handleAuthChange,
  authError,
  onClose,
  onSubmit,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-5 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 text-xl"
        >
          ×
        </button>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            {authMode === "login" ? "Giriş yap" : "Kayıt ol"}
          </h2>
          <button
            className="text-[11px] text-neutral-700 underline"
            onClick={() => setAuthMode((m) => (m === "login" ? "signup" : "login"))}
          >
            {authMode === "login"
              ? "Hesabın yok mu? Kayıt ol"
              : "Hesabın var mı? Giriş yap"}
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {authMode === "signup" && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ad"
                value={authForm.firstName}
                onChange={(e) => handleAuthChange("firstName", e.target.value)}
                className="flex-1 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <input
                type="text"
                placeholder="Soyad"
                value={authForm.lastName}
                onChange={(e) => handleAuthChange("lastName", e.target.value)}
                className="flex-1 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          )}

          <input
            type="email"
            placeholder="E-posta"
            value={authForm.email}
            onChange={(e) => handleAuthChange("email", e.target.value)}
            className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />

          <input
            type="password"
            placeholder="Şifre"
            value={authForm.password}
            onChange={(e) => handleAuthChange("password", e.target.value)}
            className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />

          {authMode === "signup" && (
            <input
              type="password"
              placeholder="Şifre (tekrar)"
              value={authForm.confirmPassword}
              onChange={(e) => handleAuthChange("confirmPassword", e.target.value)}
              className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          )}

          {authError && <p className="text-[11px] text-red-500">{authError}</p>}
        </div>

        <button
          onClick={onSubmit}
          className="mt-4 w-full py-2.5 rounded-full bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition shadow-sm"
        >
          {authMode === "login" ? "Giriş yap" : "Kayıt ol"}
        </button>
      </div>
    </div>
  );
}

