import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Fire, Package, Star, Truck } from '@phosphor-icons/react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_IMAGES = {
  'cat-hookahs': 'https://images.unsplash.com/photo-1574238752695-675b86d49267?w=800',
  'cat-coals': 'https://images.unsplash.com/photo-1773039163026-1d622779fd71?w=800',
  'cat-flavors': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
  'cat-accessories': 'https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=800',
  'cat-bases': 'https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=800',
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/products?featured=true`),
        ]);
        setCategories(catRes.data);
        setFeaturedProducts(prodRes.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1574238752695-675b86d49267?w=1920"
            alt="Hookah Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB800]">
              Premium Hookah Shop
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-white mt-4">
              La Mejor Experiencia en{' '}
              <span className="text-[#FFB800]">Cachimbas</span>
            </h1>
            <p className="text-[#A1A1AA] text-lg mt-6 leading-relaxed">
              Descubre nuestra selección premium de cachimbas, tabacos y accesorios. 
              Calidad garantizada para los amantes del buen humo.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/tienda">
                <Button 
                  data-testid="hero-shop-button"
                  className="bg-[#FFB800] text-black font-bold hover:bg-[#F59E0B] px-8 h-12 text-base"
                >
                  Ver Tienda
                  <ArrowRight size={20} weight="bold" className="ml-2" />
                </Button>
              </Link>
              <Link to="/tienda?category=cat-hookahs">
                <Button 
                  variant="outline"
                  data-testid="hero-hookahs-button"
                  className="bg-transparent border-[#FFB800]/50 text-[#FFB800] hover:bg-[#FFB800]/10 px-8 h-12 text-base"
                >
                  Ver Cachimbas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-y border-white/10 bg-[#141414]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Envío Gratis', desc: 'En pedidos +50€' },
              { icon: Star, title: 'Calidad Premium', desc: 'Marcas top' },
              { icon: Fire, title: 'Los Mejores Sabores', desc: '+100 variedades' },
              { icon: Package, title: 'Entrega Rápida', desc: '24-48h' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-sm flex items-center justify-center">
                  <feature.icon size={24} weight="fill" className="text-[#FFB800]" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-white text-sm">{feature.title}</h4>
                  <p className="text-[#A1A1AA] text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB800]">
              Explora
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-2">
              Nuestras Categorías
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`bg-[#141414] rounded-sm ${i === 0 ? 'col-span-2 row-span-2 h-[400px]' : 'h-[190px]'}`} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/tienda?category=${category.id}`}
                  data-testid={`category-${category.slug}`}
                  className={`relative group overflow-hidden rounded-sm ${
                    index === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <div className={`relative ${index === 0 ? 'h-[400px]' : 'h-[190px]'}`}>
                    <img
                      src={CATEGORY_IMAGES[category.id] || category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-[#FFB800]/0 group-hover:bg-[#FFB800]/10 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className={`font-heading font-bold text-white ${index === 0 ? 'text-2xl' : 'text-lg'}`}>
                        {category.name}
                      </h3>
                      <p className="text-[#A1A1AA] text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {category.description}
                      </p>
                    </div>
                    <div className="absolute top-4 right-4 w-10 h-10 bg-[#FFB800] rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight size={20} weight="bold" className="text-black" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 bg-[#141414]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB800]">
                Lo Mejor
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-2">
                Productos Destacados
              </h2>
            </div>
            <Link to="/tienda">
              <Button 
                variant="outline"
                data-testid="view-all-products"
                className="bg-transparent border-white/10 text-white hover:bg-[#141414] hover:border-[#FFB800]/30"
              >
                Ver Todo
                <ArrowRight size={16} weight="bold" className="ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#141414] rounded-sm h-[380px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-[#141414] border border-white/10 rounded-sm overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1574238752695-675b86d49267?w=1200"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-8 md:p-16 text-center">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                ¿Necesitas Ayuda para Elegir?
              </h2>
              <p className="text-[#A1A1AA] mt-4 max-w-2xl mx-auto">
                Nuestro equipo de expertos está disponible para asesorarte y encontrar 
                la cachimba perfecta para ti.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link to="/tienda">
                  <Button 
                    data-testid="cta-shop-button"
                    className="bg-[#FFB800] text-black font-bold hover:bg-[#F59E0B] px-8 h-12"
                  >
                    Explorar Tienda
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFB800] rounded-sm flex items-center justify-center">
                <span className="font-heading font-black text-black">H</span>
              </div>
              <span className="font-heading font-bold text-white">HookahShop</span>
            </div>
            <p className="text-[#A1A1AA] text-sm">
              © 2024 HookahShop. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
