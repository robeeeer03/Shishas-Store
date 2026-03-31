import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { Trash, Plus, Minus, ShoppingCart } from '@phosphor-icons/react';

const CartSheet = () => {
  const { 
    cart, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal,
    clearCart 
  } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent 
        side="right" 
        className="bg-[#0A0A0A] border-l border-white/10 w-full sm:w-[420px] flex flex-col"
        data-testid="cart-sheet"
      >
        <SheetHeader>
          <SheetTitle className="text-white font-heading flex items-center gap-2">
            <ShoppingCart size={24} weight="bold" className="text-[#FFB800]" />
            Tu Carrito
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingCart size={64} weight="thin" className="text-[#A1A1AA] mb-4" />
            <p className="text-[#A1A1AA] text-lg">Tu carrito está vacío</p>
            <p className="text-[#A1A1AA]/60 text-sm mt-2">Añade productos para empezar</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  data-testid={`cart-item-${item.id}`}
                  className="bg-[#141414] border border-white/10 rounded-sm p-4 animate-fadeIn"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-[#FFB800] font-bold mt-1">{item.price.toFixed(2)}€</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`cart-decrease-${item.id}`}
                            className="w-8 h-8 bg-[#0A0A0A] border border-white/10 rounded-sm flex items-center justify-center text-white hover:border-[#FFB800]/30 transition-colors"
                          >
                            <Minus size={14} weight="bold" />
                          </button>
                          <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`cart-increase-${item.id}`}
                            className="w-8 h-8 bg-[#0A0A0A] border border-white/10 rounded-sm flex items-center justify-center text-white hover:border-[#FFB800]/30 transition-colors"
                          >
                            <Plus size={14} weight="bold" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          data-testid={`cart-remove-${item.id}`}
                          className="p-2 text-[#A1A1AA] hover:text-red-500 transition-colors"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="border-t border-white/10 pt-4 flex-col gap-4">
              <div className="flex justify-between items-center w-full">
                <span className="text-[#A1A1AA]">Subtotal</span>
                <span className="text-white font-bold text-xl">{cartTotal.toFixed(2)}€</span>
              </div>
              
              <div className="flex gap-3 w-full">
                <Button
                  onClick={clearCart}
                  variant="outline"
                  data-testid="clear-cart-button"
                  className="flex-1 bg-transparent border-white/10 text-[#A1A1AA] hover:bg-[#141414] hover:text-white"
                >
                  Vaciar
                </Button>
                <Button
                  data-testid="checkout-button"
                  className="flex-1 bg-[#FFB800] text-black font-bold hover:bg-[#F59E0B]"
                  onClick={() => alert('¡Gracias por tu interés! El sistema de pago estará disponible próximamente.')}
                >
                  Finalizar Pedido
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
