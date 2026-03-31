from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBasic()

# Admin credentials (simple auth)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "hookah2024"

# Define Models
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    image: str
    description: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    price: float
    image: str
    category_id: str
    category_name: Optional[str] = None
    stock: int = 10
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    image: str
    category_id: str
    stock: int = 10
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    category_id: Optional[str] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    message: str

def generate_slug(name: str) -> str:
    return name.lower().replace(" ", "-").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")

# Authentication helper
def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return credentials.username

# Categories data
CATEGORIES = [
    Category(id="cat-hookahs", name="Cachimbas", slug="cachimbas", image="https://images.unsplash.com/photo-1574238752695-675b86d49267?w=800", description="Cachimbas premium de las mejores marcas"),
    Category(id="cat-coals", name="Carbones", slug="carbones", image="https://images.unsplash.com/photo-1773039163026-1d622779fd71?w=800", description="Carbones naturales y de coco"),
    Category(id="cat-flavors", name="Sabores", slug="sabores", image="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800", description="Tabacos y sabores de las mejores marcas"),
    Category(id="cat-accessories", name="Accesorios", slug="accesorios", image="https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=800", description="Mangueras, boquillas, cazoletas y más"),
    Category(id="cat-bases", name="Bases", slug="bases", image="https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=800", description="Jarrones y bases de cristal"),
]

# Initial products data
INITIAL_PRODUCTS = [
    # Cachimbas
    {"name": "Cachimba Alpha Premium", "description": "Cachimba de acero inoxidable con diseño moderno y elegante. Incluye manguera de silicona y cazoleta.", "price": 89.99, "image": "https://images.unsplash.com/photo-1574238752695-675b86d49267?w=600", "category_id": "cat-hookahs", "stock": 15, "featured": True},
    {"name": "Cachimba Black Edition", "description": "Cachimba negra mate con detalles dorados. Altura 55cm. Perfecta para sesiones largas.", "price": 129.99, "image": "https://images.unsplash.com/photo-1765293995398-bdb4d7c13e74?w=600", "category_id": "cat-hookahs", "stock": 8, "featured": True},
    {"name": "Cachimba Mini Travel", "description": "Cachimba compacta ideal para viajes. Incluye maletín de transporte.", "price": 49.99, "image": "https://images.unsplash.com/photo-1574238752695-675b86d49267?w=600", "category_id": "cat-hookahs", "stock": 20, "featured": False},
    {"name": "Cachimba Crystal Deluxe", "description": "Cachimba con base de cristal artesanal. Pieza única y exclusiva.", "price": 199.99, "image": "https://images.unsplash.com/photo-1765293995398-bdb4d7c13e74?w=600", "category_id": "cat-hookahs", "stock": 5, "featured": True},
    # Carbones
    {"name": "Carbón Coco Premium 1kg", "description": "Carbón de coco 100% natural. Sin olores ni sabores. Larga duración.", "price": 12.99, "image": "https://images.unsplash.com/photo-1773039163026-1d622779fd71?w=600", "category_id": "cat-coals", "stock": 50, "featured": True},
    {"name": "Carbón Quick Light 40pcs", "description": "Carbones de encendido rápido. Listos en 30 segundos.", "price": 8.99, "image": "https://images.unsplash.com/photo-1773039163026-1d622779fd71?w=600", "category_id": "cat-coals", "stock": 100, "featured": False},
    {"name": "Carbón Natural Bamboo 2kg", "description": "Carbón de bambú ecológico. Combustión limpia y uniforme.", "price": 19.99, "image": "https://images.unsplash.com/photo-1773039163026-1d622779fd71?w=600", "category_id": "cat-coals", "stock": 30, "featured": False},
    # Sabores
    {"name": "Sabor Doble Manzana 50g", "description": "Clásico sabor de doble manzana. El favorito de todos.", "price": 6.99, "image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600", "category_id": "cat-flavors", "stock": 80, "featured": True},
    {"name": "Sabor Sandía Ice 50g", "description": "Refrescante sandía con toque mentolado.", "price": 6.99, "image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600", "category_id": "cat-flavors", "stock": 60, "featured": False},
    {"name": "Sabor Blue Mist 50g", "description": "Mezcla de arándanos con menta fresca.", "price": 7.99, "image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600", "category_id": "cat-flavors", "stock": 45, "featured": True},
    {"name": "Pack Sabores Mix 5x50g", "description": "Pack variado con 5 sabores diferentes.", "price": 29.99, "image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600", "category_id": "cat-flavors", "stock": 25, "featured": False},
    # Accesorios
    {"name": "Manguera Silicona Premium", "description": "Manguera de silicona lavable de alta calidad. 180cm.", "price": 14.99, "image": "https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=600", "category_id": "cat-accessories", "stock": 40, "featured": False},
    {"name": "Cazoleta Phunnel Pro", "description": "Cazoleta tipo phunnel para mejor gestión del calor.", "price": 18.99, "image": "https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=600", "category_id": "cat-accessories", "stock": 35, "featured": True},
    {"name": "Pack 100 Boquillas Desechables", "description": "Boquillas higiénicas desechables. Pack de 100 unidades.", "price": 9.99, "image": "https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=600", "category_id": "cat-accessories", "stock": 200, "featured": False},
    {"name": "Pinzas Carbón Profesional", "description": "Pinzas de acero inoxidable con mango ergonómico.", "price": 7.99, "image": "https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=600", "category_id": "cat-accessories", "stock": 60, "featured": False},
    # Bases
    {"name": "Base Cristal Bohemia 30cm", "description": "Base de cristal de Bohemia artesanal. Color ámbar.", "price": 39.99, "image": "https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=600", "category_id": "cat-bases", "stock": 12, "featured": True},
    {"name": "Base LED RGB", "description": "Base con iluminación LED multicolor. Control remoto incluido.", "price": 54.99, "image": "https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=600", "category_id": "cat-bases", "stock": 18, "featured": False},
    {"name": "Base Mini 20cm Transparente", "description": "Base compacta de cristal transparente.", "price": 24.99, "image": "https://images.unsplash.com/photo-1574751749605-0f1e41b6cf67?w=600", "category_id": "cat-bases", "stock": 25, "featured": False},
]

