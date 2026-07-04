import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCardImage from "./ProductCardImage";

function Products({ products, categories, likedProducts, toggleLike, cart, addToCart }) {
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "Barchasi" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Bizning to'plam</h2>
        <div className="header-search">
          <input 
            type="text" 
            placeholder="Soat izlash..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filters-container">
        <div className="categories-container">
          {categories.map(category => (
            <button 
              key={category} 
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div style={{ marginTop: "2rem" }}>
          <h3 className="section-slider-title" style={{ marginBottom: "1.5rem" }}>Barcha modellar</h3>
          <div className="products-grid">
            {filteredProducts.map(product => {
              const inCart = cart.some(item => item.id === product.id);
              return (
                <div className="product-card" key={product.id}>
                  <div 
                    className="product-image-container clickable" 
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ padding: 0, overflow: 'visible', background: 'transparent' }}
                  >
                    <ProductCardImage images={product.images} name={product.name} />
                    
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
                      className={`like-btn ${likedProducts.has(product.id) ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        toggleLike(product.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedProducts.has(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      <button 
                        className={`buy-btn icon-only-btn ${inCart ? 'in-cart' : ''}`} 
                        onClick={() => addToCart(product.id)}
                        disabled={inCart}
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
            })}
          </div>
        </div>
      ) : (
        <div className="no-results">
          <p>Kechirasiz, "{searchQuery}" nomli soat topilmadi.</p>
        </div>
      )}
    </div>
  );
}

export default Products;
