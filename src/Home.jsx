import Products from "./Products";

function Home({ products, categories, likedProducts, toggleLike, cart, addToCart }) {
  
  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      <div className="home-page">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Al Harameen Brendining O'zbekistondagi Rasmiy Distributori</h1>
            <p className="hero-subtitle">
             Alharameenuz orqali original va premium sifatli Al Harameen soatlarini xarid qiling. Erkaklar va ayollar uchun zamonaviy dizayn, yuqori sifat va O'zbekiston bo'ylab yetkazib berish.
            </p>
            <button 
              className="order-btn" 
              onClick={scrollToProducts}
            >
              Zakaz berish
            </button>
          </div>
          <div className="hero-image-wrapper">
            <img src="/certificate.jpg" alt="Al Harameen Distributor Certificate" className="hero-image" />
          </div>
        </div>
      </div>
      
      <div id="products-section">
        <Products 
          products={products}
          categories={categories}
          likedProducts={likedProducts}
          toggleLike={toggleLike}
          cart={cart}
          addToCart={addToCart}
        />
      </div>
    </div>
  );
}

export default Home;
