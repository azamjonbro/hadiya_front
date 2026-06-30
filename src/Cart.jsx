import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { products } from "./data";

// PLACEHOLDERS FOR TELEGRAM BOT: Replace these with your actual tokens!
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";

function Cart({ cart, updateQuantity, removeFromCart, setSelectedProduct }) {
  const navigate = useNavigate();

  // Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+998");

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return { ...product, quantity: item.quantity };
  });

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.priceValue * item.quantity), 0);

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU') + ' UZS';
  };

  // Open Checkout and initialize phone prefix
  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
    setPhone("+998");
  };

  // Phone input mask handler (+998 (90) 123 45 67)
  const handlePhoneChange = (e) => {
    let input = e.target.value;

    // Enforce default +998 start
    if (!input.startsWith("+998")) {
      input = "+998";
    }

    let digits = input.substring(4).replace(/\D/g, "");

    // Handle backspace when cursor hits delimiters to prevent getting stuck
    const inputType = e.nativeEvent.inputType;
    if (inputType === "deleteContentBackward") {
      if (phone.endsWith(" ") || phone.endsWith(")")) {
        digits = digits.slice(0, -1);
      }
    }

    // Limit to 9 UZ phone body digits
    digits = digits.substring(0, 9);

    let formatted = "+998";
    if (digits.length > 0) {
      formatted += " (" + digits.substring(0, 2);
    }
    if (digits.length > 2) {
      formatted += ") " + digits.substring(2, 5);
    } else if (digits.length === 2) {
      formatted += ")"; // closed bracket only
    }
    if (digits.length > 5) {
      formatted += " " + digits.substring(5, 7);
    }
    if (digits.length > 7) {
      formatted += " " + digits.substring(7, 9);
    }

    setPhone(formatted);
  };

  // Submit order to Telegram Bot
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!name || phone.length < 19) {
      alert("Iltimos, telefon raqamingizni to'liq kiriting: +998 (90) 123 45 67");
      return;
    }

    setIsSubmitting(true);

    // Format products list for Telegram message
    const productsDetails = cartItems
      .map(item => `• ${item.name} (${item.quantity} dona) - ${formatPrice(item.priceValue * item.quantity)}`)
      .join("\n");

    const message = `
🔔 YANGI BUYURTMA!

👤 Buyurtmachi: ${name}
📞 Telefon: ${phone}
📧 Email: ${email || "Ko'rsatilmagan"}

📦 Mahsulotlar:
${productsDetails}

💰 Jami summa: ${formatPrice(totalPrice)}
    `;

    try {
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
        console.log("Telegram Bot simulated submit. Log message:\n", message);
      }

      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Order submission error:", error);
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
                  className="cart-item-image"
                  onClick={() => setSelectedProduct(item)}
                >
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3 onClick={() => setSelectedProduct(item)}>{item.name}</h3>
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

      {/* MODAL 1: CHECKOUT FORM */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-container checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsCheckoutOpen(false)}>
              &times;
            </button>
            <h2 className="modal-checkout-title">Buyurtmani rasmiylashtirish</h2>
            <form onSubmit={handleOrderSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="client-name">Ismingiz *</label>
                <input 
                  type="text" 
                  id="client-name"
                  placeholder="Ismingizni kiriting" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              <div className="form-group">
                <label htmlFor="client-email">Email manzilingiz (ixtiyoriy)</label>
                <input 
                  type="email" 
                  id="client-email"
                  placeholder="example@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="checkout-btn submit-order-btn" disabled={isSubmitting}>
                {isSubmitting ? "Yuborilmoqda..." : "Buyurtmani yuborish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUCCESS MESSAGE */}
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
              navigate('/'); // redirect home after success
            }}>
              Asosiy sahifaga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
