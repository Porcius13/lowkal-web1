import { useState, useMemo, useEffect } from "react";

// Sabit kategori ve durum listeleri
const CATEGORIES = [
  "Kıyafet",
  "Ayakkabı",
  "Kitap",
  "Elektronik",
  "Ev",
  "Aksesuar",
  "Diğer",
];

const CONDITIONS = ["Yeni", "Az kullanılmış", "İyi", "Yıpranmış"];

// LocalStorage key'leri (versiyonlanmış)
const STORAGE_KEYS = {
  products: "lowkal_products_v4",
  messages: "lowkal_messages_v2",
  ui: "lowkal_ui_v5",
  users: "lowkal_users_v2",
  currentUser: "lowkal_current_user_v2",
};

export default function App() {
  // -------------------- AUTH STATE --------------------
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [authForm, setAuthForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [authError, setAuthError] = useState("");
  const [profileBio, setProfileBio] = useState("");

  // -------------------- APP STATE --------------------
  const [radius, setRadius] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    photo: "",
    title: "",
    price: "",
    category: "",
    takas: false,
    description: "",
    condition: "",
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

  const [sortMode, setSortMode] = useState("newest"); // "newest" | "priceLow" | "priceHigh"
  const [mainTab, setMainTab] = useState("home"); // "home" | "messages" | "profile"
  const [searchText, setSearchText] = useState("");

  const [detailProduct, setDetailProduct] = useState(null); // ürün detay modali

  // -------------------- LOAD FROM LOCALSTORAGE --------------------
  useEffect(() => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.users));
      if (Array.isArray(savedUsers)) setUsers(savedUsers);

      const savedCurrentUser = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.currentUser)
      );
      if (savedCurrentUser && savedCurrentUser.id) {
        setCurrentUser(savedCurrentUser);
        setProfileBio(savedCurrentUser.bio || "");
      }

      const savedProducts = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.products)
      );
      if (Array.isArray(savedProducts)) setProducts(savedProducts);

      const savedMessages = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.messages)
      );
      if (Array.isArray(savedMessages)) setMessages(savedMessages);

      const savedUi = JSON.parse(localStorage.getItem(STORAGE_KEYS.ui));
      if (savedUi) {
        if (typeof savedUi.radius === "number") setRadius(savedUi.radius);
        if (typeof savedUi.filterTakasOnly === "boolean")
          setFilterTakasOnly(savedUi.filterTakasOnly);
        if (["newest", "priceLow", "priceHigh"].includes(savedUi.sortMode))
          setSortMode(savedUi.sortMode);
        if (["home", "messages", "profile"].includes(savedUi.mainTab))
          setMainTab(savedUi.mainTab);
        if (typeof savedUi.searchText === "string")
          setSearchText(savedUi.searchText);
      }
    } catch (err) {
      console.error("LocalStorage load error:", err);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileBio(currentUser.bio || "");
    } else {
      setProfileBio("");
    }
  }, [currentUser]);

  // -------------------- SAVE TO LOCALSTORAGE --------------------
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        STORAGE_KEYS.currentUser,
        JSON.stringify(currentUser)
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.ui,
      JSON.stringify({
        radius,
        filterTakasOnly,
        sortMode,
        mainTab,
        searchText,
      })
    );
  }, [radius, filterTakasOnly, sortMode, mainTab, searchText]);

  // -------------------- MEMO DATA --------------------
  const myProducts = useMemo(() => {
    if (!currentUser) return [];
    return products.filter((p) => p.ownerId === currentUser.id);
  }, [products, currentUser]);

  const favoriteProducts = useMemo(() => {
    if (!currentUser) return [];
    const likedIds = currentUser.likedProductIds || [];
    return products.filter((p) => likedIds.includes(p.id));
  }, [products, currentUser]);

  const filteredProducts = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    let result = products.filter((p) => {
      if (p.distanceKm > radius) return false;
      if (filterTakasOnly && !p.takas) return false;

      if (q) {
        const haystack =
          `${p.title || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    const sorted = [...result].sort((a, b) => {
      if (sortMode === "newest") {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
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
  }, [products, radius, filterTakasOnly, sortMode, searchText]);

  const activeMessages = useMemo(
    () =>
      activeProduct
        ? messages.filter((m) => m.productId === activeProduct.id)
        : [],
    [messages, activeProduct]
  );

  const conversations = useMemo(() => {
    if (!messages.length) return [];
    const byProduct = new Map();

    for (const m of messages) {
      const prev = byProduct.get(m.productId);
      if (!prev) {
        byProduct.set(m.productId, m);
      } else {
        const tPrev = new Date(prev.createdAt || 0).getTime();
        const tNew = new Date(m.createdAt || 0).getTime();
        if (tNew > tPrev) byProduct.set(m.productId, m);
      }
    }

    const result = [];
    for (const [productId, lastMessage] of byProduct.entries()) {
      const product = products.find((p) => p.id === productId);
      if (!product) continue;
      result.push({ product, lastMessage });
    }

    return result.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt || 0).getTime() -
        new Date(a.lastMessage.createdAt || 0).getTime()
    );
  }, [messages, products]);

  // -------------------- HELPERS --------------------
  const resetForm = () => {
    setForm({
      photo: "",
      title: "",
      price: "",
      category: "",
      takas: false,
      description: "",
      condition: "",
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

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const requireAuth = (mode = "login") => {
    if (!currentUser) {
      setAuthMode(mode);
      setShowAuthModal(true);
      return true;
    }
    return false;
  };

  const isProductLiked = (productId) => {
    if (!currentUser) return false;
    const liked = currentUser.likedProductIds || [];
    return liked.includes(productId);
  };

  const toggleFavorite = (productId) => {
    if (!currentUser) {
      requireAuth("login");
      return;
    }
    const liked = currentUser.likedProductIds || [];
    const exists = liked.includes(productId);
    const updatedLiked = exists
      ? liked.filter((id) => id !== productId)
      : [...liked, productId];

    const updatedUser = { ...currentUser, likedProductIds: updatedLiked };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  // -------------------- AUTH ACTIONS --------------------
  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowAuthModal(true);
  };

  const closeAuth = () => {
    setShowAuthModal(false);
    setAuthError("");
  };

  const handleAuthChange = (field, value) => {
    setAuthForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAuthSubmit = () => {
    setAuthError("");
    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password.trim();

    if (!email || !password) {
      setAuthError("E-posta ve şifre zorunlu.");
      return;
    }

    if (authMode === "signup") {
      const firstName = authForm.firstName.trim();
      const lastName = authForm.lastName.trim();
      const confirmPassword = authForm.confirmPassword.trim();

      if (!firstName || !lastName) {
        setAuthError("Ad ve soyad zorunlu.");
        return;
      }

      if (password.length < 6) {
        setAuthError("Şifre en az 6 karakter olmalı.");
        return;
      }

      if (password !== confirmPassword) {
        setAuthError("Şifre ve tekrar şifre uyuşmuyor.");
        return;
      }

      const exists = users.some((u) => u.email === email);
      if (exists) {
        setAuthError("Bu e-posta ile zaten bir hesap var.");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        password, // NOT: Gerçekte hash lazım
        createdAt: new Date().toISOString(),
        bio: "",
        likedProductIds: [],
      };

      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setProfileBio("");
      setShowAuthModal(false);
    }

    if (authMode === "login") {
      const found = users.find((u) => u.email === email);
      if (!found || found.password !== password) {
        setAuthError("E-posta veya şifre hatalı.");
        return;
      }
      // likedProductIds/bio yoksa boş olarak ekle
      const normalized = {
        ...found,
        bio: found.bio || "",
        likedProductIds: found.likedProductIds || [],
      };
      setUsers((prev) => prev.map((u) => (u.id === normalized.id ? normalized : u)));
      setCurrentUser(normalized);
      setProfileBio(normalized.bio || "");
      setShowAuthModal(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMainTab("home");
  };

  const handleProfileSave = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, bio: profileBio };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  // -------------------- PRODUCT ACTIONS --------------------
  const handleAddOrUpdateProduct = () => {
    if (!currentUser) {
      requireAuth("signup");
      return;
    }

    if (
      !form.photo ||
      !form.title ||
      !form.price ||
      !form.category ||
      !form.condition
    )
      return;

    if (editingProductId) {
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
                description: form.description,
                condition: form.condition,
              }
            : p
        )
      );
    } else {
      const newProduct = {
        id: Date.now(),
        title: form.title,
        price: Number(form.price),
        category: form.category,
        photo: form.photo,
        takas: form.takas,
        distanceKm: 0.3,
        ownerId: currentUser.id,
        ownerName: `${currentUser.firstName} ${currentUser.lastName}`,
        createdAt: new Date().toISOString(),
        description: form.description,
        condition: form.condition,
      };
      setProducts((prev) => [newProduct, ...prev]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEditProduct = (product) => {
    if (!currentUser || product.ownerId !== currentUser.id) return;
    setEditingProductId(product.id);
    setForm({
      photo: product.photo || "",
      title: product.title || "",
      price: String(product.price ?? ""),
      category: product.category || "",
      takas: !!product.takas,
      description: product.description || "",
      condition: product.condition || "",
    });
    setShowForm(true);
  };

  const handleDeleteProduct = (productId) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    if (!currentUser || target.ownerId !== currentUser.id) return;

    const confirmDelete = window.confirm("Bu ürünü silmek istiyor musun?");
    if (!confirmDelete) return;

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setMessages((prev) => prev.filter((m) => m.productId !== productId));

    if (activeProduct && activeProduct.id === productId) {
      setActiveProduct(null);
      setPanelMode(null);
    }
    if (detailProduct && detailProduct.id === productId) {
      setDetailProduct(null);
    }
  };

  const handleResetAll = () => {
    const ok = window.confirm(
      "Tüm ilanlar ve mesajlar silinecek (kullanıcı hesabın duracak). Emin misin?"
    );
    if (!ok) return;

    setProducts([]);
    setMessages([]);
    setRadius(5);
    setFilterTakasOnly(false);
    setSortMode("newest");
    setSearchText("");
    setActiveProduct(null);
    setPanelMode(null);
    setDetailProduct(null);
    localStorage.removeItem(STORAGE_KEYS.products);
    localStorage.removeItem(STORAGE_KEYS.messages);
    localStorage.removeItem(STORAGE_KEYS.ui);
  };

  // -------------------- PANEL / MESAJ --------------------
  const openPanel = (product, mode) => {
    if (requireAuth("login")) return;
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
    if (!currentUser) {
      requireAuth("login");
      return;
    }

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
      author: `${currentUser.firstName} ${currentUser.lastName}`,
      type: panelMode,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setOfferPrice("");
    setInputText("");
    setSelectedTakasProductId("");
  };

  const openConversationFromMessages = (product) => {
    setMainTab("messages");
    openPanel(product, "message");
  };

  // -------------------- UI --------------------
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      {/* TOP NAV */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo + search */}
          <div className="flex items-center gap-4 flex-1">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setMainTab("home")}
            >
              <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center font-black text-lg">
                L
              </div>
              <span className="text-xl font-semibold tracking-tight">
                lowkal
              </span>
            </div>
            <div className="hidden sm:flex items-center flex-1">
              <input
                type="text"
                placeholder="Ürün, kategori veya açıklama ara"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-full border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Auth bölümü */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <span className="hidden sm:inline-flex text-[11px] px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <button
                  onClick={handleResetAll}
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full border border-neutral-300 text-[11px] text-neutral-600 hover:border-red-400 hover:text-red-500 transition"
                >
                  Hepsini sıfırla
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    if (!requireAuth("login")) setShowForm(true);
                  }}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition"
                >
                  + İlan ekle
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-neutral-300 text-[11px] text-neutral-700 hover:border-neutral-500 hover:text-neutral-900 transition"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuth("login")}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-neutral-300 text-[11px] text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition"
                >
                  Giriş
                </button>
                <button
                  onClick={() => openAuth("signup")}
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-semibold hover:bg-neutral-800 transition"
                >
                  Kayıt ol
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col px-3 sm:px-4 py-4 gap-4 pb-20">
        {/* HOME TAB */}
        {mainTab === "home" && (
          <>
            {/* Filters */}
            <section className="w-full flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
              <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 flex-1 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-500">
                        Mesafe filtresi
                      </span>
                      <span className="text-xs font-medium text-neutral-800">
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
                      className="w-full accent-black"
                    />
                  </div>

                  <button
                    onClick={() => setFilterTakasOnly((v) => !v)}
                    className={`px-3 py-2 rounded-full border text-xs font-medium transition ${
                      filterTakasOnly
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-800"
                    }`}
                  >
                    {filterTakasOnly
                      ? "Sadece takas"
                      : "Takas açık ürünleri filtrele"}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-neutral-500">Sırala</span>
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-neutral-900"
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
                  if (!requireAuth("login")) setShowForm(true);
                }}
                className="sm:hidden inline-flex items-center justify-center px-4 py-2 rounded-full bg-black text-white text-xs font-semibold w-full"
              >
                + İlan ekle
              </button>
            </section>

            {/* Mobile search */}
            <div className="sm:hidden">
              <input
                type="text"
                placeholder="Ürün, kategori veya açıklama ara"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-full border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {/* Product grid */}
            <main className="w-full flex-1">
              {filteredProducts.length === 0 ? (
                <div className="mt-16 text-center text-sm text-neutral-500">
                  <p>Bu filtrelerle ürün yok gibi.</p>
                  <p className="mt-1">
                    Filtreleri temizleyerek veya yeni ilan ekleyerek
                    başlayabilirsin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filteredProducts.map((p) => {
                    const isMine =
                      currentUser &&
                      p.ownerId &&
                      p.ownerId === currentUser.id;
                    const liked = isProductLiked(p.id);

                    return (
                      <article
                        key={p.id}
                        className="bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-sm hover:border-neutral-400 transition cursor-pointer"
                        onClick={() => setDetailProduct(p)}
                      >
                        <div className="relative">
                          <img
                            src={p.photo}
                            alt={p.title}
                            className="w-full aspect-[3/4] object-cover"
                          />
                          <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-white/90 text-neutral-800 border border-neutral-200">
                            {p.distanceKm.toFixed(1)} km
                          </div>
                          {p.takas && (
                            <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-neutral-900 text-white font-semibold">
                              Takas
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(p.id);
                            }}
                            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-neutral-200 flex items-center justify-center text-[13px] hover:border-neutral-700"
                          >
                            {liked ? "♥" : "♡"}
                          </button>
                          {p.ownerName && (
                            <div className="absolute bottom-2 left-2 text-[10px] px-2 py-1 rounded-full bg-white/90 text-neutral-800 border border-neutral-200">
                              {p.ownerName}
                            </div>
                          )}

                          {isMine && (
                            <div className="absolute top-2 right-2 mt-7 flex flex-col gap-1 text-[10px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProduct(p);
                                }}
                                className="px-2 py-1 rounded-full bg-white/90 border border-neutral-300 text-neutral-800 hover:border-neutral-600"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProduct(p.id);
                                }}
                                className="px-2 py-1 rounded-full bg-red-500 text-white hover:bg-red-400"
                              >
                                Sil
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="p-2.5 flex-1 flex flex-col">
                          <h3 className="text-xs font-medium line-clamp-2 mb-1">
                            {p.title}
                          </h3>
                          <p className="text-sm font-semibold text-neutral-900 mb-0.5">
                            {p.price} TL
                          </p>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] text-neutral-500">
                              {p.category}
                              {p.condition ? ` • ${p.condition}` : ""}
                            </p>
                            {p.createdAt && (
                              <p className="text-[10px] text-neutral-400">
                                {formatDate(p.createdAt)}
                              </p>
                            )}
                          </div>

                          {p.description && (
                            <p className="text-[10px] text-neutral-500 line-clamp-2 mb-1">
                              {p.description}
                            </p>
                          )}

                          <div className="mt-auto flex gap-1 text-[10px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPanel(p, "message");
                              }}
                              className="flex-1 px-2 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 hover:border-neutral-500"
                            >
                              Mesaj
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPanel(p, "offer");
                              }}
                              className="flex-1 px-2 py-1 rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
                            >
                              Teklif
                            </button>
                            {p.takas && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPanel(p, "takas");
                                }}
                                className="hidden sm:flex flex-1 px-2 py-1 rounded-full bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-700"
                              >
                                Takas
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </main>
          </>
        )}

        {/* MESSAGES TAB */}
        {mainTab === "messages" && (
          <main className="w-full flex-1">
            <h2 className="text-sm font-semibold mb-3">Mesajlar</h2>
            {!currentUser ? (
              <div className="mt-8 text-center text-sm text-neutral-500">
                <p>Mesajlarını görmek için giriş yapmalısın.</p>
                <button
                  onClick={() => openAuth("login")}
                  className="mt-3 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800"
                >
                  Giriş yap
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="mt-8 text-center text-sm text-neutral-500">
                <p>Henüz hiç mesajın yok.</p>
                <p className="mt-1">
                  Birkaç ilana mesaj atarak burayı doldurabilirsin.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(({ product, lastMessage }) => (
                  <button
                    key={product.id}
                    onClick={() => openConversationFromMessages(product)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 text-left"
                  >
                    <img
                      src={product.photo}
                      alt={product.title}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">
                          {product.title}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">
                        {lastMessage.text}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </main>
        )}

        {/* PROFILE TAB */}
        {mainTab === "profile" && (
          <main className="w-full flex-1">
            <h2 className="text-sm font-semibold mb-3">Profil</h2>
            {!currentUser ? (
              <div className="mt-8 text-center text-sm text-neutral-500">
                <p>Profilini görmek için giriş yap veya kayıt ol.</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => openAuth("login")}
                    className="px-4 py-2 rounded-full border border-neutral-300 text-xs text-neutral-800 hover:border-neutral-800"
                  >
                    Giriş yap
                  </button>
                  <button
                    onClick={() => openAuth("signup")}
                    className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800"
                  >
                    Kayıt ol
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Profil bilgileri */}
                <section className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xl font-semibold">
                      {currentUser.firstName?.[0]}
                      {currentUser.lastName?.[0]}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-sm">
                    <div>
                      <p className="font-semibold">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {currentUser.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1">
                        Kısa bio
                      </label>
                      <textarea
                        rows={3}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Kendini kısaca tanıt (örn: Bilgisayar müh öğrencisi, M beden giyim satıyorum vs.)"
                        className="w-full text-xs px-3 py-2 rounded-2xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>
                        Üyelik: {formatDate(currentUser.createdAt) || "-"}
                      </span>
                      <span>İlan sayısı: {myProducts.length}</span>
                    </div>
                    <button
                      onClick={handleProfileSave}
                      className="mt-1 inline-flex px-4 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800"
                    >
                      Profili kaydet
                    </button>
                  </div>
                </section>

                {/* Benim ilanlarım */}
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-neutral-700">
                      İlanların
                    </h3>
                    <button
                      onClick={() => {
                        resetForm();
                        if (!requireAuth("login")) setShowForm(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 rounded-full border border-neutral-300 text-[11px] text-neutral-800 hover:border-neutral-800"
                    >
                      + Yeni ilan
                    </button>
                  </div>

                  {myProducts.length === 0 ? (
                    <p className="text-[12px] text-neutral-500 mt-2">
                      Henüz hiç ilan eklemedin. Gardırobunu, kitaplığını veya
                      elektroniklerini listeleyerek başlayabilirsin.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {myProducts.map((p) => (
                        <article
                          key={p.id}
                          className="bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-sm hover:border-neutral-400 transition cursor-pointer"
                          onClick={() => setDetailProduct(p)}
                        >
                          <img
                            src={p.photo}
                            alt={p.title}
                            className="w-full aspect-[3/4] object-cover"
                          />
                          <div className="p-2.5 flex-1 flex flex-col">
                            <h4 className="text-[11px] font-medium line-clamp-2 mb-1">
                              {p.title}
                            </h4>
                            <p className="text-xs font-semibold text-neutral-900 mb-0.5">
                              {p.price} TL
                            </p>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] text-neutral-500">
                                {p.category}
                                {p.condition ? ` • ${p.condition}` : ""}
                              </p>
                              {p.createdAt && (
                                <p className="text-[10px] text-neutral-400">
                                  {formatDate(p.createdAt)}
                                </p>
                              )}
                            </div>
                            <div className="mt-auto flex gap-1 text-[10px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProduct(p);
                                }}
                                className="flex-1 px-2 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 hover:border-neutral-500"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProduct(p.id);
                                }}
                                className="flex-1 px-2 py-1 rounded-full bg-red-500 text-white hover:bg-red-400"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                {/* Favoriler */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-neutral-700">
                    Favorilerin
                  </h3>
                  {favoriteProducts.length === 0 ? (
                    <p className="text-[12px] text-neutral-500 mt-1">
                      Henüz hiçbir ürünü favorilere eklemedin. Beğendiğin
                      ilanlarda kalbe basarak burada toplayabilirsin.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {favoriteProducts.map((p) => (
                        <article
                          key={p.id}
                          className="bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-sm hover:border-neutral-400 transition cursor-pointer"
                          onClick={() => setDetailProduct(p)}
                        >
                          <div className="relative">
                            <img
                              src={p.photo}
                              alt={p.title}
                              className="w-full aspect-[3/4] object-cover"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(p.id);
                              }}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-neutral-200 flex items-center justify-center text-[13px] hover:border-neutral-700"
                            >
                              {isProductLiked(p.id) ? "♥" : "♡"}
                            </button>
                          </div>
                          <div className="p-2.5 flex-1 flex flex-col">
                            <h4 className="text-[11px] font-medium line-clamp-2 mb-1">
                              {p.title}
                            </h4>
                            <p className="text-xs font-semibold text-neutral-900 mb-0.5">
                              {p.price} TL
                            </p>
                            <p className="text-[10px] text-neutral-500 mb-1">
                              {p.category}
                              {p.condition ? ` • ${p.condition}` : ""}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </main>
        )}
      </div>

      {/* ALT NAV (BOTTOM BAR) */}
      <nav className="fixed bottom-0 inset-x-0 border-t border-neutral-200 bg-white/95 backdrop-blur-sm z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-around py-2 text-xs">
          <button
            onClick={() => setMainTab("home")}
            className={`flex flex-col items-center gap-0.5 px-3 ${
              mainTab === "home" ? "text-neutral-900" : "text-neutral-500"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full border ${
                mainTab === "home"
                  ? "bg-neutral-900 border-neutral-900"
                  : "border-neutral-400"
              }`}
            />
            <span>Home</span>
          </button>
          <button
            onClick={() => setMainTab("messages")}
            className={`flex flex-col items-center gap-0.5 px-3 ${
              mainTab === "messages" ? "text-neutral-900" : "text-neutral-500"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full border ${
                mainTab === "messages"
                  ? "bg-neutral-900 border-neutral-900"
                  : "border-neutral-400"
              }`}
            />
            <span>Mesajlar</span>
          </button>
          <button
            onClick={() => setMainTab("profile")}
            className={`flex flex-col items-center gap-0.5 px-3 ${
              mainTab === "profile" ? "text-neutral-900" : "text-neutral-500"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full border ${
                mainTab === "profile"
                  ? "bg-neutral-900 border-neutral-900"
                  : "border-neutral-400"
              }`}
            />
            <span>Profil</span>
          </button>
        </div>
      </nav>

      {/* ÜRÜN DETAY MODAL */}
      {detailProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="w-full max-w-3xl bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 relative max-h-[90vh] overflow-hidden">
            <button
              onClick={() => setDetailProduct(null)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 text-xl"
            >
              ×
            </button>

            {/* Foto */}
            <div className="sm:w-1/2 flex-shrink-0">
              <img
                src={detailProduct.photo}
                alt={detailProduct.title}
                className="w-full aspect-[3/4] object-cover rounded-2xl border border-neutral-200"
              />
            </div>

            {/* Info */}
            <div className="sm:w-1/2 flex flex-col gap-3 text-sm">
              <div className="mt-6 sm:mt-0">
                <h2 className="text-base font-semibold mb-1 line-clamp-2">
                  {detailProduct.title}
                </h2>
                <p className="text-lg font-bold text-neutral-900 mb-1">
                  {detailProduct.price} TL
                </p>
                <p className="text-[11px] text-neutral-500 mb-1">
                  {detailProduct.category}
                  {detailProduct.condition
                    ? ` • ${detailProduct.condition}`
                    : ""}{" "}
                  • {detailProduct.distanceKm.toFixed(1)} km yakınında
                </p>
                {detailProduct.createdAt && (
                  <p className="text-[11px] text-neutral-400">
                    İlan tarihi: {formatDate(detailProduct.createdAt)}
                  </p>
                )}
              </div>

              {detailProduct.ownerName && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[11px] font-medium">
                    {detailProduct.ownerName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">
                      {detailProduct.ownerName}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Satıcı
                    </span>
                  </div>
                </div>
              )}

              {detailProduct.description && (
                <div className="mt-2 text-[12px] text-neutral-700 whitespace-pre-wrap">
                  {detailProduct.description}
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-2 text-xs">
                <button
                  onClick={() => {
                    setDetailProduct(null);
                    openPanel(detailProduct, "message");
                  }}
                  className="w-full py-2 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
                >
                  Mesaj gönder
                </button>
                <button
                  onClick={() => {
                    setDetailProduct(null);
                    openPanel(detailProduct, "offer");
                  }}
                  className="w-full py-2 rounded-full bg-neutral-100 text-neutral-900 border border-neutral-300 hover:border-neutral-700"
                >
                  Teklif ver
                </button>
                {detailProduct.takas && (
                  <button
                    onClick={() => {
                      setDetailProduct(null);
                      openPanel(detailProduct, "takas");
                    }}
                    className="w-full py-2 rounded-full bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-700"
                  >
                    Takas teklif et
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ÜRÜN EKLE / DÜZENLE MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-5 relative">
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 text-xl"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-1">
              {editingProductId ? "İlanı düzenle" : "Yeni ilan ekle"}
            </h2>
            <p className="text-xs text-neutral-500 mb-4">
              {editingProductId
                ? "Fotoğraf, başlık, fiyat ve detayları güncelleyebilirsin."
                : "Fotoğraf yükle, fiyat ve detayları gir, ilanını yayınla."}
            </p>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-neutral-700">
                  Ürün fotoğrafı
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-xs text-neutral-700 file:text-xs file:px-3 file:py-2 file:rounded-full file:border-0 file:bg-black file:text-white file:font-medium file:cursor-pointer"
                />
                {form.photo && (
                  <div className="mt-2">
                    <p className="text-[11px] text-neutral-500 mb-1">
                      Ön izleme:
                    </p>
                    <img
                      src={form.photo}
                      alt="Ön izleme"
                      className="w-full aspect-square object-cover rounded-2xl border border-neutral-200"
                    />
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Başlık"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />

              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Fiyat (TL)"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  className="flex-1 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="flex-1 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="">Kategori seç</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={form.condition}
                onChange={(e) =>
                  setForm({ ...form, condition: e.target.value })
                }
                className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="">Durum seç</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <textarea
                rows={3}
                placeholder="Açıklama (beden, marka, durum, notlar...)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
              />

              <label className="flex items-center gap-2 text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.takas}
                  onChange={(e) =>
                    setForm({ ...form, takas: e.target.checked })
                  }
                  className="accent-black"
                />
                Bu ürün için takas tekliflerini kabul ediyorum
              </label>
            </div>

            <button
              onClick={handleAddOrUpdateProduct}
              className="mt-5 w-full py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition"
            >
              {editingProductId ? "Değişiklikleri kaydet" : "İlanı yayınla"}
            </button>
          </div>
        </div>
      )}

      {/* MESAJ / TEKLİF / TAKAS PANELİ */}
      {panelMode && activeProduct && (
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
                  <span className="font-semibold">
                    {activeProduct.price} TL
                  </span>
                </p>
              </div>
              <button
                onClick={closePanel}
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
                    <span className="text-[10px] text-neutral-500">
                      {m.author}
                    </span>
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
                        onChange={(e) =>
                          setSelectedTakasProductId(e.target.value)
                        }
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
                  onClick={sendInteraction}
                  className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800"
                >
                  Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-5 relative">
            <button
              onClick={closeAuth}
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
                onClick={() =>
                  setAuthMode((m) => (m === "login" ? "signup" : "login"))
                }
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
                    onChange={(e) =>
                      handleAuthChange("firstName", e.target.value)
                    }
                    className="flex-1 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <input
                    type="text"
                    placeholder="Soyad"
                    value={authForm.lastName}
                    onChange={(e) =>
                      handleAuthChange("lastName", e.target.value)
                    }
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
                onChange={(e) =>
                  handleAuthChange("password", e.target.value)
                }
                className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />

              {authMode === "signup" && (
                <input
                  type="password"
                  placeholder="Şifre (tekrar)"
                  value={authForm.confirmPassword}
                  onChange={(e) =>
                    handleAuthChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              )}

              {authError && (
                <p className="text-[11px] text-red-500">{authError}</p>
              )}
            </div>

            <button
              onClick={handleAuthSubmit}
              className="mt-4 w-full py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition"
            >
              {authMode === "login" ? "Giriş yap" : "Kayıt ol"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
