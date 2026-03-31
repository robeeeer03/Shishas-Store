import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelSimple, X, MagnifyingGlass } from '@phosphor-icons/react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/products${selectedCategory ? `?category_id=${selectedCategory}` : ''}`),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
    setMobileFiltersOpen(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = () => {
    if (!selectedCategory) return 'Todos los Productos';
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? cat.name : 'Productos';
  };

  const FilterSidebar = ({ mobile = false }) => (
    <div className={mobile ? '' : 'sticky top-24'}>
      <div className="space-y-6">
        {/* Search */}
        <div>
          <h3 className="font-heading font-semibold text-white mb-3">Buscar</h3>
          <div className="relative">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
              className="pl-10 bg-[#0A0A0A] border-white/10 text-white placeholder:text-[#A1A1AA] focus:border-[#FFB800] focus:ring-[#FFB800]"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-heading font-semibold text-white mb-3">Categorías</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleCategoryChange('')}
              data-testid="filter-all"
              className={`w-full text-left px-4 py-3 rounded-sm transition-all ${
                !selectedCategory
                  ? 'bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20'
                  : 'text-[#A1A1AA] hover:bg-[#141414] hover:text-white'
              }`}
            >
              Todos los Productos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                data-testid={`filter-${category.slug}`}
                className={`w-full text-left px-4 py-3 rounded-sm transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20'
                    : 'text-[#A1A1AA] hover:bg-[#141414] hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB800]">
              Tienda
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
              {getCategoryName()}
            </h1>
            <p className="text-[#A1A1AA] text-sm mt-1">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="outline"
                data-testid="mobile-filters-button"
                className="bg-transparent border-white/10 text-white hover:bg-[#141414]"
              >
                <FunnelSimple size={18} weight="bold" className="mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#0A0A0A] border-r border-white/10 w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-white font-heading">Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filter Badge */}
        {selectedCategory && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20 rounded-full px-4 py-2 text-sm">
              {getCategoryName()}
              <button
                onClick={() => handleCategoryChange('')}
                data-testid="clear-filter"
                className="hover:bg-[#FFB800]/20 rounded-full p-1 transition-colors"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#141414] rounded-sm h-[380px]" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#A1A1AA] text-lg">No se encontraron productos</p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    handleCategoryChange('');
                  }}
                  data-testid="reset-filters"
                  className="mt-4 bg-[#FFB800] text-black font-bold hover:bg-[#F59E0B]"
                >
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