# Startup event to seed data
@app.on_event("startup")
async def startup_event():
    # Check if products exist
    count = await db.products.count_documents({})
    if count == 0:
        # Seed products
        for product_data in INITIAL_PRODUCTS:
            product = Product(
                name=product_data["name"],
                slug=generate_slug(product_data["name"]),
                description=product_data["description"],
                price=product_data["price"],
                image=product_data["image"],
                category_id=product_data["category_id"],
                stock=product_data["stock"],
                featured=product_data.get("featured", False)
            )
            doc = product.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.products.insert_one(doc)
        logging.info("Seeded initial products")

# Routes
@api_router.get("/")
async def root():
    return {"message": "Hookah Shop API"}

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    return CATEGORIES

@api_router.get("/categories/{slug}")
async def get_category(slug: str):
    for cat in CATEGORIES:
        if cat.slug == slug:
            return cat
    raise HTTPException(status_code=404, detail="Category not found")

# Products
@api_router.get("/products", response_model=List[Product])
async def get_products(category_id: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if featured is not None:
        query["featured"] = featured
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    
    # Add category name to each product
    category_map = {cat.id: cat.name for cat in CATEGORIES}
    for product in products:
        product["category_name"] = category_map.get(product.get("category_id"), "")
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Add category name
    category_map = {cat.id: cat.name for cat in CATEGORIES}
    product["category_name"] = category_map.get(product.get("category_id"), "")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return product

# Admin routes
@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(login: AdminLogin):
    if login.username == ADMIN_USERNAME and login.password == ADMIN_PASSWORD:
        return AdminLoginResponse(success=True, message="Login successful")
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.post("/admin/products", response_model=Product, status_code=201)
async def create_product(product_data: ProductCreate, admin: str = Depends(verify_admin)):
    product = Product(
        name=product_data.name,
        slug=generate_slug(product_data.name),
        description=product_data.description,
        price=product_data.price,
        image=product_data.image,
        category_id=product_data.category_id,
        stock=product_data.stock,
        featured=product_data.featured
    )
    
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    
    # Add category name
    category_map = {cat.id: cat.name for cat in CATEGORIES}
    product.category_name = category_map.get(product.category_id, "")
    
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate, admin: str = Depends(verify_admin)):
    update_dict = {k: v for k, v in product_data.model_dump().items() if v is not None}
    
    if "name" in update_dict:
        update_dict["slug"] = generate_slug(update_dict["name"])
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.products.update_one({"id": product_id}, {"$set": update_dict})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    
    # Add category name
    category_map = {cat.id: cat.name for cat in CATEGORIES}
    product["category_name"] = category_map.get(product.get("category_id"), "")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return product

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: str = Depends(verify_admin)):
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
