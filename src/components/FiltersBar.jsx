export default function FiltersBar({
  radius,
  setRadius,
  filterTakasOnly,
  setFilterTakasOnly,
  sortMode,
  setSortMode,
  searchText,
  setSearchText,
  requireAuth,
  resetForm,
  setShowForm,
}) {
  return (
    <>
      {/* Depop tarzı filtreler - horizontal scroll */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 pb-2">
          {/* Mesafe filtresi - Depop tarzı chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full whitespace-nowrap">
            <span className="text-xs text-neutral-600">📍</span>
            <span className="text-xs font-medium text-black">{radius} km</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-16 accent-black"
            />
          </div>

          {/* Takas filtresi */}
            <button
              onClick={() => setFilterTakasOnly((v) => !v)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                filterTakasOnly
                  ? "bg-gold text-black shadow-sm"
                  : "bg-neutral-100 text-black hover:bg-gold/20"
              }`}
            >
              🔄 {filterTakasOnly ? "Sadece takas" : "Takas"}
            </button>

          {/* Sıralama */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="px-4 py-1.5 rounded-full bg-neutral-100 text-black text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
          >
            <option value="newest">🆕 En yeni</option>
            <option value="priceLow">💰 Fiyat ↑</option>
            <option value="priceHigh">💰 Fiyat ↓</option>
          </select>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden">
        <input
          type="text"
          placeholder="🔍 Ürün, kategori ara..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full text-sm px-4 py-2.5 rounded-full border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-all"
        />
      </div>
    </>
  );
}

