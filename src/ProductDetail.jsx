import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ProductDetail({ products, cart, addToCart, likedProducts, toggleLike }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedAngle, setSelectedAngle] = useState(0);
  
  const product = products.find(p => p.id === parseInt(id));

  // Scroll to top whenever the product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedAngle(0); // reset to main angle
  }, [id]);

  if (!product) {
    return (
      <div className="product-detail-page not-found">
        <h2>Kechirasiz, bunday soat topilmadi.</h2>
        <button className="order-btn" onClick={() => navigate('/')}>
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  const inCart = cart.some(item => item.id === product.id);
  const isLiked = likedProducts.has(product.id);

  // 3 distinct angles for the watch gallery
  const angles = [
    { label: "Asosiy ko'rinish", transform: "none" },
    { label: "Yonbosh ko'rinish", transform: "rotateY(40deg) scale(0.95)" },
    { label: "Yaqindan ko'rinish", transform: "scale(1.2)" }
  ];

  // Fetch 4 related products from the same category
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="product-detail-page-container">
      <div className="detail-fullscreen-content">
        <div className="detail-left-visual">
          <div className="detail-image-card">
            <div className="main-image-viewport" style={{ perspective: "1000px" }}>
              <img 
                src={product.image} 
                alt={product.name} 
                style={{ 
                  transform: angles[selectedAngle].transform, 
                  transition: "transform 0.5s ease" 
                }} 
              />
            </div>
            
            <button 
              className={`detail-heart-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => toggleLike(product.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          {/* 3 gallery thumbnails below the main image card */}
          <div className="detail-thumbnail-gallery horizontal-three">
            {angles.map((angle, idx) => (
              <button 
                key={idx} 
                className={`thumbnail-box ${selectedAngle === idx ? 'active' : ''}`}
                onClick={() => setSelectedAngle(idx)}
                title={angle.label}
                style={{ perspective: "500px" }}
              >
                <img 
                  src={product.image} 
                  alt={`${product.name} ${angle.label}`}
                  style={{ transform: angle.transform }}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="detail-right-info">
          <div className="detail-info-card">
            <span className="product-category-label">{product.category}</span>
            <h1 className="detail-title">{product.name}</h1>
            <div className="detail-price">{product.price}</div>
            
            <div className="detail-section-block">
              <h3>Mahsulot tavsifi</h3>
              <p>{product.fullDescription}</p>
            </div>

            <div className="detail-specs-grid">
              <div className="detail-spec-card">
                <span className="spec-label">Suvga chidamlilik</span>
                <span className="spec-value">50m / 5 ATM</span>
              </div>
              <div className="detail-spec-card">
                <span className="spec-label">Oyna materiali</span>
                <span className="spec-value">Sapfir shisha</span>
              </div>
              <div className="detail-spec-card">
                <span className="spec-label">Kafolat muddati</span>
                <span className="spec-value">2 Yil</span>
              </div>
            </div>
            
            <div className="detail-action-block">
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

      {/* SECTION: RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2 className="related-section-title">O'xshash mahsulotlar</h2>
          <div className="products-grid related-grid">
            {relatedProducts.map(related => {
              const relatedInCart = cart.some(item => item.id === related.id);
              const relatedIsLiked = likedProducts.has(related.id);
              return (
                <div className="product-card" key={related.id}>
                  <div 
                    className="product-image-container clickable"
                    onClick={() => navigate(`/product/${related.id}`)}
                  >
                    <img src={related.image} alt={related.name} />
                    
                    <button 
                      className="view-badge-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${related.id}`);
                      }}
                      title="Ko'rish"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>

                    <button 
                      className={`like-btn ${relatedIsLiked ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(related.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={relatedIsLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="product-info">
                    <span className="product-category-label">{related.category}</span>
                    <h3 
                      className="clickable-title bold-black"
                      onClick={() => navigate(`/product/${related.id}`)}
                    >
                      {related.name}
                    </h3>
                    
                    <div className="product-card-footer">
                      <div className="price">{related.price}</div>
                      
                      <button 
                        className={`buy-btn icon-only-btn ${relatedInCart ? 'in-cart' : ''}`} 
                        onClick={() => addToCart(related.id)}
                        disabled={relatedInCart}
                      >
                        {relatedInCart ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
