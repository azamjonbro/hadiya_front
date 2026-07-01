import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Orders({ products, userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    async function fetchOrders() {
      try {
        const res = await api.get(`/api/orderhistory?userId=${userId}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Buyurtmalarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [userId]);

  // Buyurtmalarni statusiga ko'ra 3 ta guruhga ajratish:
  // 1. Yetkazib berilganlar (Delivered)
  const completedOrders = orders.filter(o => 
    String(o.history).includes("Yetkazildi") || 
    String(o.history).includes("Yetkazib berildi") || 
    String(o.history).includes("Delivered")
  );

  // 2. Yetkazilayotganlar (Delivering / Shipped / Yo'lda)
  const deliveringOrders = orders.filter(o => 
    !completedOrders.includes(o) && (
      String(o.history).includes("Yetkazilmoqda") || 
      String(o.history).includes("Yo'lda") || 
      String(o.history).includes("Delivering") || 
      String(o.history).includes("Shipped")
    )
  );

  // 3. Faol/Kutilayotganlar (Active / Ordered)
  const activeOrders = orders.filter(o => 
    !completedOrders.includes(o) && 
    !deliveringOrders.includes(o)
  );

  const renderOrderCard = (order) => {
    const product = products.find(p => p.id === Number(order.productId));
    const orderDate = new Date(order.createdAt).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    return (
      <div className="order-history-card" key={order.id}>
        <div className="order-card-header">
          <span className="order-date">{orderDate}</span>
          <span className="order-id">Buyurtma ID: #{order.id}</span>
        </div>
        <div className="order-card-body">
          {product ? (
            <div className="order-product-info">
              <img src={product.image} alt={product.name} className="order-product-img" />
              <div className="order-product-details">
                <h4>{product.name}</h4>
                <p className="order-category">{product.category}</p>
                <p className="order-qty">{order.quantity} dona x {product.price}</p>
              </div>
            </div>
          ) : (
            <p className="order-product-unknown">Mahsulot ID: #{order.productId} (Bazadan o'chirilgan bo'lishi mumkin)</p>
          )}
          <div className="order-status-desc">
            <strong>Tavsif / Holati:</strong> {order.history}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="orders-page">
      <div className="products-header">
        <h2>Mening buyurtmalarim</h2>
      </div>

      {loading ? (
        <div className="no-results"><p>Yuklanmoqda...</p></div>
      ) : orders.length > 0 ? (
        <div className="orders-container">
          
          {/* 1. FAOL BUYURTMALAR */}
          <div className="orders-section">
            <h3 className="section-title">Faol buyurtmalar ({activeOrders.length})</h3>
            {activeOrders.length > 0 ? (
              <div className="orders-grid-list">
                {activeOrders.map(renderOrderCard)}
              </div>
            ) : (
              <p className="no-orders-msg">Hozirda faol buyurtmalar mavjud emas.</p>
            )}
          </div>

          {/* 2. YETKAZILMOQDA (YO'LDA) */}
          <div className="orders-section" style={{ marginTop: "3rem" }}>
            <h3 className="section-title delivering-title" style={{ borderLeftColor: '#f59e0b' }}>
              Yetkazilmoqda ({deliveringOrders.length})
            </h3>
            {deliveringOrders.length > 0 ? (
              <div className="orders-grid-list">
                {deliveringOrders.map(renderOrderCard)}
              </div>
            ) : (
              <p className="no-orders-msg">Hozirda yo'ldagi buyurtmalar mavjud emas.</p>
            )}
          </div>

          {/* 3. YETKAZIB BERILGAN */}
          <div className="orders-section" style={{ marginTop: "3rem" }}>
            <h3 className="section-title completed-title">Yetkazib berilgan buyurtmalar ({completedOrders.length})</h3>
            {completedOrders.length > 0 ? (
              <div className="orders-grid-list">
                {completedOrders.map(renderOrderCard)}
              </div>
            ) : (
              <p className="no-orders-msg">Hali yetkazilgan buyurtmalar mavjud emas.</p>
            )}
          </div>

        </div>
      ) : (
        <div className="no-results">
          <p>Siz hali hech qanday buyurtma bermagansiz.</p>
          <button className="order-btn" onClick={() => navigate("/")} style={{ marginTop: '1.5rem', fontSize: '1rem', padding: '0.75rem 2rem' }}>
            Xarid qilish
          </button>
        </div>
      )}
    </div>
  );
}

export default Orders;
