export default function MessagePanel({
  show,
  panelMode,
  activeProduct,
  activeMessages,
  inputText,
  setInputText,
  offerPrice,
  setOfferPrice,
  selectedTakasProductId,
  setSelectedTakasProductId,
  myProducts,
  onClose,
  onSend,
}) {
  if (!show || !activeProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-3xl p-5 flex flex-col max-h-[90vh]">
        <header className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[11px] text-neutral-500 mb-1 uppercase tracking-wide">
              {panelMode === "message" && "Mesaj"}
              {panelMode === "offer" && "Teklif"}
              {panelMode === "takas" && "Takas"}
            </p>
            <h2 className="text-sm font-semibold">{activeProduct.title}</h2>
            <p className="text-xs text-neutral-700 mt-0.5">
              Satıcı fiyatı{" "}
              <span className="font-semibold">{activeProduct.price} TL</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 text-xl"
          >
            ×
          </button>
        </header>

        <div className="flex-1 rounded-2xl bg-neutral-50 border border-neutral-200 mb-3 p-3 overflow-y-auto space-y-2 text-xs">
          {activeMessages.length === 0 ? (
            <p className="text-neutral-500 text-[11px]">
              Bu ilan için henüz bir etkileşim yok.
            </p>
          ) : (
            activeMessages.map((m) => (
              <div key={m.id} className="flex flex-col items-start gap-0.5">
                <span className="text-[10px] text-neutral-500">{m.author}</span>
                <div className="px-3 py-1.5 rounded-2xl bg-white border border-neutral-200 text-neutral-900">
                  {m.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          {panelMode === "offer" && (
            <input
              type="number"
              placeholder="Teklif (TL)"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-40 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          )}

          {panelMode === "takas" && (
            <div className="space-y-2">
              {myProducts.length === 0 ? (
                <p className="text-amber-600 text-[11px]">
                  Takas için önce kendi ürünlerini eklemelisin.
                </p>
              ) : (
                <>
                  <select
                    value={selectedTakasProductId}
                    onChange={(e) => setSelectedTakasProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="">Bir ürün seç</option>
                    {myProducts.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {mp.title} — {mp.price} TL
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Üstüne para (opsiyonel)"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-40 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Mesaj ekle (opsiyonel)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <button
              onClick={onSend}
              className="px-4 py-2 rounded-full bg-electric text-white text-xs font-semibold hover:bg-electric/90 transition shadow-sm"
            >
              Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

