import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash, SignIn, Eye, EyeSlash } from '@phosphor-icons/react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authHeader, setAuthHeader] = useState('');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category_id: '',
    stock: '',
    featured: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API}/admin/login`, { username, password });
      if (res.data.success) {
        setIsLoggedIn(true);
        setAuthHeader(`Basic ${btoa(`${username}:${password}`)}`);
      }
    } catch (error) {
      setLoginError('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthHeader('');
    setUsername('');
    setPassword('');
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category_id: categories[0]?.id || '',
      stock: '10',
      featured: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category_id: product.category_id,
      stock: product.stock.toString(),
      featured: product.featured,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      category_id: formData.category_id,
      stock: parseInt(formData.stock),
      featured: formData.featured,
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, payload, {
          headers: { Authorization: authHeader },
        });
      } else {
        await axios.post(`${API}/admin/products`, payload, {
          headers: { Authorization: authHeader },
        });
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: authHeader },
      });
      setDeleteConfirm(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#141414] border border-white/10 rounded-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#FFB800] rounded-sm flex items-center justify-center mx-auto mb-4">
                <SignIn size={32} weight="bold" className="text-black" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-white">Panel de Administración</h1>
              <p className="text-[#A1A1AA] mt-2">Inicia sesión para gestionar productos</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-white">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="admin-username"
                  placeholder="admin"
                  className="mt-1 bg-[#0A0A0A] border-white/10 text-white placeholder:text-[#A1A1AA] focus:border-[#FFB800]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="admin-password"
                    placeholder="••••••••"
                    className="mt-1 bg-[#0A0A0A] border-white/10 text-white placeholder:text-[#A1A1AA] focus:border-[#FFB800] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-red-400 text-sm" data-testid="login-error">{loginError}</p>
              )}

              <Button
                type="submit"
                data-testid="admin-login-button"
                className="w-full bg-[#FFB800] text-black font-bold hover:bg-[#F59E0B] h-12"
              >
                Iniciar Sesión
              </Button>
            </form>

            <p className="text-[#A1A1AA] text-xs text-center mt-6">
              Credenciales: admin / hookah2024
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB800]">
              Administración
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
              Gestión de Productos
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={openCreateDialog}
              data-testid="add-product-button"
              className="bg-[#FFB800] text-black font-bold hover:bg-[#F59E0B]"
            >
              <Plus size={18} weight="bold" className="mr-2" />
              Añadir Producto
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              data-testid="logout-button"
              className="bg-transparent border-white/10 text-[#A1A1AA] hover:bg-[#141414] hover:text-white"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#141414] border border-white/10 rounded-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#A1A1AA]">Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-[#A1A1AA]">Imagen</TableHead>
                  <TableHead className="text-[#A1A1AA]">Nombre</TableHead>
                  <TableHead className="text-[#A1A1AA]">Categoría</TableHead>
                  <TableHead className="text-[#A1A1AA]">Precio</TableHead>
                  <TableHead className="text-[#A1A1AA]">Stock</TableHead>
                  <TableHead className="text-[#A1A1AA]">Destacado</TableHead>
                  <TableHead className="text-[#A1A1AA] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="border-white/10 hover:bg-[#1C1C1E]"
                    data-testid={`product-row-${product.id}`}
                  >
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-sm"
                      />
                    </TableCell>
                    <TableCell className="text-white font-medium">{product.name}</TableCell>
                    <TableCell className="text-[#A1A1AA]">{product.category_name}</TableCell>
                    <TableCell className="text-[#FFB800] font-bold">{product.price.toFixed(2)}€</TableCell>
                    <TableCell className="text-[#A1A1AA]">{product.stock}</TableCell>
                    <TableCell>
                      {product.featured ? (
                        <span className="bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20 rounded-full px-2 py-1 text-xs">
                          Sí
                        </span>
                      ) : (
                        <span className="text-[#A1A1AA] text-xs">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDialog(product)}
                          data-testid={`edit-product-${product.id}`}
                          className="p-2 text-[#A1A1AA] hover:text-[#FFB800] transition-colors"
                        >
                          <Pencil size={18} weight="bold" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product)}
                          data-testid={`delete-product-${product.id}`}
                          className="p-2 text-[#A1A1AA] hover:text-red-500 transition-colors"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#141414] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingProduct ? 'Editar Producto' : 'Añadir Producto'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="product-name-input"
                className="mt-1 bg-[#0A0A0A] border-white/10 text-white focus:border-[#FFB800]"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="product-description-input"
                className="mt-1 bg-[#0A0A0A] border-white/10 text-white focus:border-[#FFB800] min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  data-testid="product-price-input"
                  className="mt-1 bg-[#0A0A0A] border-white/10 text-white focus:border-[#FFB800]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  data-testid="product-stock-input"
                  className="mt-1 bg-[#0A0A0A] border-white/10 text-white focus:border-[#FFB800]"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger 
                  className="mt-1 bg-[#0A0A0A] border-white/10 text-white focus:border-[#FFB800]"
                  data-testid="product-category-select"
                >
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-white/10">
                  {categories.map((cat) => (
                    <SelectItem 
                      key={cat.id} 
                      value={cat.id}
                      className="text-white hover:bg-[#1C1C1E] focus:bg-[#1C1C1E]"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="image">URL de Imagen</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                data-testid="product-image-input"
                placeholder="https://..."
                className="mt-1 bg-[#0A0A0A] border-white/10 text-white focus:border-[#FFB800]"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Producto Destacado</Label>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                data-testid="product-featured-switch"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-transparent border-white/10 text-[#A1A1AA] hover:bg-[#0A0A0A]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                data-testid="save-product-button"
                className="bg-[#FFB800] text-black font-bold hover:bg-[#F59E0B]"
              >
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#141414] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-[#A1A1AA]">
            ¿Estás seguro de que quieres eliminar <strong className="text-white">{deleteConfirm?.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="bg-transparent border-white/10 text-[#A1A1AA] hover:bg-[#0A0A0A]"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(deleteConfirm.id)}
              data-testid="confirm-delete-button"
              className="bg-red-600 text-white font-bold hover:bg-red-700"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
