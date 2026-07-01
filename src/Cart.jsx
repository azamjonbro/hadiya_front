import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductDetailModal from "./ProductDetailModal";
import api from "./api";

// Telegram Bot sozlamalari
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";

function Cart({ 
  products, 
  cart, 
  updateQuantity, 
  removeFromCart, 
  addToCart, 
  likedProducts, 
  toggleLike, 
  userId, 
  setCart 
}) {
  const navigate = useNavigate();

  // Modal oynalar holati
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forma ma'lumotlari holati (Backend'ga to'liq mos ravishda)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998");

  // Savatdagi mahsulotlarni dynamic products prop'dan qidirib olish
  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return product ? { ...product, quantity: item.quantity } : null;
  }).filter(Boolean);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.priceValue * item.quantity), 0);

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU') + ' UZS';
  };

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
    setPhone("+998");
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value;

    if (!input.startsWith("+998")) {
      input = "+998";
    }

    let digits = input.substring(4).replace(/\D/g, "");

    const inputType = e.nativeEvent.inputType;
    if (inputType === "deleteContentBackward") {
      if (phone.endsWith(" ") || phone.endsWith(")")) {
        digits = digits.slice(0, -1);
      }
    }

    digits = digits.substring(0, 9);

    let formatted = "+998";
    if (digits.length > 0) {
      formatted += " (" + digits.substring(0, 2);
    }
    if (digits.length > 2) {
      formatted += ") " + digits.substring(2, 5);
    } else if (digits.length === 2) {
      formatted += ")";
    }
    if (digits.length > 5) {
      formatted += " " + digits.substring(5, 7);
    }
    if (digits.length > 7) {
      formatted += " " + digits.substring(7, 9);
    }

    setPhone(formatted);
  };

  // Buyurtmani jo'natish (Railway API va Telegram Bot)
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || phone.length < 19) {
      alert("Iltimos, barcha maydonlarni to'ldiring va telefon raqamingizni to'liq kiriting: +998 (90) 123 45 67");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. User ma'lumotlarini (Ism, Familiya, Telefon) Railway bazasida yangilash
      if (userId) {
        await api.put(`/api/user/${userId}`, {
          firstName: firstName,
          lastName: lastName,
          phone: phone
        });
      }

      // 2. Railway bazasiga buyurtma tarixini qo'shish va orqa fonda savatni ozalash
      if (userId && cartItems.length > 0) {
        for (const item of cartItems) {
          // Buyurtma tarixiga qo'shish
          await api.post('/api/orderhistory', {
            userId,
            productId: item.id,
            ProductId: String(item.id),
            quantity: item.quantity,
            history: JSON.stringify({
              address: address || "Yetkazish manzili",
              status: "Kutilmoqda",
              message: `Ordered ${item.quantity} units of ${item.name} for ${item.price}`
            })
          });

          // Savat tarixidan o'chirish (DB)
          try {
            const res = await api.get(`/api/carthistory?userId=${userId}`);
            const found = res.data.find(c => Number(c.productId) === Number(item.id));
            if (found) {
              await api.delete(`/api/carthistory/${found.id}`);
            }
          } catch (e) {
            console.error('Baza savat elementini o\'chirishda xato:', e);
          }
        }
      }

      // Telegram xabari matnini formatlash (Ism, Familiya va Telefon bilan)
      const productsDetails = cartItems
        .map(item => `• ${item.name} (${item.quantity} dona) - ${formatPrice(item.priceValue * item.quantity)}`)
        .join("\n");

      const message = `
🔔 YANGI BUYURTMA!

👤 Buyurtmachi: ${firstName} ${lastName}
📞 Telefon: ${phone}

📦 Mahsulotlar:
${productsDetails}

💰 Jami summa: ${formatPrice(totalPrice)}
      `;

      // 3. Telegram Botga jo'natish
      if (TELEGRAM_BOT_TOKEN !== "YOUR_BOT_TOKEN" && TELEGRAM_CHAT_ID !== "YOUR_CHAT_ID") {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
          }),
        });
      } else {
        console.log("Telegram Bot simulyatsiya qilindi. Xabar:\n", message);
      }

      // Local storage va state savatlarini tozalash
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));

      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Buyurtma yuborishda xatolik:", error);
      alert("Xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring!");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="products-header">
        <h2>Savat (Cart)</h2>
      </div>

      {cartItems.length > 0 ? (
        <div className="cart-container">
          <div className="cart-items">
            {cartItems.map(item => (
              <div className="cart-item" key={item.id}>
                <div 
                  className="cart-item-image clickable"
                  onClick={() => setSelectedProduct(item)}
                >
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3 className="clickable" onClick={() => setSelectedProduct(item)}>{item.name}</h3>
                  <p className="cart-item-category">{item.category}</p>
                  <div className="cart-item-price">{item.price}</div>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Buyurtma xulosasi</h3>
            <div className="summary-row">
              <span>Jami mahsulotlar:</span>
              <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)} dona</span>
            </div>
            <div className="summary-row total">
              <span>Umumiy summa:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <button className="checkout-btn" onClick={handleOpenCheckout}>
              Buyurtmani rasmiylashtirish
            </button>
          </div>
        </div>
      ) : (
        <div className="no-results">
          <p>Savatingiz bo'sh.</p>
          <button className="order-btn" onClick={() => navigate('/')} style={{ marginTop: '1.5rem', fontSize: '1rem', padding: '0.75rem 2rem' }}>
            Xaridni boshlash
          </button>
        </div>
      )}

      {/* 1-MODAL: BUYURTMA FORMASI */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-container checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsCheckoutOpen(false)}>
              &times;
            </button>
            <h2 className="modal-checkout-title">Buyurtmani rasmiylashtirish</h2>
            <form onSubmit={handleOrderSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="client-firstname">Ismingiz *</label>
                <input 
                  type="text" 
                  id="client-firstname"
                  placeholder="Ismingizni kiriting" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="client-lastname">Familiyangiz *</label>
                <input 
                  type="text" 
                  id="client-lastname"
                  placeholder="Familiyangizni kiriting" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="client-phone">Telefon raqamingiz *</label>
                <input 
                  type="tel" 
                  id="client-phone"
                  placeholder="+998 (90) 123 45 67" 
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                />
              </div>

              <button type="submit" className="checkout-btn submit-order-btn" disabled={isSubmitting}>
                {isSubmitting ? "Yuborilmoqda..." : "Buyurtmani yuborish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2-MODAL: MUVAFFAQIYAT XABARI */}
      {isSuccessOpen && (
        <div className="modal-overlay" onClick={() => setIsSuccessOpen(false)}>
          <div className="modal-container success-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsSuccessOpen(false)}>
              &times;
            </button>
            <div className="success-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="success-title">Buyurtmangiz qabul qilindi!</h2>
            <p className="success-description">
              Tez orada mas'ul xodimlarimiz siz bilan bog'lanishadi. Bizni tanlaganingiz uchun rahmat!
            </p>
            <button className="checkout-btn success-close-btn" onClick={() => {
              setIsSuccessOpen(false);
              navigate('/');
            }}>
              Asosiy sahifaga qaytish
            </button>
          </div>
        </div>
      )}

      {/* MAHSULOT DETAILS MODAL (SAVATDA BOSILGANDA) */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          cart={cart}
          addToCart={addToCart}
          likedProducts={likedProducts}
          toggleLike={toggleLike}
        />
      )}
    </div>
  );
}

export default Cart;
