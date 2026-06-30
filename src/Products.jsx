import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { products, categories } from "./data";

function Products({ likedProducts, toggleLike, cart, addToCart }) {
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Slider states
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);
  
  // Pause states on hover
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  
  const [visibleCount, setVisibleCount] = useState(4);
  const autoplayRef1 = useRef(null);
  const autoplayRef2 = useRef(null);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "Barchasi" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 550) setVisibleCount(1);
      else if (window.innerWidth <= 900) setVisibleCount(2);
      else if (window.innerWidth <= 1200) setVisibleCount(3);
      else setVisibleCount(4);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const step = visibleCount > 1 ? 2 : 1;

  // Slide transitions helper
  const getNextIndex = (prev, max) => {
    if (prev >= max) return 0;
    const next = prev + step;
    return next > max ? max : next;
  };

  // Reset indices on filter changes
  useEffect(() => {
    setCurrentIndex1(0);
    setCurrentIndex2(0);
  }, [selectedCategory, searchQuery]);

  // Autoplay Slider 1 (Bestsellers) - pauses on hover
  useEffect(() => {
    if (autoplayRef1.current) clearInterval(autoplayRef1.current);

    const maxIndex = Math.max(0, filteredProducts.length - visibleCount);

    if (maxIndex > 0 && !isHovered1) {
      autoplayRef1.current = setInterval(() => {
        setCurrentIndex1(prev => getNextIndex(prev, maxIndex));
      }, 3000); // 3 seconds
    }

    return () => {
      if (autoplayRef1.current) clearInterval(autoplayRef1.current);
    };
  }, [filteredProducts.length, visibleCount, isHovered1]);

  // Autoplay Slider 2 (New Arrivals) - pauses on hover
  useEffect(() => {
    if (autoplayRef2.current) clearInterval(autoplayRef2.current);

    const maxIndex = Math.max(0, filteredProducts.length - visibleCount);

    if (maxIndex > 0 && !isHovered2) {
      autoplayRef2.current = setInterval(() => {
        setCurrentIndex2(prev => getNextIndex(prev, maxIndex));
      }, 3000); // 3 seconds
    }

    return () => {
      if (autoplayRef2.current) clearInterval(autoplayRef2.current);
    };
  }, [filteredProducts.length, visibleCount, isHovered2]);

  // Dots Pagination calculations
  const pageCount = Math.max(1, Math.ceil((filteredProducts.length - visibleCount) / step) + 1);
  
  const currentPage1 = Math.min(pageCount - 1, Math.round(currentIndex1 / step));
  const currentPage2 = Math.min(pageCount - 1, Math.round(currentIndex2 / step));

  const handleDotClick1 = (pageIdx) => {
    const maxIndex = Math.max(0, filteredProducts.length - visibleCount);
    const targetIdx = pageIdx * step;
    setCurrentIndex1(targetIdx > maxIndex ? maxIndex : targetIdx);
  };

  const handleDotClick2 = (pageIdx) => {
    const maxIndex = Math.max(0, filteredProducts.length - visibleCount);
    const targetIdx = pageIdx * step;
    setCurrentIndex2(targetIdx > maxIndex ? maxIndex : targetIdx);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Bizning Kolleksiya</h2>
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
        <div className="multiple-sliders-container">
          
          {/* SECTION 1: BESTSELLERS */}
          <div 
            className="slider-section-block"
            onMouseEnter={() => setIsHovered1(true)}
            onMouseLeave={() => setIsHovered1(false)}
          >
            <h3 className="section-slider-title">Ommabop modellar</h3>
            
            <div className="products-slider-wrapper">
              <div className="products-slider-container">
                <div 
                  className="products-track"
                  style={{ 
                    transform: `translateX(-${currentIndex1 * (100 / filteredProducts.length)}%)`,
                    width: `${(filteredProducts.length / visibleCount) * 100}%`
                  }}
                >
                  {filteredProducts.map(product => {
                    const inCart = cart.some(item => item.id === product.id);
                    return (
                      <div 
                        className="product-card-wrapper" 
                        style={{ width: `${100 / filteredProducts.length}%` }}
                        key={product.id}
                      >
                        <div className="product-card">
                          <div 
                            className="product-image-container clickable" 
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            <img src={product.image} alt={product.name} />
                            
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
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dots Indicators 1 */}
              {pageCount > 1 && (
                <div className="slider-dots">
                  {Array.from({ length: pageCount }).map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`dot ${idx === currentPage1 ? 'active' : ''}`}
                      onClick={() => handleDotClick1(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: NEW ARRIVALS */}
          <div 
            className="slider-section-block" 
            style={{ marginTop: "3.5rem" }}
            onMouseEnter={() => setIsHovered2(true)}
            onMouseLeave={() => setIsHovered2(false)}
          >
            <h3 className="section-slider-title">Yangi kolleksiya</h3>
            
            <div className="products-slider-wrapper">
              <div className="products-slider-container">
                <div 
                  className="products-track"
                  style={{ 
                    transform: `translateX(-${currentIndex2 * (100 / filteredProducts.length)}%)`,
                    width: `${(filteredProducts.length / visibleCount) * 100}%`
                  }}
                >
                  {filteredProducts.map(product => {
                    const inCart = cart.some(item => item.id === product.id);
                    return (
                      <div 
                        className="product-card-wrapper" 
                        style={{ width: `${100 / filteredProducts.length}%` }}
                        key={product.id}
                      >
                        <div className="product-card">
                          <div 
                            className="product-image-container clickable" 
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            <img src={product.image} alt={product.name} />
                            
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
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dots Indicators 2 */}
              {pageCount > 1 && (
                <div className="slider-dots">
                  {Array.from({ length: pageCount }).map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`dot ${idx === currentPage2 ? 'active' : ''}`}
                      onClick={() => handleDotClick2(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
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
