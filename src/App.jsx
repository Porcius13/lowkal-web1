import { useState, useMemo, useEffect } from "react";
import { STORAGE_KEYS, CATEGORIES } from "./constants";
import { formatDate, formatTime } from "./utils/helpers";
import BottomNav from "./components/BottomNav";
import NavBar from "./components/NavBar";
import ProductGrid from "./components/ProductGrid";
import FiltersBar from "./components/FiltersBar";
import ProductDetailModal from "./components/ProductDetailModal";
import ProductFormModal from "./components/ProductFormModal";
import AuthModal from "./components/AuthModal";
import MessagePanel from "./components/MessagePanel";

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
  const [mainTab, setMainTab] = useState("home"); // "home" | "search" | "messages" | "activity" | "profile" | "selling-hub" | "purchases" | "settings" | "resolution"
  const [searchText, setSearchText] = useState("");
  const [profileSortMode, setProfileSortMode] = useState("newest"); // Profil sayfası için ayrı sıralama
  const [profileCategoryFilter, setProfileCategoryFilter] = useState(""); // Profil sayfası için kategori filtresi
  const [profileTab, setProfileTab] = useState("selling"); // "selling" | "likes" | "saves"
  const [messagesTab, setMessagesTab] = useState("chat"); // "chat" | "offers"
  const [selectedConversation, setSelectedConversation] = useState(null); // Seçili konuşma
  const [filterUnread, setFilterUnread] = useState(false); // Okunmamış filtreleme

  const [detailProduct, setDetailProduct] = useState(null); // ürün detay modali
  const [formError, setFormError] = useState(""); // Form hata mesajı

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
      // Eğer localStorage'da ürün yoksa veya boş array ise başlangıç ürünlerini yükle
      if (Array.isArray(savedProducts) && savedProducts.length > 0) {
        setProducts(savedProducts);
      } else {
        // localStorage'ı temizle (eğer boş array varsa)
        localStorage.removeItem(STORAGE_KEYS.products);
        // Başlangıç ürünleri - göstermelik
        const initialProducts = [
          {
            id: 1,
            title: "Nike Air Max 90",
            price: 850,
            category: "Ayakkabı",
            photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
            takas: false,
            distanceKm: 2.5,
            ownerId: "demo_user_1",
            ownerName: "Ahmet Yılmaz",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Az kullanılmış, çok temiz Nike Air Max 90. Kutusu ile birlikte.",
            condition: "Az kullanılmış",
          },
          {
            id: 2,
            title: "Vintage Denim Ceket",
            price: 450,
            category: "Kıyafet",
            photo: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
            takas: true,
            distanceKm: 1.8,
            ownerId: "demo_user_2",
            ownerName: "Zeynep Kaya",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Vintage tarzı denim ceket, M beden. Takas kabul edilir.",
            condition: "İyi",
          },
          {
            id: 3,
            title: "MacBook Pro 13\" 2020",
            price: 12000,
            category: "Elektronik",
            photo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
            takas: false,
            distanceKm: 3.2,
            ownerId: "demo_user_3",
            ownerName: "Mehmet Demir",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            description: "MacBook Pro 13 inç, 256GB SSD, 8GB RAM. Çok iyi durumda.",
            condition: "Az kullanılmış",
          },
          {
            id: 4,
            title: "Harry Potter Serisi (7 Kitap)",
            price: 280,
            category: "Kitap",
            photo: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
            takas: true,
            distanceKm: 0.5,
            ownerId: "demo_user_4",
            ownerName: "Ayşe Şahin",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Harry Potter serisinin tamamı, çok iyi durumda. Takas kabul edilir.",
            condition: "İyi",
          },
          {
            id: 5,
            title: "Vintage Kol Saati",
            price: 1200,
            category: "Aksesuar",
            photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
            takas: false,
            distanceKm: 4.1,
            ownerId: "demo_user_5",
            ownerName: "Can Özkan",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Vintage tarzı kol saati, çalışır durumda. Kutusu ile birlikte.",
            condition: "Az kullanılmış",
          },
          {
            id: 6,
            title: "Adidas Ultraboost 22",
            price: 950,
            category: "Ayakkabı",
            photo: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
            takas: false,
            distanceKm: 2.3,
            ownerId: "demo_user_6",
            ownerName: "Elif Yıldız",
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Adidas Ultraboost 22, 42 numara. Çok az kullanılmış.",
            condition: "Az kullanılmış",
          },
          {
            id: 7,
            title: "Vintage Klasik Gitar",
            price: 1800,
            category: "Diğer",
            photo: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            takas: true,
            distanceKm: 1.5,
            ownerId: "demo_user_7",
            ownerName: "Burak Arslan",
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Vintage klasik gitar, çok iyi durumda. Takas kabul edilir.",
            condition: "İyi",
          },
          {
            id: 8,
            title: "IKEA Çalışma Masası",
            price: 650,
            category: "Ev",
            photo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
            takas: false,
            distanceKm: 5.2,
            ownerId: "demo_user_8",
            ownerName: "Selin Aydın",
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            description: "IKEA çalışma masası, beyaz renk. Montajlı ve kullanıma hazır.",
            condition: "Az kullanılmış",
          },
          {
            id: 9,
            title: "Levi's 501 Vintage",
            price: 380,
            category: "Kıyafet",
            photo: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
            takas: true,
            distanceKm: 1.2,
            ownerId: "demo_user_9",
            ownerName: "Emre Çelik",
            createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Levi's 501 vintage kot pantolon, 32 beden. Takas kabul edilir.",
            condition: "İyi",
          },
          {
            id: 10,
            title: "iPhone 12 Pro",
            price: 8500,
            category: "Elektronik",
            photo: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
            takas: false,
            distanceKm: 2.8,
            ownerId: "demo_user_10",
            ownerName: "Deniz Kaya",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            description: "iPhone 12 Pro, 128GB, Graphite. Kutusu ve şarj aleti ile birlikte.",
            condition: "Az kullanılmış",
          },
          {
            id: 11,
            title: "Vintage Deri Çanta",
            price: 520,
            category: "Aksesuar",
            photo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
            takas: true,
            distanceKm: 3.5,
            ownerId: "demo_user_11",
            ownerName: "Gizem Yücel",
            createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Vintage deri çanta, çok şık. Takas kabul edilir.",
            condition: "İyi",
          },
          {
            id: 12,
            title: "Zara Oversized Gömlek",
            price: 180,
            category: "Kıyafet",
            photo: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
            takas: false,
            distanceKm: 0.8,
            ownerId: "demo_user_12",
            ownerName: "Kerem Doğan",
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Zara oversized gömlek, M beden. Yeni gibi.",
            condition: "Az kullanılmış",
          },
        ];
        setProducts(initialProducts);
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(initialProducts));
      }

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
        const validTabs = ["home", "search", "messages", "activity", "profile", "selling-hub", "purchases", "settings", "resolution"];
        if (validTabs.includes(savedUi.mainTab))
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

  // Tab değiştiğinde sayfanın en üstüne scroll et
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mainTab]);

  // -------------------- MEMO DATA --------------------
  const myProducts = useMemo(() => {
    if (!currentUser) return [];
    let filtered = products.filter((p) => p.ownerId === currentUser.id);
    
    // Kategori filtresi
    if (profileCategoryFilter) {
      filtered = filtered.filter((p) => p.category === profileCategoryFilter);
    }
    
    // Sıralama
    const sorted = [...filtered].sort((a, b) => {
      if (profileSortMode === "newest") {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      }
      if (profileSortMode === "oldest") {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tA - tB;
      }
      if (profileSortMode === "priceLow") {
        return (a.price || 0) - (b.price || 0);
      }
      if (profileSortMode === "priceHigh") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });
    
    return sorted;
  }, [products, currentUser, profileCategoryFilter, profileSortMode]);

  const favoriteProducts = useMemo(() => {
    if (!currentUser) return [];
    const likedIds = currentUser.likedProductIds || [];
    let filtered = products.filter((p) => likedIds.includes(p.id));
    
    // Sıralama (favoriler için de aynı sıralama kullanılabilir)
    const sorted = [...filtered].sort((a, b) => {
      if (profileSortMode === "newest") {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      }
      if (profileSortMode === "oldest") {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tA - tB;
      }
      if (profileSortMode === "priceLow") {
        return (a.price || 0) - (b.price || 0);
      }
      if (profileSortMode === "priceHigh") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });
    
    return sorted;
  }, [products, currentUser, profileSortMode]);

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
    setFormError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      setFormError("Lütfen geçerli bir resim dosyası seçin");
      return;
    }
    
    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Resim boyutu 5MB'dan küçük olmalıdır");
      return;
    }
    
    const reader = new FileReader();
    reader.onerror = () => {
      setFormError("Resim yüklenirken bir hata oluştu");
    };
    reader.onloadend = () => {
      if (reader.result) {
        setForm((prev) => ({ ...prev, photo: reader.result }));
        setFormError(""); // Başarılı yükleme sonrası hatayı temizle
      }
    };
    reader.readAsDataURL(file);
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
    setFormError(""); // Hata mesajını temizle
    
    if (!currentUser) {
      requireAuth("signup");
      return;
    }

    // Validation
    if (!form.photo) {
      setFormError("Lütfen bir ürün fotoğrafı yükleyin");
      return;
    }
    if (!form.title || form.title.trim() === "") {
      setFormError("Lütfen ürün başlığı girin");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setFormError("Lütfen geçerli bir fiyat girin");
      return;
    }
    if (!form.category) {
      setFormError("Lütfen bir kategori seçin");
      return;
    }
    if (!form.condition) {
      setFormError("Lütfen ürün durumunu seçin");
      return;
    }

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
    setSelectedConversation(product);
    setActiveProduct(product);
    setPanelMode("message");
    setInputText("");
  };

  // -------------------- UI --------------------
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      {/* TOP NAV */}
      <NavBar
        currentUser={currentUser}
        searchText={searchText}
        setSearchText={setSearchText}
        setMainTab={setMainTab}
        openAuth={openAuth}
        handleLogout={handleLogout}
        handleResetAll={handleResetAll}
        requireAuth={requireAuth}
        resetForm={resetForm}
        setShowForm={setShowForm}
        conversations={conversations}
        favoriteProducts={favoriteProducts}
      />

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col px-3 sm:px-4 lg:px-6 py-6 gap-6 pb-24">
        {/* HOME TAB */}
        {mainTab === "home" && (
          <>
            {/* Filters */}
            <FiltersBar
              radius={radius}
              setRadius={setRadius}
              filterTakasOnly={filterTakasOnly}
              setFilterTakasOnly={setFilterTakasOnly}
              sortMode={sortMode}
              setSortMode={setSortMode}
              searchText={searchText}
              setSearchText={setSearchText}
              requireAuth={requireAuth}
              resetForm={resetForm}
              setShowForm={setShowForm}
            />

            {/* Product grid */}
            <main className="w-full flex-1">
              <ProductGrid
                products={filteredProducts}
                currentUser={currentUser}
                isProductLiked={isProductLiked}
                toggleFavorite={toggleFavorite}
                setDetailProduct={setDetailProduct}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
                openPanel={openPanel}
              />
            </main>
          </>
        )}

        {/* SEARCH TAB */}
        {mainTab === "search" && (
          <main className="w-full flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-black mb-2">🔍 Ara</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün, kategori veya açıklama ara..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full text-sm px-4 py-3 pl-12 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-electric focus:border-electric transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
                  🔍
                </span>
              </div>
            </div>

            {/* Kategoriler */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-black mb-3">Kategoriler</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSearchText(cat);
                      setMainTab("home");
                    }}
                    className="px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-neutral-200 text-sm font-medium text-black hover:border-electric hover:bg-electric/5 transition text-center"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtreler */}
            <div className="mb-6">
              <FiltersBar
                radius={radius}
                setRadius={setRadius}
                filterTakasOnly={filterTakasOnly}
                setFilterTakasOnly={setFilterTakasOnly}
                sortMode={sortMode}
                setSortMode={setSortMode}
                searchText={searchText}
                setSearchText={setSearchText}
                requireAuth={requireAuth}
                resetForm={resetForm}
                setShowForm={setShowForm}
              />
            </div>

            {/* Sonuçlar */}
            <div>
              <h3 className="text-sm font-semibold text-black mb-3">
                Sonuçlar ({filteredProducts.length})
              </h3>
              <ProductGrid
                products={filteredProducts}
                currentUser={currentUser}
                isProductLiked={isProductLiked}
                toggleFavorite={toggleFavorite}
                setDetailProduct={setDetailProduct}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
                openPanel={openPanel}
              />
            </div>
          </main>
        )}

        {/* MESSAGES TAB */}
        {mainTab === "messages" && (
          <main className="w-full flex-1 bg-white flex flex-col h-full">
            {!currentUser ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-4">
                    Mesajlarını görmek için giriş yapmalısın.
                  </p>
                  <button
                    onClick={() => openAuth("login")}
                    className="px-6 py-2.5 rounded-full bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition shadow-sm"
                  >
                    Giriş yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200">
                  <h1 className="text-xl font-bold text-black">Messages</h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Refresh conversations
                        setSelectedConversation(null);
                      }}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition"
                      title="Refresh"
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setFilterUnread(!filterUnread)}
                      className={`p-2 hover:bg-neutral-100 rounded-lg transition ${
                        filterUnread ? "bg-neutral-100" : ""
                      }`}
                      title="Filter by unread"
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
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Left Sidebar - Conversation List */}
                  <div className="w-full sm:w-80 border-r border-neutral-200 flex flex-col">
                    {/* Tabs */}
                    <div className="flex items-center border-b border-neutral-200">
                      <button
                        onClick={() => {
                          setMessagesTab("chat");
                          setSelectedConversation(null);
                        }}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition relative ${
                          messagesTab === "chat"
                            ? "text-black"
                            : "text-neutral-500 hover:text-black"
                        }`}
                      >
                        Chat
                        {messagesTab === "chat" && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setMessagesTab("offers");
                          setSelectedConversation(null);
                        }}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition relative ${
                          messagesTab === "offers"
                            ? "text-black"
                            : "text-neutral-500 hover:text-black"
                        }`}
                      >
                        Offers
                        {messagesTab === "offers" && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
                        )}
                      </button>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <div className="p-4 text-center text-sm text-neutral-500">
                          <p>Henüz hiç mesajın yok.</p>
                        </div>
                      ) : (
                        <div>
                          {conversations
                            .filter((conv) => {
                              if (messagesTab === "offers") {
                                return (
                                  conv.lastMessage.type === "offer" ||
                                  conv.lastMessage.type === "takas"
                                );
                              }
                              return conv.lastMessage.type === "message";
                            })
                            .map(({ product, lastMessage }) => {
                              const isSelected =
                                selectedConversation?.id === product.id;
                              const ownerName = product.ownerName || "Unknown";
                              const ownerInitials =
                                ownerName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2) || "U";

                              return (
                                <button
                                  key={product.id}
                                  onClick={() => {
                                    setSelectedConversation(product);
                                    setActiveProduct(product);
                                    setPanelMode("message");
                                    setInputText("");
                                  }}
                                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition text-left border-b border-neutral-100 ${
                                    isSelected ? "bg-neutral-50" : ""
                                  }`}
                                >
                                  {/* Avatar */}
                                  <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">
                                        {ownerInitials}
                                      </span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <span className="text-sm font-bold text-black truncate">
                                        {ownerName}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Menu action
                                        }}
                                        className="text-neutral-400 hover:text-black p-1"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                        </svg>
                                      </button>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-1">
                                      @{ownerName.toLowerCase().replace(/\s+/g, "")}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs text-neutral-500 truncate">
                                        {formatDate(lastMessage.createdAt)} •{" "}
                                        {lastMessage.text.length > 30
                                          ? lastMessage.text.substring(0, 30) +
                                            "..."
                                          : lastMessage.text}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Content - Message Display */}
                  <div className="flex-1 flex items-center justify-center bg-white">
                    {selectedConversation ? (
                      <div className="w-full h-full flex flex-col">
                        {/* Message Header */}
                        <div className="border-b border-neutral-200 p-4">
                          <h2 className="text-lg font-bold text-black">
                            {selectedConversation.title}
                          </h2>
                          <p className="text-sm text-neutral-500">
                            {selectedConversation.ownerName}
                          </p>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {activeMessages.length === 0 ? (
                            <div className="text-center text-neutral-500 py-8">
                              <p className="text-sm">No messages yet</p>
                              <p className="text-xs mt-1">
                                Start the conversation
                              </p>
                            </div>
                          ) : (
                            activeMessages.map((m) => (
                              <div
                                key={m.id}
                                className={`flex ${
                                  m.author ===
                                  `${currentUser.firstName} ${currentUser.lastName}`
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    m.author ===
                                    `${currentUser.firstName} ${currentUser.lastName}`
                                      ? "bg-electric text-white"
                                      : "bg-neutral-100 text-black"
                                  }`}
                                >
                                  <p className="text-sm">{m.text}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      m.author ===
                                      `${currentUser.firstName} ${currentUser.lastName}`
                                        ? "text-white/70"
                                        : "text-neutral-500"
                                    }`}
                                  >
                                    {formatTime(m.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-neutral-200 p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Type a message..."
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  sendInteraction();
                                }
                              }}
                              className="flex-1 px-4 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                            />
                            <button
                              onClick={() => {
                                if (selectedConversation) {
                                  setActiveProduct(selectedConversation);
                                  setPanelMode("message");
                                  sendInteraction();
                                }
                              }}
                              className="px-6 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="w-24 h-24 text-neutral-300 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <h2 className="text-xl font-bold text-black mb-2">
                          Your Messages
                        </h2>
                        <p className="text-sm text-neutral-500">
                          Send private messages to other Lowkal users
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* ACTIVITY TAB */}
        {mainTab === "activity" && (
          <main className="w-full flex-1">
            <h2 className="text-xl font-bold text-black mb-4">⚡ Etkinlikler</h2>
            {!currentUser ? (
              <div className="mt-16 text-center">
                <div className="w-20 h-20 rounded-full bg-electric/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">⚡</span>
                </div>
                <p className="text-base font-semibold text-black mb-2">
                  Etkinliklerini görmek için giriş yap
                </p>
                <p className="text-sm text-neutral-600 mb-4">
                  Beğeniler, mesajlar ve diğer etkileşimler burada görünecek.
                </p>
                <button
                  onClick={() => openAuth("login")}
                  className="px-6 py-2.5 rounded-full bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition shadow-sm"
                >
                  Giriş yap
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* İstatistikler */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-electric mb-1">
                      {favoriteProducts.length}
                    </p>
                    <p className="text-xs text-neutral-600">Favoriler</p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-royal mb-1">
                      {conversations.length}
                    </p>
                    <p className="text-xs text-neutral-600">Mesajlar</p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gold mb-1">
                      {myProducts.length}
                    </p>
                    <p className="text-xs text-neutral-600">İlanlarım</p>
                  </div>
                </div>

                {/* Son Etkinlikler */}
                <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-black mb-3">Son Etkinlikler</h3>
                  {messages.length === 0 && favoriteProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-neutral-500 mb-2">
                        Henüz etkinlik yok
                      </p>
                      <p className="text-xs text-neutral-400">
                        Ürün beğenerek veya mesaj göndererek başlayabilirsin.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Son mesajlar */}
                      {conversations.slice(0, 5).map(({ product, lastMessage }) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition cursor-pointer"
                          onClick={() => openConversationFromMessages(product)}
                        >
                          <img
                            src={product.photo}
                            alt={product.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-black truncate">
                              {product.title}
                            </p>
                            <p className="text-[10px] text-neutral-500 truncate">
                              {lastMessage.text}
                            </p>
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {formatTime(lastMessage.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popüler Kategoriler */}
                <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-black mb-3">Popüler Kategoriler</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.slice(0, 6).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSearchText(cat);
                          setMainTab("search");
                        }}
                        className="px-3 py-1.5 rounded-full bg-neutral-100 text-black text-xs font-medium hover:bg-electric hover:text-white transition"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* PROFILE TAB */}
        {mainTab === "profile" && (
          <main className="w-full flex-1 bg-white">
            {!currentUser ? (
              <div className="mt-16 text-center">
                <div className="w-24 h-24 rounded-full bg-neutral-200 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-5xl">👤</span>
                </div>
                <h2 className="text-xl font-bold text-black mb-2">Profiline Hoş Geldin</h2>
                <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
                  Profilini görmek ve ilan vermek için giriş yap veya kayıt ol.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => openAuth("login")}
                    className="px-6 py-2.5 rounded-full border-2 border-neutral-300 text-sm font-medium text-black hover:border-electric hover:text-electric transition"
                  >
                    Giriş yap
                  </button>
                  <button
                    onClick={() => openAuth("signup")}
                    className="px-6 py-2.5 rounded-full bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition shadow-sm"
                  >
                    Kayıt ol
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto">
                {/* Profile Header - Depop Style */}
                <section className="px-4 pt-6 pb-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl font-bold">
                        {currentUser.firstName?.[0]?.toUpperCase()}
                        {currentUser.lastName?.[0]?.toUpperCase()}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      {/* Username */}
                      <h1 className="text-xl font-bold text-black mb-1">
                        {currentUser.firstName?.toLowerCase()}{currentUser.lastName?.toLowerCase()}
                      </h1>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-4 h-4 text-neutral-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-neutral-500 ml-1">(0)</span>
                      </div>

                      {/* Active Status */}
                      <p className="text-sm text-neutral-500 mb-2">Active today</p>

                      {/* Followers/Following */}
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-base font-bold text-black">0 Followers</span>
                        <span className="text-base font-bold text-black">0 Following</span>
                      </div>

                      {/* Shop Name */}
                      <p className="text-base font-bold text-black">
                        {currentUser.firstName} {currentUser.lastName}'s shop
                      </p>
                    </div>
                  </div>
                </section>

                {/* Navigation Tabs */}
                <section className="border-b border-neutral-200">
                  <div className="flex items-center gap-6 px-4">
                    <button
                      onClick={() => setProfileTab("selling")}
                      className={`pb-3 px-1 text-sm font-medium transition relative ${
                        profileTab === "selling"
                          ? "text-black"
                          : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      Selling
                      {profileTab === "selling" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
                      )}
                    </button>
                    <button
                      onClick={() => setProfileTab("likes")}
                      className={`pb-3 px-1 text-sm font-medium transition relative ${
                        profileTab === "likes"
                          ? "text-black"
                          : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      Likes
                      {profileTab === "likes" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
                      )}
                    </button>
                    <button
                      onClick={() => setProfileTab("saves")}
                      className={`pb-3 px-1 text-sm font-medium transition relative ${
                        profileTab === "saves"
                          ? "text-black"
                          : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      Saves
                      {profileTab === "saves" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
                      )}
                    </button>
                  </div>
                </section>

                {/* Content Area */}
                <section className="px-4 py-8">
                  {profileTab === "selling" && (
                    <>
                      {myProducts.length === 0 ? (
                        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center max-w-md mx-auto">
                          {/* T-shirt icon with plus */}
                          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center relative">
                            <svg
                              className="w-16 h-16 text-neutral-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+</span>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-500 mb-6">
                            Start selling today and turn your clothes into cash
                          </p>
                          <button
                            onClick={() => {
                              resetForm();
                              if (!requireAuth("login")) setShowForm(true);
                            }}
                            className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition"
                          >
                            List an item
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                          {myProducts.map((p) => {
                            const isMine = currentUser && p.ownerId && p.ownerId === currentUser.id;
                            const liked = isProductLiked(p.id);
                            return (
                              <ProductCard
                                key={p.id}
                                product={p}
                                currentUser={currentUser}
                                isLiked={liked}
                                isMine={isMine}
                                onFavoriteToggle={() => toggleFavorite(p.id)}
                                onDetailClick={() => setDetailProduct(p)}
                                onEditClick={() => handleEditProduct(p)}
                                onDeleteClick={() => handleDeleteProduct(p.id)}
                                onMessageClick={() => openPanel(p, "message")}
                                onOfferClick={() => openPanel(p, "offer")}
                                onTakasClick={() => openPanel(p, "takas")}
                              />
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {profileTab === "likes" && (
                    <>
                      {favoriteProducts.length === 0 ? (
                        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center max-w-md mx-auto">
                          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <svg
                              className="w-16 h-16 text-neutral-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-neutral-500 mb-6">
                            Beğendiğin ürünler burada görünecek
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                          {favoriteProducts.map((p) => {
                            const isMine = currentUser && p.ownerId && p.ownerId === currentUser.id;
                            const liked = isProductLiked(p.id);
                            return (
                              <ProductCard
                                key={p.id}
                                product={p}
                                currentUser={currentUser}
                                isLiked={liked}
                                isMine={isMine}
                                onFavoriteToggle={() => toggleFavorite(p.id)}
                                onDetailClick={() => setDetailProduct(p)}
                                onEditClick={() => handleEditProduct(p)}
                                onDeleteClick={() => handleDeleteProduct(p.id)}
                                onMessageClick={() => openPanel(p, "message")}
                                onOfferClick={() => openPanel(p, "offer")}
                                onTakasClick={() => openPanel(p, "takas")}
                              />
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {profileTab === "saves" && (
                    <>
                      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-neutral-500 mb-6">
                          Kaydettiğin ürünler burada görünecek
                        </p>
                      </div>
                    </>
                  )}
                </section>
              </div>
            )}
          </main>
        )}

        {/* SELLING HUB TAB */}
        {mainTab === "selling-hub" && (
          <main className="w-full flex-1 bg-white">
            {!currentUser ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-4">
                    Satış merkezini görmek için giriş yapmalısın.
                  </p>
                  <button
                    onClick={() => openAuth("login")}
                    className="px-6 py-2.5 rounded-full bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition shadow-sm"
                  >
                    Giriş yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-black mb-6">Your Selling Hub</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 mb-1">Active Listings</p>
                    <p className="text-3xl font-bold text-black">{myProducts.length}</p>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 mb-1">Total Sales</p>
                    <p className="text-3xl font-bold text-black">0</p>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 mb-1">Earnings</p>
                    <p className="text-3xl font-bold text-black">0 TL</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-black mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        resetForm();
                        if (!requireAuth("login")) setShowForm(true);
                      }}
                      className="bg-black text-white px-6 py-4 rounded-lg text-left hover:bg-neutral-800 transition"
                    >
                      <p className="font-semibold mb-1">List a new item</p>
                      <p className="text-sm text-neutral-300">Add a product to your shop</p>
                    </button>
                    <button
                      onClick={() => setMainTab("messages")}
                      className="bg-neutral-100 text-black px-6 py-4 rounded-lg text-left hover:bg-neutral-200 transition border border-neutral-200"
                    >
                      <p className="font-semibold mb-1">View messages</p>
                      <p className="text-sm text-neutral-600">Check your conversations</p>
                    </button>
                  </div>
                </div>

                {/* Recent Listings */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-black">Your Listings</h2>
                    <button
                      onClick={() => setMainTab("profile")}
                      className="text-sm text-neutral-600 hover:text-black transition"
                    >
                      View all →
                    </button>
                  </div>
                  {myProducts.length === 0 ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-12 text-center">
                      <p className="text-sm text-neutral-500 mb-4">
                        You haven't listed any items yet
                      </p>
                      <button
                        onClick={() => {
                          resetForm();
                          if (!requireAuth("login")) setShowForm(true);
                        }}
                        className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition"
                      >
                        List your first item
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {myProducts.slice(0, 8).map((p) => {
                        const isMine = currentUser && p.ownerId && p.ownerId === currentUser.id;
                        const liked = isProductLiked(p.id);
                        return (
                          <ProductCard
                            key={p.id}
                            product={p}
                            currentUser={currentUser}
                            isLiked={liked}
                            isMine={isMine}
                            onFavoriteToggle={() => toggleFavorite(p.id)}
                            onDetailClick={() => setDetailProduct(p)}
                            onEditClick={() => handleEditProduct(p)}
                            onDeleteClick={() => handleDeleteProduct(p.id)}
                            onMessageClick={() => openPanel(p, "message")}
                            onOfferClick={() => openPanel(p, "offer")}
                            onTakasClick={() => openPanel(p, "takas")}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        )}

        {/* PURCHASES TAB */}
        {mainTab === "purchases" && (
          <main className="w-full flex-1 bg-white">
            {!currentUser ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-4">
                    Satın alımlarını görmek için giriş yapmalısın.
                  </p>
                  <button
                    onClick={() => openAuth("login")}
                    className="px-6 py-2.5 rounded-full bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition shadow-sm"
                  >
                    Giriş yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-black mb-6">Purchases</h1>

                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-neutral-200 mb-6">
                  <button className="pb-3 px-1 text-sm font-medium text-black border-b-2 border-black">
                    All
                  </button>
                  <button className="pb-3 px-1 text-sm font-medium text-neutral-500 hover:text-black transition">
                    Completed
                  </button>
                  <button className="pb-3 px-1 text-sm font-medium text-neutral-500 hover:text-black transition">
                    Cancelled
                  </button>
                </div>

                {/* Purchases List */}
                <div className="space-y-4">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-12 text-center">
                    <svg
                      className="w-16 h-16 text-neutral-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <p className="text-base font-semibold text-black mb-2">
                      No purchases yet
                    </p>
                    <p className="text-sm text-neutral-500">
                      Items you buy will appear here
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* SETTINGS TAB */}
        {mainTab === "settings" && (
          <main className="w-full flex-1 bg-white">
            {!currentUser ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-4">
                    Ayarları görmek için giriş yapmalısın.
                  </p>
                  <button
                    onClick={() => openAuth("login")}
                    className="px-6 py-2.5 rounded-full bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition shadow-sm"
                  >
                    Giriş yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-black mb-6">Settings</h1>

                <div className="space-y-6">
                  {/* Account Settings */}
                  <section className="bg-white border border-neutral-200 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-black mb-4">Account</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-black block mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={currentUser.firstName || ""}
                          readOnly
                          className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-black block mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={currentUser.lastName || ""}
                          readOnly
                          className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-black block mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={currentUser.email || ""}
                          readOnly
                          className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-sm"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Notification Settings */}
                  <section className="bg-white border border-neutral-200 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-black mb-4">Notifications</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-black">Email notifications</p>
                          <p className="text-xs text-neutral-500">Receive updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-black">Push notifications</p>
                          <p className="text-xs text-neutral-500">Receive push notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                    </div>
                  </section>

                  {/* Privacy Settings */}
                  <section className="bg-white border border-neutral-200 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-black mb-4">Privacy</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-black">Show profile to everyone</p>
                          <p className="text-xs text-neutral-500">Make your profile public</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                    </div>
                  </section>

                  {/* Danger Zone */}
                  <section className="bg-white border border-red-200 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h2>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                    >
                      Log out
                    </button>
                  </section>
                </div>
              </div>
            )}
          </main>
        )}

        {/* RESOLUTION CENTER TAB */}
        {mainTab === "resolution" && (
          <main className="w-full flex-1 bg-white">
            {!currentUser ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-4">
                    Çözüm merkezini görmek için giriş yapmalısın.
                  </p>
                  <button
                    onClick={() => openAuth("login")}
                    className="px-6 py-2.5 rounded-full bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition shadow-sm"
                  >
                    Giriş yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-black mb-6">Resolution Center</h1>

                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-neutral-200 mb-6">
                  <button className="pb-3 px-1 text-sm font-medium text-black border-b-2 border-black">
                    All Cases
                  </button>
                  <button className="pb-3 px-1 text-sm font-medium text-neutral-500 hover:text-black transition">
                    Open
                  </button>
                  <button className="pb-3 px-1 text-sm font-medium text-neutral-500 hover:text-black transition">
                    Closed
                  </button>
                </div>

                {/* Cases List */}
                <div className="space-y-4">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-12 text-center">
                    <svg
                      className="w-16 h-16 text-neutral-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-base font-semibold text-black mb-2">
                      No cases yet
                    </p>
                    <p className="text-sm text-neutral-500">
                      Disputes and issues will appear here
                    </p>
                  </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-black mb-4">Need Help?</h2>
                  <p className="text-sm text-neutral-600 mb-4">
                    If you have an issue with a purchase or sale, you can open a case here.
                  </p>
                  <button className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition">
                    Open a Case
                  </button>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* ALT NAV (BOTTOM BAR) */}
      <BottomNav 
        mainTab={mainTab} 
        setMainTab={setMainTab}
        currentUser={currentUser}
        requireAuth={requireAuth}
        resetForm={resetForm}
        setShowForm={setShowForm}
      />

      {/* ÜRÜN DETAY MODAL */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onMessageClick={() => {
            setDetailProduct(null);
            openPanel(detailProduct, "message");
          }}
          onOfferClick={() => {
            setDetailProduct(null);
            openPanel(detailProduct, "offer");
          }}
          onTakasClick={() => {
            setDetailProduct(null);
            openPanel(detailProduct, "takas");
          }}
        />
      )}

      {/* ÜRÜN EKLE / DÜZENLE MODAL */}
      <ProductFormModal
        show={showForm}
        form={form}
        setForm={setForm}
        editingProductId={editingProductId}
        formError={formError}
        onClose={() => {
          setShowForm(false);
          resetForm();
          setFormError("");
        }}
        onSubmit={handleAddOrUpdateProduct}
        onPhotoChange={handlePhotoChange}
      />

      {/* MESAJ / TEKLİF / TAKAS PANELİ */}
      <MessagePanel
        show={!!(panelMode && activeProduct)}
        panelMode={panelMode}
        activeProduct={activeProduct}
        activeMessages={activeMessages}
        inputText={inputText}
        setInputText={setInputText}
        offerPrice={offerPrice}
        setOfferPrice={setOfferPrice}
        selectedTakasProductId={selectedTakasProductId}
        setSelectedTakasProductId={setSelectedTakasProductId}
        myProducts={myProducts}
        onClose={closePanel}
        onSend={sendInteraction}
      />

      {/* AUTH MODAL */}
      <AuthModal
        show={showAuthModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        handleAuthChange={handleAuthChange}
        authError={authError}
        onClose={closeAuth}
        onSubmit={handleAuthSubmit}
      />
    </div>
  );
}
