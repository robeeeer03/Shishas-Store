import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft, Check, Package } from '@phosphor-icons/react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, openCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/products/${id}`);
        setProduct(res.data);

        // Fetch related products from same category
        const relatedRes = await axios.get(`${API}/products?category_id=${res.data.category_id}`);
        setRelatedProducts(relatedRes.data.filter(p => p.id !== id).slice(0, 4));
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    setQuantity(1);
    setAdded(false);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleAddAndOpen = () => {
    if (product) {
      addToCart(product, quantity);
      openCart();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 animate-pulse">
            <div className="aspect-square bg-[#141414] rounded-sm" />
            <div className="space-y-4">
              <div className="h-4 bg-[#141414] rounded w-24" />
              <div className="h-10 bg-[#141414] rounded w-3/4" />
              <div className="h-8 bg-[#141414] rounded w-32" />
              <div className="h-24 bg-[#141414] rounded" />
              <div className="h-12 bg-[#141414] rounded w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A1A1AA] text-lg mb-4">Producto no encontrado</p>
          <Link to="/tienda">
            <Button className="bg-[#FFB800] text-black font-bold hover:bg-[#F59E0B]">
              Volver a la Tienda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/tienda"
          data-testid="back-to-shop"
          className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} weight="bold" />
          Volver a la tienda
        </Link>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="aspect-square bg-[#141414] border border-white/10 rounded-sm overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  data-testid="product-image"
                />
              </div>
              {product.featured && (
                <span className="absolute top-4 left-4 bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20 rounded-full px-4 py-1.5 text-xs uppercase tracking-wider font-bold">
                  Destacado
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB800]">
                {product.category_name}
              </span>
              <h1 
                className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2"
                data-testid="product-name"
              >
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span 
                className="text-[#FFB800] font-bold text-3xl lg:text-4xl"
                data-testid="product-price"
              >
                {product.price.toFixed(2)}€
              </span>
              {product.stock > 0 ? (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <Check size={16} weight="bold" />
                  En stock ({product.stock})
                </span>
              ) : (
                <span className="text-red-400 text-sm">Agotado</span>
              )}
            </div>

            <p className="text-[#A1A1AA] leading-relaxed" data-testid="product-description">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">Cantidad:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="decrease-quantity"
                  className="w-10 h-10 bg-[#141414] border border-white/10 rounded-sm flex items-center justify-center text-white hover:border-[#FFB800]/30 transition-colors"
                >
                  <Minus size={16} weight="bold" />
                </button>
                <span className="text-white font-bold text-lg w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  data-testid="increase-quantity"
                  className="w-10 h-10 bg-[#141414] border border-white/10 rounded-sm flex items-center justify-center text-white hover:border-[#FFB800]/30 transition-colors"
                >
                  <Plus size={16} weight="bold" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                data-testid="add-to-cart-button"
                className={`flex-1 h-14 text-base font-bold transition-all ${
                  added
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-[#FFB800] text-black hover:bg-[#F59E0B]'
                }`}
              >
                {added ? (
                  <>
                    <Check size={20} weight="bold" className="mr-2" />
                    Añadido al Carrito
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} weight="bold" className="mr-2" />
                    Añadir al Carrito
                  </>
                )}
              </Button>
              <Button
                onClick={handleAddAndOpen}
                disabled={product.stock === 0}
                variant="outline"
                data-testid="buy-now-button"
                className="flex-1 h-14 text-base bg-transparent border-[#FFB800]/50 text-[#FFB800] hover:bg-[#FFB800]/10"
              >
                Comprar Ahora
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="bg-[#141414] border border-white/10 rounded-sm p-4 mt-6">
              <div className="flex items-center gap-3">
                <Package size={24} weight="fill" className="text-[#FFB800]" />
                <div>
                  <p className="text-white font-medium">Envío Gratis</p>
                  <p className="text-[#A1A1AA] text-sm">En pedidos superiores a 50€</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24 border-t border-white/10 pt-16">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-8">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
