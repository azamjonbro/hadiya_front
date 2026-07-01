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
            <h1 className="hero-title">Vaqtning Haqiqiy Qadri</h1>
            <p className="hero-subtitle">
              Bizning do'konda eng sara va zamonaviy soatlar jamlangan. O'zingizga mos va premium sifatdagi soatlarni kashf eting.
            </p>
            <button 
              className="order-btn" 
              onClick={scrollToProducts}
            >
              Zakaz berish
            </button>
          </div>
          <div className="hero-image-wrapper">
            <img src="/hero.png" alt="Zamonaviy soat" className="hero-image" />
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
