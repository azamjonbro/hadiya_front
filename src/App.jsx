import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./Home";
import Wishlist from "./Wishlist";
import Cart from "./Cart";
import ProductDetail from "./ProductDetail";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize states from localStorage to prevent loss on refresh
  const [likedProducts, setLikedProducts] = useState(() => {
    const saved = localStorage.getItem("likedProducts");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Save states to localStorage when they change
  useEffect(() => {
    localStorage.setItem("likedProducts", JSON.stringify(Array.from(likedProducts)));
  }, [likedProducts]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const toggleLike = (id) => {
    setLikedProducts(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(id)) {
        newLikes.delete(id);
      } else {
        newLikes.add(id);
      }
      return newLikes;
    });
  };

  const addToCart = (id) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev; 
      }
      return [...prev, { id, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
          <div className="wishlist-icon" onClick={() => navigate("/wishlist")} title="Wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedProducts.size > 0 ? "#ff3b30" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {likedProducts.size > 0 && <span className="icon-badge">{likedProducts.size}</span>}
          </div>
          
          <div className="cart-icon" onClick={() => navigate("/cart")} title="Savat">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.01L23 6H6" /* fixed path minor typo just in case */></path>
            </svg>
            {cartItemsCount > 0 && <span className="icon-badge">{cartItemsCount}</span>}
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
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
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
