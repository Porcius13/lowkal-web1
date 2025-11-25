import { useState, useMemo, useEffect } from "react";

// LocalStorage key'leri (v2 ürünler)
const STORAGE_KEYS = {
  products: "lowkal_products_v2",
  messages: "lowkal_messages_v1",
  ui: "lowkal_ui_v2",
};

export default function App() {
  // -------------------- STATE --------------------
  const [radius, setRadius] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    photo: "",
    title: "",
    price: "",
    category: "",
    takas: false,
  });
  const [editingProductId, setEditingProductId] = useState(null);

  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);

  const [activeProduct, setActiveProduct] = useState(null);
  const [panelMode, setPanelMode] = useState(null);
  const [inputText, setInputText] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [selectedTakasProductId, setSelectedTakasProductId] = useState("");
  const [filterTakasOnly, setFilterTakasOnly] = useState(false);

  const [tab, setTab] = useState("all"); // "all" | "mine"
  const [sortMode, setSortMode] = useState("newest"); // "newest" | "priceLow" | "priceHigh"

  // -------------------- LOAD FROM LOCALSTORAGE --------------------
  useEffect(() => {
    try {
      // Ürünler
      const savedProducts = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.products)
      );
      if (Array.isArray(savedProducts)) {
        setProducts(savedProducts);
      }

      // Mesajlar
      const savedMessages = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.messages)
      );
      if (Array.isArray(savedMessages)) setMessages(savedMessages);

      // UI
      const savedUi = JSON.parse(localStorage.getItem(STORAGE_KEYS.ui));
      if (savedUi) {
        if (typeof savedUi.radius === "number") setRadius(savedUi.radius);
        if (typeof savedUi.filterTakasOnly === "boolean")
          setFilterTakasOnly(savedUi.filterTakasOnly);
        if (savedUi.tab === "all" || savedUi.tab === "mine")
          setTab(savedUi.tab);
        if (
          savedUi.sortMode === "newest" ||
          savedUi.sortMode === "priceLow" ||
          savedUi.sortMode === "priceHigh"
        ) {
          setSortMode(savedUi.sortMode);
        }
      }
    } catch (err) {
      console.error("LocalStorage load error:", err);
    }
  }, []);

  // -------------------- SAVE TO LOCALSTORAGE --------------------
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.ui,
      JSON.stringify({ radius, filterTakasOnly, tab, sortMode })
    );
  }, [radius, filterTakasOnly, tab, sortMode]);

  // -------------------- MEMO DATA --------------------
  const myProducts = useMemo(
    () => products.filter((p) => p.owner === "Ben"),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (p.distanceKm > radius) return false;
      if (filterTakasOnly && !p.takas) return false;
      if (tab === "mine" && p.owner !== "Ben") return false;
      return true;
    });

    // Sıralama
    const sorted = [...result].sort((a, b) => {
      if (sortMode === "newest") {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA; // yeni üstte
      }
      if (sortMode === "priceLow") {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortMode === "priceHigh") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });

    return sorted;
  }, [products, radius, filterTakasOnly, tab, sortMode]);

  const activeMessages = useMemo(
    () =>
      activeProduct
        ? messages.filter((m) => m.productId === activeProduct.id)
        : [],
    [messages, activeProduct]
  );

  // -------------------- HELPERS --------------------
  const resetForm = () => {
    setForm({
      photo: "",
      title: "",
      price: "",
      category: "",
      takas: false,
    });
    setEditingProductId(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, photo: reader.result || "" }));
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // -------------------- ACTIONS: ADD / EDIT / DELETE --------------------
  const handleAddOrUpdateProduct = () => {
    if (!form.photo || !form.title || !form.price || !form.category) return;

    if (editingProductId) {
      // Düzenleme
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                title: form.title,
                price: Number(form.price),
                category: form.category,
                photo: form.photo,
                takas: form.takas,
              }
            : p
        )
      );
    } else {
      // Yeni ürün
      const newProduct = {
        id: Date.now(),
        title: form.title,
        price: Number(form.price),
        category: form.category,
        photo: form.photo,
        takas: form.takas,
        distanceKm: 0.3,
        owner: "Ben",
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setForm({
      photo: product.photo || "",
      title: product.title || "",
      price: String(product.price ?? ""),
      category: product.category || "",
      takas: !!product.takas,
    });
    setShowForm(true);
  };

  const handleDeleteProduct = (productId) => {
    const confirmDelete = window.confirm("Bu ürünü silmek istiyor musun?");
    if (!confirmDelete) return;

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setMessages((prev) => prev.filter((m) => m.productId !== productId));

    if (activeProduct && activeProduct.id === productId) {
      setActiveProduct(null);
      setPanelMode(null);
    }
  };

  const handleResetAll = () => {
    const ok = window.confirm(
      "Tüm ürünler ve mesajlar silinecek. Emin misin?"
    );
    if (!ok) return;

    setProducts([]);
    setMessages([]);
    setRadius(5);
    setFilterTakasOnly(false);
    setTab("all");
    setSortMode("newest");
    setActiveProduct(null);
    setPanelMode(null);

    localStorage.removeItem(STORAGE_KEYS.products);
    localStorage.removeItem(STORAGE_KEYS.messages);
    localStorage.removeItem(STORAGE_KEYS.ui);
  };

  // -------------------- ACTIONS: PANEL / MESAJ --------------------
  const openPanel = (product, mode) => {
    setActiveProduct(product);
    setPanelMode(mode);
    setInputText("");
    setOfferPrice("");
    setSelectedTakasProductId("");
  };

  const closePanel = () => {
    setPanelMode(null);
    setActiveProduct(null);
  };

  const sendInteraction = () => {
    if (!activeProduct || !panelMode) return;

    let text = inputText.trim();

    if (panelMode === "offer") {
      if (!offerPrice) return;
      text = `Teklif: ${offerPrice} TL` + (text ? ` — ${text}` : "");
    }

    if (panelMode === "takas") {
      if (!selectedTakasProductId) return;
      const takasProduct = myProducts.find(
        (p) => String(p.id) === String(selectedTakasProductId)
      );
      if (!takasProduct) return;

      text =
        `Takas Teklifi: "${takasProduct.title}"` +
        (offerPrice ? ` + ${offerPrice} TL` : "") +
        (text ? ` — Not: ${text}` : "");
    }

    if (!text) return;

    const newMessage = {
      id: Date.now(),
      productId: activeProduct.id,
      author: "Ben (Alıcı)",
      type: panelMode,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setOfferPrice("");
    setInputText("");
    setSelectedTakasProductId("");
  };

  // -------------------- UI --------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col items-center px-4 pb-24">
      {/* HEADER */}
      <header className="w-full max-w-5xl flex items-center justify-between pt-6 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-900 font-black text-xl">
            L
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Low-kal</h1>
            <p className="text-xs text-slate-400">
              Yakındaki ürünler. Sıfır komisyon. Sıfır karmaşa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAll}
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-2xl border border-slate-700 text-[11px] text-slate-300 hover:border-red-400 hover:text-red-300 transition"
          >
            Hepsini sıfırla
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-400 text-slate-950 text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-300 transition"
          >
            + Yeni ürün ekle
          </button>
        </div>
      </header>

      {/* TAB BAR */}
      <div className="w-full max-w-5xl mb-3 flex gap-2 text-xs">
        <button
          onClick={() => setTab("all")}
          className={`flex-1 px-3 py-2 rounded-2xl border transition ${
            tab === "all"
              ? "bg-slate-100 text-slate-900 border-slate-300"
              : "bg-slate-900/60 text-slate-300 border-slate-700"
          }`}
        >
          Tüm ürünler
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`flex-1 px-3 py-2 rounded-2xl border transition ${
            tab === "mine"
              ? "bg-emerald-400 text-slate-950 border-emerald-300"
              : "bg-slate-900/60 text-slate-300 border-slate-700"
          }`}
        >
          Benim ilanlarım
        </button>
      </div>

      {/* FILTERS */}
      <section className="w-full max-w-5xl mb-4 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-3 flex-1 flex flex-col gap-3">
          {/* Mesafe + takas filtresi */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Mesafe filtresi</span>
                <span className="text-xs font-medium text-emerald-300">
                  {radius} km içinde
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <button
              onClick={() => setFilterTakasOnly((v) => !v)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${
                filterTakasOnly
                  ? "bg-emerald-400 text-slate-950 border-emerald-300"
                  : "bg-slate-900 text-slate-300 border-slate-700"
              }`}
            >
              {filterTakasOnly
                ? "Sadece takas açık"
                : "Takas açık ürünleri filtrele"}
            </button>
          </div>

          {/* Sıralama */}
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="text-slate-400">Sırala:</span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="flex-1 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-[11px] focus:outline-none focus:border-emerald-400"
            >
              <option value="newest">En yeni</option>
              <option value="priceLow">Fiyat (artan)</option>
              <option value="priceHigh">Fiyat (azalan)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="sm:hidden inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-emerald-400 text-slate-950 text-sm font-semibold w-full"
        >
          + Yeni ürün ekle
        </button>
      </section>

      {/* PRODUCT LIST */}
      <main className="w-full max-w-5xl flex-1">
        {filteredProducts.length === 0 ? (
          <div className="mt-16 text-center text-sm text-slate-400">
            <p>
              {tab === "mine"
                ? "Henüz hiç ilan eklemedin."
                : "Bu filtrelerle ürün yok gibi."}
            </p>
            <p className="mt-1">
              Birkaç gerçek ürün ekleyip ekranı doldurabilirsin 😎
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.map((p) => (
              <article
                key={p.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-emerald-500/20 hover:border-emerald-400/60 transition flex flex-col"
              >
                <div className="relative">
                  <img
                    src={p.photo}
                    alt={p.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-slate-900/80">
                    {p.distanceKm.toFixed(1)} km yakınında
                  </div>
                  {p.takas && (
                    <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-emerald-400 text-slate-950 font-semibold">
                      Takas açık
                    </div>
                  )}

                  {/* Sadece benim ürünlerimde Sil/Düzenle */}
                  {p.owner === "Ben" && (
                    <div className="absolute bottom-2 right-2 flex gap-1 text-[10px]">
                      <button
                        onClick={() => handleEditProduct(p)}
                        className="px-2 py-1 rounded-full bg-slate-900/90 text-slate-100 hover:bg-slate-800"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="px-2 py-1 rounded-full bg-red-500/90 text-slate-50 hover:bg-red-400"
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                    {p.title}
                  </h3>
                  <p className="text-emerald-300 text-sm font-bold mb-1">
                    {p.price} TL
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] text-slate-400">{p.category}</p>
                    {p.createdAt && (
                      <p className="text-[10px] text-slate-500">
                        {formatDate(p.createdAt)}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex gap-1 text-[11px]">
                    <button
                      onClick={() => openPanel(p, "message")}
                      className="flex-1 px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700"
                    >
                      Mesaj at
                    </button>
                    <button
                      onClick={() => openPanel(p, "offer")}
                      className="flex-1 px-2 py-1 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                    >
                      Teklif ver
                    </button>
                    {p.takas && (
                      <button
                        onClick={() => openPanel(p, "takas")}
                        className="hidden sm:flex flex-1 px-2 py-1 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400"
                      >
                        Takas
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ÜRÜN EKLE / DÜZENLE MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-5 relative">
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-200 text-xl"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-1">
              {editingProductId ? "İlanı düzenle" : "Yeni ürün ekle"}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              {editingProductId
                ? "Fotoğraf, başlık, fiyat ve kategoriyi güncelleyebilirsin."
                : "Fotoğraf çek, fiyat, ad ve kategori ile ilanını oluştur."}
            </p>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-slate-300">Ürün fotoğrafı</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-xs text-slate-200 file:text-xs file:px-3 file:py-2 file:rounded-2xl file:border-0 file:bg-emerald-500 file:text-slate-950 file:font-medium file:cursor-pointer"
                />
                {form.photo && (
                  <div className="mt-2">
                    <p className="text-[11px] text-slate-400 mb-1">
                      Ön izleme:
                    </p>
                    <img
                      src={form.photo}
                      alt="Ön izleme"
                      className="w-full h-40 object-cover rounded-2xl border border-slate-700"
                    />
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Ürün adı"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-sm"
              />

              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Fiyat (TL)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-sm"
                />
                <input
                  type="text"
                  placeholder="Kategori"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="flex-1 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.takas}
                  onChange={(e) =>
                    setForm({ ...form, takas: e.target.checked })
                  }
                  className="accent-emerald-400"
                />
                Bu ürün için takas tekliflerini kabul ediyorum
              </label>
            </div>

            <button
              onClick={handleAddOrUpdateProduct}
              className="mt-5 w-full py-2.5 rounded-2xl bg-emerald-400 text-slate-950 text-sm font-semibold"
            >
              {editingProductId ? "Değişiklikleri kaydet" : "İlanı yayınla"}
            </button>
          </div>
        </div>
      )}

      {/* MESAJ / TEKLİF / TAKAS PANELİ */}
      {panelMode && activeProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col max-h-[90vh]">
            <header className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] text-slate-500 mb-1">
                  {panelMode === "message" && "Mesaj"}
                  {panelMode === "offer" && "Teklif"}
                  {panelMode === "takas" && "Takas Teklifi"}
                </p>
                <h2 className="text-sm font-semibold">{activeProduct.title}</h2>
                <p className="text-xs text-emerald-300">
                  Satıcı fiyatı: {activeProduct.price} TL
                </p>
              </div>
              <button
                onClick={closePanel}
                className="text-slate-500 hover:text-slate-200 text-xl"
              >
                ×
              </button>
            </header>

            {/* Mesaj geçmişi */}
            <div className="flex-1 rounded-2xl bg-slate-900/80 border border-slate-800 mb-3 p-3 overflow-y-auto space-y-2 text-xs">
              {activeMessages.length === 0 ? (
                <p className="text-slate-500 text-[11px]">
                  Bu ilan için henüz bir etkileşim yok.
                </p>
              ) : (
                activeMessages.map((m) => (
                  <div key={m.id} className="flex flex-col items-start">
                    <span className="text-[10px] text-slate-500">
                      {m.author}
                    </span>
                    <div className="px-3 py-1.5 rounded-2xl bg-slate-800">
                      {m.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form alanı */}
            <div className="space-y-2">
              {panelMode === "offer" && (
                <input
                  type="number"
                  placeholder="Teklif (TL)"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-32 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs"
                />
              )}

              {panelMode === "takas" && (
                <div className="space-y-2">
                  {myProducts.length === 0 ? (
                    <p className="text-amber-300 text-[11px]">
                      Takas için önce kendi ürünlerini eklemelisin.
                    </p>
                  ) : (
                    <>
                      <select
                        value={selectedTakasProductId}
                        onChange={(e) =>
                          setSelectedTakasProductId(e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs"
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
                        className="w-40 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs"
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
                  className="flex-1 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs"
                />
                <button
                  onClick={sendInteraction}
                  className="px-4 py-2 rounded-2xl bg-emerald-400 text-slate-950 text-xs"
                >
                  Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
