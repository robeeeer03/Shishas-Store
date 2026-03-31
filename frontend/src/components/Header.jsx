import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, List, House, Storefront, GearSix } from '@phosphor-icons/react';
import { useCart } from '../context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { useState } from 'react';

const Header = () => {
  const { cartCount, openCart } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Inicio', icon: House },
    { to: '/tienda', label: 'Tienda', icon: Storefront },
    { to: '/admin', label: 'Admin', icon: GearSix },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
            data-testid="header-logo"
          >
            <div className="w-10 h-10 bg-[#FFB800] rounded-sm flex items-center justify-center">
              <span className="font-heading font-black text-black text-xl">H</span>
            </div>
            <span className="font-heading font-bold text-xl text-white hidden sm:block group-hover:text-[#FFB800] transition-colors">
              HookahShop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-[#FFB800]'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <link.icon size={18} weight={isActive(link.to) ? 'fill' : 'regular'} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              data-testid="cart-button"
              className="relative flex items-center gap-2 bg-[#141414] hover:bg-[#1C1C1E] border border-white/10 hover:border-[#FFB800]/30 px-4 py-2 rounded-sm transition-all"
            >
              <ShoppingCart size={20} weight="bold" className="text-[#FFB800]" />
              <span className="text-white text-sm font-medium hidden sm:block">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FFB800] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button 
                  data-testid="mobile-menu-button"
                  className="p-2 text-white hover:text-[#FFB800] transition-colors"
                >
                  <List size={24} weight="bold" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0A0A0A] border-l border-white/10 w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-white font-heading">Menú</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                      className={`flex items-center gap-3 p-3 rounded-sm transition-all ${
                        isActive(link.to)
                          ? 'bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20'
                          : 'text-[#A1A1AA] hover:bg-[#141414] hover:text-white'
                      }`}
                    >
                      <link.icon size={20} weight={isActive(link.to) ? 'fill' : 'regular'} />
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
