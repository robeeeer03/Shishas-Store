import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from '@phosphor-icons/react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group bg-[#141414] border border-white/10 rounded-sm overflow-hidden hover:-translate-y-1 hover:border-[#FFB800]/30 transition-all duration-300"
    >
      <Link to={`/producto/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.featured && (
            <span className="absolute top-3 left-3 bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20 rounded-full px-3 py-1 text-xs uppercase tracking-wider font-bold">
              Destacado
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick Actions Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <Button
              onClick={handleAddToCart}
              data-testid={`add-to-cart-${product.id}`}
              className="flex-1 bg-[#FFB800] text-black font-bold hover:bg-[#F59E0B] text-sm h-10"
            >
              <ShoppingCart size={16} weight="bold" className="mr-2" />
              Añadir
            </Button>
            <Link
              to={`/producto/${product.id}`}
              data-testid={`view-product-${product.id}`}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <Eye size={18} weight="bold" />
            </Link>
          </div>
        </div>

        <div className="p-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB800]">
            {product.category_name}
          </span>
          <h3 className="font-heading font-semibold text-white mt-1 truncate group-hover:text-[#FFB800] transition-colors">
            {product.name}
          </h3>
          <p className="text-[#A1A1AA] text-sm mt-1 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-[#FFB800] font-bold text-xl">{product.price.toFixed(2)}€</span>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-xs text-orange-400">¡Últimas {product.stock} unidades!</span>
            )}
            {product.stock === 0 && (
              <span className="text-xs text-red-400">Agotado</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
