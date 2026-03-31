import requests
import sys
import json
from datetime import datetime
import base64

class HookahShopAPITester:
    def __init__(self, base_url="https://tobacco-hub-6.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.auth_header = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        if self.auth_header:
            test_headers['Authorization'] = self.auth_header

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.text else {}
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            self.test_results.append({
                'name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'success': success,
                'response_preview': response.text[:200] if response.text else ''
            })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                'name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': 'ERROR',
                'success': False,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_get_categories(self):
        """Test getting categories"""
        success, response = self.run_test("Get Categories", "GET", "categories", 200)
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} categories")
            return True, response
        return False, {}

    def test_get_category_by_slug(self, slug="cachimbas"):
        """Test getting category by slug"""
        return self.run_test(f"Get Category by Slug ({slug})", "GET", f"categories/{slug}", 200)

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test("Get All Products", "GET", "products", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products")
            return True, response
        return False, {}

    def test_get_products_by_category(self, category_id="cat-hookahs"):
        """Test getting products by category"""
        success, response = self.run_test(
            f"Get Products by Category ({category_id})", 
            "GET", 
            f"products?category_id={category_id}", 
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products in category")
            return True, response
        return False, {}

    def test_get_featured_products(self):
        """Test getting featured products"""
        success, response = self.run_test("Get Featured Products", "GET", "products?featured=true", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} featured products")
            return True, response
        return False, {}

    def test_get_product_by_id(self, product_id):
        """Test getting product by ID"""
        return self.run_test(f"Get Product by ID ({product_id})", "GET", f"products/{product_id}", 200)

    def test_admin_login_valid(self):
        """Test admin login with valid credentials"""
        success, response = self.run_test(
            "Admin Login (Valid)", 
            "POST", 
            "admin/login", 
            200,
            data={"username": "admin", "password": "hookah2024"}
        )
        if success and response.get('success'):
            # Set auth header for subsequent admin requests
            self.auth_header = f"Basic {base64.b64encode(b'admin:hookah2024').decode()}"
            print("   Auth header set for admin operations")
            return True
        return False

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        return self.run_test(
            "Admin Login (Invalid)", 
            "POST", 
            "admin/login", 
            401,
            data={"username": "admin", "password": "wrongpassword"}
        )

    def test_create_product(self):
        """Test creating a new product"""
        test_product = {
            "name": "Test Hookah Premium",
            "description": "A test hookah for API testing purposes",
            "price": 99.99,
            "image": "https://images.unsplash.com/photo-1574238752695-675b86d49267?w=600",
            "category_id": "cat-hookahs",
            "stock": 5,
            "featured": True
        }
        
        success, response = self.run_test(
            "Create Product", 
            "POST", 
            "admin/products", 
            201,
            data=test_product
        )
        
        if success and response.get('id'):
            print(f"   Created product with ID: {response['id']}")
            return True, response['id']
        return False, None

    def test_update_product(self, product_id):
        """Test updating a product"""
        update_data = {
            "name": "Updated Test Hookah Premium",
            "price": 109.99,
            "stock": 3
        }
        
        return self.run_test(
            f"Update Product ({product_id})", 
            "PUT", 
            f"admin/products/{product_id}", 
            200,
            data=update_data
        )

    def test_delete_product(self, product_id):
        """Test deleting a product"""
        return self.run_test(
            f"Delete Product ({product_id})", 
            "DELETE", 
            f"admin/products/{product_id}", 
            200
        )

    def test_unauthorized_admin_access(self):
        """Test admin endpoints without authentication"""
        # Temporarily remove auth header
        temp_auth = self.auth_header
        self.auth_header = None
        
        success, _ = self.run_test(
            "Unauthorized Admin Access", 
            "POST", 
            "admin/products", 
            401,
            data={"name": "Test", "description": "Test", "price": 10, "image": "test", "category_id": "cat-hookahs"}
        )
        
        # Restore auth header
        self.auth_header = temp_auth
        return success

def main():
    print("🚀 Starting Hookah Shop API Tests")
    print("=" * 50)
    
    tester = HookahShopAPITester()
    
    # Test basic endpoints
    print("\n📋 Testing Basic Endpoints")
    tester.test_root_endpoint()
    
    # Test categories
    print("\n📂 Testing Categories")
    categories_success, categories = tester.test_get_categories()
    if categories_success and categories:
        tester.test_get_category_by_slug("cachimbas")
        tester.test_get_category_by_slug("carbones")
    
    # Test products
    print("\n📦 Testing Products")
    products_success, products = tester.test_get_products()
    
    if products_success and products:
        # Test product by category
        tester.test_get_products_by_category("cat-hookahs")
        tester.test_get_products_by_category("cat-flavors")
        
        # Test featured products
        tester.test_get_featured_products()
        
        # Test individual product
        if len(products) > 0:
            first_product_id = products[0]['id']
            tester.test_get_product_by_id(first_product_id)
    
    # Test admin authentication
    print("\n🔐 Testing Admin Authentication")
    tester.test_admin_login_invalid()
    admin_login_success = tester.test_admin_login_valid()
    
    # Test admin CRUD operations
    if admin_login_success:
        print("\n⚙️ Testing Admin CRUD Operations")
        
        # Test unauthorized access first
        tester.test_unauthorized_admin_access()
        
        # Test create product
        create_success, test_product_id = tester.test_create_product()
        
        if create_success and test_product_id:
            # Test update product
            tester.test_update_product(test_product_id)
            
            # Test delete product
            tester.test_delete_product(test_product_id)
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    # Print failed tests
    failed_tests = [test for test in tester.test_results if not test['success']]
    if failed_tests:
        print("\n❌ Failed Tests:")
        for test in failed_tests:
            error_msg = test.get('error', f'Status {test.get("actual_status", "unknown")}')
            print(f"   - {test['name']}: {error_msg}")
    
    # Return appropriate exit code
    success_rate = tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0
    if success_rate >= 0.8:  # 80% success rate threshold
        print("\n✅ Backend API tests completed successfully!")
        return 0
    else:
        print(f"\n❌ Backend API tests failed (success rate: {success_rate:.1%})")
        return 1

if __name__ == "__main__":
    sys.exit(main())