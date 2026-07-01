import { useNavigate } from "react-router-dom";

function Wishlist({ products, likedProducts, toggleLike, cart, addToCart }) {
  const navigate = useNavigate();

  // Istaklar ro'yxatidagi mahsulotlarni filtrlash
  const wishlistItems = products.filter(p => likedProducts.has(p.id));

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Sizning Istaklaringiz (Wishlist)</h2>
      </div>

      <div className="products-grid">
        {wishlistItems.length > 0 ? (
          wishlistItems.map(product => {
            const inCart = cart.some(item => item.id === product.id);
            return (
              <div className="product-card" key={product.id}>
                <div 
                  className="product-image-container clickable"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img src={product.image} alt={product.name} />
                  
                  {/* Ko'rish tugmasi */}
                  <button 
                    className="view-badge-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${product.id}`);
                    }}
                    title="Ko'rish"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>

                  <button 
                    className="like-btn liked"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(product.id);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <div className="product-info">
                  <span className="product-category-label">{product.category}</span>
                  <h3 
                    className="clickable-title bold-black"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="product-card-footer">
                    <div className="price">{product.price}</div>
                    
                    {/* Savatga qo'shish tugmasi */}
                    <button 
                      className={`buy-btn icon-only-btn ${inCart ? 'in-cart' : ''}`} 
                      onClick={() => addToCart(product.id)}
                      disabled={inCart}
                      title={inCart ? "Savatga qo'shilgan" : "Savatga qo'shish"}
                    >
                      {inCart ? (
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
          })
        ) : (
          <div className="no-results">
            <p>Hali hech qanday soatni wishlistga qo'shmadingiz.</p>
            <button className="order-btn" onClick={() => navigate('/')} style={{ marginTop: '1.5rem', fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Soatlarni ko'rish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
