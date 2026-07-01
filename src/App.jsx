import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./Home";
import Wishlist from "./Wishlist";
import Cart from "./Cart";
import ProductDetail from "./ProductDetail";
import Orders from "./Orders";
import { products as mockProducts, categories as mockCategories } from "./data";
import api from "./api";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Barchasi"]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize states from localStorage to prevent loss on refresh
  const [likedProducts, setLikedProducts] = useState(() => {
    const saved = localStorage.getItem("likedProducts");
    return saved ? new Set(JSON.parse(saved).map(Number)) : new Set();
  });
  
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved).map(item => ({ ...item, id: Number(item.id) })) : [];
  });

  // Backend ma'lumotlarini yuklash
  useEffect(() => {
    async function loadData() {
      const startTime = Date.now();

      // 1. Userni tekshirish yoki yaratish
      let localUserId = localStorage.getItem('userId');
      if (!localUserId) {
        try {
          const res = await api.post('/api/user', {
            firstName: 'Mehmon',
            lastName: 'Mehmon',
            phone: '+998000000000'
          });
          localUserId = res.data.id;
          localStorage.setItem('userId', localUserId);
        } catch (err) {
          console.error('User yaratishda xatolik:', err);
        }
      }
      setUserId(localUserId ? Number(localUserId) : null);

      // 2. Mahsulotlarni olish
      try {
        const res = await api.get('/api/product');
        const dbProducts = res.data;
        if (dbProducts) {
          const formatted = dbProducts.map(p => {
            // Rasmlarni xavfsiz parse qilish
            let imageArray = [];
            try {
              if (typeof p.images === 'string') {
                imageArray = JSON.parse(p.images);
              } else if (Array.isArray(p.images)) {
                imageArray = p.images;
              }
            } catch (e) {
              console.error("Images parse qilishda xatolik:", e);
            }

            const firstImage = imageArray.length > 0 ? imageArray[0] : '';
            const imageUrl = firstImage 
              ? (firstImage.startsWith('http') || firstImage.startsWith('data:image') ? firstImage : `${api.defaults.baseURL}${firstImage}`) 
              : '/product1.png';

            const priceStr = String(p.price || '0');
            const priceValue = parseFloat(priceStr.replace(/\s/g, '').replace('UZS', '')) || 0;
            const formattedPrice = priceStr.includes('UZS') ? priceStr : `${Number(priceValue || priceStr).toLocaleString('ru-RU')} UZS`;

            return {
              ...p,
              id: Number(p.id),
              name: p.name || 'Soat',
              price: formattedPrice,
              priceValue: priceValue,
              image: imageUrl,
              description: p.description || p.name || 'Premium Soat',
              fullDescription: p.fullDescription || p.description || 'Premium klass soat.',
              category: p.category || 'Barchasi'
            };
          });

          setProducts(formatted);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Mahsulotlarni yuklashda xatolik:', err);
        setProducts([]);
      }

      // 3. Kategoriyalarni olish
      try {
        const res = await api.get('/api/category');
        const dbCategories = res.data;
        if (dbCategories) {
          const dbCats = dbCategories.map(c => c.name);
          setCategories(["Barchasi", ...dbCats]);
        } else {
          setCategories(["Barchasi"]);
        }
      } catch (err) {
        console.error('Kategoriyalarni yuklashda xatolik:', err);
        setCategories(["Barchasi"]);
      }

      // Silliq vizual preloader yuklanishi uchun kamida 1.5 soniya kutish
      const elapsed = Date.now() - startTime;
      const minDelay = 1500;
      const delay = Math.max(0, minDelay - elapsed);
      setTimeout(() => {
        setLoading(false);
      }, delay);
    }
    loadData();
  }, []);

  // Save states to localStorage when they change
  useEffect(() => {
    localStorage.setItem("likedProducts", JSON.stringify(Array.from(likedProducts)));
  }, [likedProducts]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const toggleLike = (id) => {
    const targetId = Number(id);
    setLikedProducts(prev => {
      const newLikes = new Set(prev);
      const isLiked = !newLikes.has(targetId);
      if (newLikes.has(targetId)) {
        newLikes.delete(targetId);
      } else {
        newLikes.add(targetId);
      }
      
      // DB bilan sinxronizatsiya
      if (userId) {
        if (isLiked) {
          api.post('/api/likeshistory', {
            userId,
            productId: targetId,
            productid: String(targetId),
            likedAt: new Date().toISOString()
          }).catch(err => console.error('Like qo\'shishda xatolik:', err));
        } else {
          api.get(`/api/likeshistory?userId=${userId}`).then(res => {
            const found = res.data.find(l => Number(l.productId) === targetId);
            if (found) {
              api.delete(`/api/likeshistory/${found.id}`).catch(err => console.error('Like o\'chirishda xatolik:', err));
            }
          }).catch(err => console.error('Likes ro\'yxatini olishda xatolik:', err));
        }
      }
      return newLikes;
    });
  };

  const addToCart = (id) => {
    const targetId = Number(id);
    setCart(prev => {
      const existing = prev.find(item => item.id === targetId);
      if (existing) {
        return prev; 
      }
      if (userId) {
        api.post('/api/carthistory', {
          userId,
          productId: targetId,
          ProductId: String(targetId),
          quantity: 1,
          history: 'Added'
        }).catch(err => console.error('Savatga qo\'shishda xatolik:', err));
      }
      return [...prev, { id: targetId, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    const targetId = Number(id);
    setCart(prev => {
      if (userId) {
        api.get(`/api/carthistory?userId=${userId}`).then(res => {
          const found = res.data.find(c => Number(c.productId) === targetId);
          if (found) {
            api.delete(`/api/carthistory/${found.id}`).catch(err => console.error('Savatdan o\'chirishda xatolik:', err));
          }
        }).catch(err => console.error('Savat ro\'yxatini olishda xatolik:', err));
      }
      return prev.filter(item => item.id !== targetId);
    });
  };

  const updateQuantity = (id, newQuantity) => {
    const targetId = Number(id);
    if (newQuantity < 1) return;
    setCart(prev => {
      if (userId) {
        api.get(`/api/carthistory?userId=${userId}`).then(res => {
          const found = res.data.find(c => Number(c.productId) === targetId);
          if (found) {
            api.put(`/api/carthistory/${found.id}`, {
              quantity: newQuantity,
              history: `Updated quantity to ${newQuantity}`
            }).catch(err => console.error('Savat miqdorini yangilashda xatolik:', err));
          }
        }).catch(err => console.error('Savat ro\'yxatini olishda xatolik:', err));
      }
      return prev.map(item => 
        item.id === targetId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "#fcfcfd",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        fontFamily: "'Outfit', sans-serif"
      }}>
        {/* Style block for animations and dots */}
        <style>{`
          @keyframes tickSecond {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .preloader-dot {
            width: 8px;
            height: 8px;
            background-color: #bda10d;
            border-radius: 50%;
            display: inline-block;
            animation: preloader-bounce 1.4s infinite ease-in-out both;
          }
          @keyframes preloader-bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
          }
        `}</style>

        <div style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          padding: "2rem"
        }}>
          {/* Luxury Animating Watch SVG */}
          <div style={{
            width: "120px",
            height: "120px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
              {/* Outer Luxury Gold Bezel */}
              <circle cx="50" cy="50" r="45" stroke="url(#goldGradient)" strokeWidth="3" fill="#ffffff" filter="drop-shadow(0px 8px 16px rgba(191, 160, 13, 0.15))" />
              
              {/* Inner Dial Circle */}
              <circle cx="50" cy="50" r="39" stroke="rgba(24, 24, 27, 0.05)" strokeWidth="1" fill="none" />
              
              {/* Watch Face Ticks (Hour Markers) */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 50 + 34 * Math.sin(angle);
                const y1 = 50 - 34 * Math.cos(angle);
                const x2 = 50 + 38 * Math.sin(angle);
                const y2 = 50 - 38 * Math.cos(angle);
                return (
                  <line 
                    key={i}
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke={i % 3 === 0 ? "#bda10d" : "rgba(24, 24, 27, 0.3)"} 
                    strokeWidth={i % 3 === 0 ? "2.5" : "1"} 
                  />
                );
              })}

              {/* Ticking Hands */}
              {/* Hour Hand */}
              <line 
                x1="50" 
                y1="50" 
                x2="50" 
                y2="28" 
                stroke="#18181b" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                style={{
                  transformOrigin: "50px 50px",
                  animation: "tickSecond 8s infinite linear"
                }}
              />
              
              {/* Minute Hand */}
              <line 
                x1="50" 
                y1="50" 
                x2="50" 
                y2="20" 
                stroke="#bda10d" 
                strokeWidth="2" 
                strokeLinecap="round"
                style={{
                  transformOrigin: "50px 50px",
                  animation: "tickSecond 1.5s infinite linear"
                }}
              />

              {/* Second Hand (Ticking super smooth) */}
              <line 
                x1="50" 
                y1="50" 
                x2="50" 
                y2="16" 
                stroke="#ef4444" 
                strokeWidth="1" 
                strokeLinecap="round"
                style={{
                  transformOrigin: "50px 50px",
                  animation: "tickSecond 0.5s infinite linear"
                }}
              />
              
              {/* Center Cap Dot */}
              <circle cx="50" cy="50" r="3.5" fill="#18181b" />
              <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
              
              {/* Definition of Gradients */}
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dfba1a" />
                  <stop offset="50%" stopColor="#bda10d" />
                  <stop offset="100%" stopColor="#8d7405" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Luxury Text */}
          <div style={{ marginTop: "0.5rem" }}>
            <h2 style={{
              fontSize: "2.4rem",
              fontWeight: "700",
              letterSpacing: "3px",
              textTransform: "uppercase",
              margin: 0,
              background: "linear-gradient(90deg, #18181b, #bda10d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              SoatShop
            </h2>
            <p style={{
              fontSize: "0.9rem",
              color: "#71717a",
              fontWeight: "600",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginTop: "0.5rem",
              opacity: 0.8
            }}>
              Premium klass soatlar dunyosi
            </p>
          </div>
          
          {/* Mini pulse spinner dots */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginTop: "0.5rem"
          }}>
            <span className="preloader-dot" style={{ animationDelay: "0s" }}></span>
            <span className="preloader-dot" style={{ animationDelay: "0.2s" }}></span>
            <span className="preloader-dot" style={{ animationDelay: "0.4s" }}></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-left">
          <div className="logo" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
            SoatShop
          </div>
          {location.pathname !== "/" && (
            <button className="navbar-back-btn" onClick={() => navigate(-1)}>
              &larr; Orqaga
            </button>
          )}
        </div>
        <div className="navbar-right">
          {/* Buyurtmalar tarixi belgisi (Desktop) */}
          <div className="navbar-icon-item" onClick={() => navigate("/orders")} title="Buyurtmalarim">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <span className="icon-label">Buyurtmalarim</span>
          </div>

          {/* Yoqtirganlarim belgisi (Desktop) */}
          <div className="navbar-icon-item" onClick={() => navigate("/wishlist")} title="Yoqtirganlarim">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedProducts.size > 0 ? "#ff3b30" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {likedProducts.size > 0 && <span className="icon-badge">{likedProducts.size}</span>}
            </div>
            <span className="icon-label">Yoqtirganlarim</span>
          </div>
          
          {/* Savat belgisi (Desktop) */}
          <div className="navbar-icon-item" onClick={() => navigate("/cart")} title="Savat">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.01L23 6H6"></path>
              </svg>
              {cartItemsCount > 0 && <span className="icon-badge">{cartItemsCount}</span>}
            </div>
            <span className="icon-label">Savat</span>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                products={products}
                categories={categories}
                likedProducts={likedProducts} 
                toggleLike={toggleLike} 
                cart={cart}
                addToCart={addToCart}
              />
            } 
          />
          <Route 
            path="/product/:id" 
            element={
              <ProductDetail 
                products={products}
                likedProducts={likedProducts} 
                toggleLike={toggleLike} 
                cart={cart}
                addToCart={addToCart}
              />
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <Wishlist 
                products={products}
                likedProducts={likedProducts} 
                toggleLike={toggleLike} 
                cart={cart}
                addToCart={addToCart}
              />
            } 
          />
          <Route 
            path="/cart" 
            element={
              <Cart 
                products={products}
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                addToCart={addToCart}
                likedProducts={likedProducts}
                toggleLike={toggleLike}
                userId={userId}
                setCart={setCart}
              />
            } 
          />
          <Route 
            path="/orders" 
            element={
              <Orders 
                products={products}
                userId={userId}
              />
            } 
          />
        </Routes>
      </main>

      {/* Mobil telefonlar uchun maxsus pastki menyu (Bottom Navigation) */}
      <div className="mobile-bottom-nav">
        {/* Mahsulotlar tugmasi */}
        <div 
          className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`} 
          onClick={() => navigate("/")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Mahsulotlar</span>
        </div>

        {/* Buyurtmalarim tugmasi */}
        <div 
          className={`bottom-nav-item ${location.pathname === '/orders' ? 'active' : ''}`} 
          onClick={() => navigate("/orders")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Buyurtmalarim</span>
        </div>

        {/* Yoqtirganlarim tugmasi */}
        <div 
          className={`bottom-nav-item ${location.pathname === '/wishlist' ? 'active' : ''}`} 
          onClick={() => navigate("/wishlist")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={location.pathname === '/wishlist' ? "#ff3b30" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {likedProducts.size > 0 && <span className="bottom-badge">{likedProducts.size}</span>}
          <span>Yoqtirganlarim</span>
        </div>

        {/* Savat tugmasi */}
        <div 
          className={`bottom-nav-item ${location.pathname === '/cart' ? 'active' : ''}`} 
          onClick={() => navigate("/cart")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.01L23 6H6"></path>
          </svg>
          {cartItemsCount > 0 && <span className="bottom-badge">{cartItemsCount}</span>}
          <span>Savat</span>
        </div>
      </div>
    </div>
  );
}

export default App;
