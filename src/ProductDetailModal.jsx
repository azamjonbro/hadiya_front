import { useEffect } from "react";

function ProductDetailModal({ product, onClose, cart, addToCart, likedProducts, toggleLike }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!product) return null;

  const inCart = cart.some(item => item.id === product.id);
  const isLiked = likedProducts.has(product.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Yopish">
          &times;
        </button>
        
        <div className="modal-content">
          <div className="modal-image-section">
            <div className="modal-image-wrapper">
              <img src={product.image} alt={product.name} />
              <button 
                className={`like-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => toggleLike(product.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="modal-info-section">
            <span className="product-category-label">{product.category}</span>
            <h1 className="modal-title">{product.name}</h1>
            <div className="modal-price">{product.price}</div>
            
            <div className="modal-description-wrapper">
              <h3>Batafsil ma'lumot</h3>
              <p>{product.fullDescription}</p>
            </div>

            <div className="modal-specs">
              <div className="spec-item">
                <span className="spec-label">Suvga chidamlilik:</span>
                <span className="spec-value">50 Metr (5 ATM)</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Oyna turi:</span>
                <span className="spec-value">Sapfir (Tirnalishga chidamli)</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Kafolat:</span>
                <span className="spec-value">2 Yil Rasmiy</span>
              </div>
            </div>
            
            <div className="modal-actions-wrapper">
              <button 
                className={`buy-btn large-btn ${inCart ? 'in-cart' : ''}`} 
                onClick={() => addToCart(product.id)}
                disabled={inCart}
              >
                {inCart ? "Savatga qo'shildi ✓" : "Savatga qo'shish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;
