// Honest Pharmco Ordering System - Frontend Application

class HonestPharmcoApp {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.products = [];
    this.init();
  }

  init() {
    this.loadProducts(); // Load products immediately for all users
    this.render();
  }

  render() {
    const app = document.getElementById('app');
    
    // Show main dashboard for everyone, login controls in header
    app.innerHTML = this.renderMainLayout();
    this.attachHandlers();
    
    if (this.user && this.user.role === 'admin') {
      this.loadAdminData();
    } else if (this.user) {
      this.loadMyOrders();
    }
  }

  renderMainLayout() {
    const isLoggedIn = !!this.token && !!this.user;
    const isAdmin = this.user?.role === 'admin';
    
    return `
      <div class="min-h-screen bg-gray-50">
        <!-- Header with Honest Pharmco Branding -->
        <header class="bg-gradient-to-r from-gray-800 to-gray-600 shadow-lg">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
              <!-- Logo and Brand -->
              <div class="flex items-center space-x-4">
                <div class="bg-white rounded-full p-2 shadow-md">
                  <i class="fas fa-cannabis text-3xl text-gray-700"></i>
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-white tracking-wider">HONEST PHARM CO</h1>
                  <p class="text-xs text-gray-300 tracking-widest">LOCALLY GROWN • FAMILY OWNED</p>
                </div>
              </div>
              
              <!-- User Controls -->
              <div class="flex items-center space-x-4">
                ${isLoggedIn ? `
                  <span class="text-sm text-gray-200">Welcome, ${this.user.contact_name || this.user.email}</span>
                  ${!isAdmin ? `
                    <button id="cartBtn" class="relative p-2 text-white hover:text-gray-200 transition">
                      <i class="fas fa-shopping-cart text-xl"></i>
                      <span id="cartCount" class="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        ${this.cart.length}
                      </span>
                    </button>
                  ` : ''}
                  <button id="logoutBtn" class="px-4 py-2 text-sm bg-white text-gray-800 rounded-md hover:bg-gray-100 transition">
                    Logout
                  </button>
                ` : `
                  <button id="showLoginBtn" class="px-4 py-2 text-sm bg-white text-gray-800 rounded-md hover:bg-gray-100 transition">
                    Sign In / Register
                  </button>
                `}
              </div>
            </div>
          </div>
        </header>

        <!-- Sub-header Banner -->
        <div class="bg-gradient-to-r from-green-600 to-green-500 text-white py-3">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">
                <i class="fas fa-award mr-2"></i>
                Premium Quality Cannabis Products • Licensed NY State Cultivator (OCM-CULT-24-000099)
              </p>
              <p class="text-sm">
                <i class="fas fa-map-marker-alt mr-1"></i>
                621 E. Maple Ave, Newark, NY
              </p>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          ${isAdmin ? this.renderAdminDashboard() : this.renderCustomerDashboard()}
        </main>

        <!-- Login Modal -->
        <div id="loginModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          ${this.renderLoginModal()}
        </div>

        <!-- Cart Modal -->
        ${!isAdmin ? this.renderCartModal() : ''}

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-8 mt-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
              <div class="flex justify-center items-center mb-4">
                <i class="fas fa-cannabis text-2xl mr-3"></i>
                <span class="text-xl font-bold tracking-wider">HONEST PHARM CO</span>
              </div>
              <p class="text-sm text-gray-400 mb-2">From Seed to Shelf - Quality You Can Trust</p>
              <div class="flex justify-center space-x-4 mt-4">
                <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-instagram text-xl"></i></a>
                <a href="#" class="text-gray-400 hover:text-white"><i class="fab fa-facebook text-xl"></i></a>
                <a href="#" class="text-gray-400 hover:text-white"><i class="fas fa-envelope text-xl"></i></a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  renderLoginModal() {
    return `
      <div class="bg-white rounded-lg max-w-md w-full mx-4">
        <div class="p-6">
          <!-- Close button -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-800">Welcome to Honest Pharm Co</h2>
            <button id="closeLoginBtn" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <!-- Logo -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full shadow-lg mb-3">
              <i class="fas fa-cannabis text-3xl text-white"></i>
            </div>
            <p class="text-sm text-gray-600">Sign in to place orders</p>
          </div>

          <!-- Tabs -->
          <div class="mb-6">
            <div class="flex border-b">
              <button id="loginTab" class="flex-1 py-2 text-center font-semibold text-gray-800 border-b-2 border-green-600">
                Sign In
              </button>
              <button id="registerTab" class="flex-1 py-2 text-center font-semibold text-gray-500">
                Register
              </button>
            </div>
          </div>

          <!-- Login Form -->
          <div id="loginForm">
            <form id="loginFormElement" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your@email.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" name="password" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••">
              </div>
              <button type="submit"
                class="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-md hover:from-green-700 hover:to-green-600 transition duration-200">
                Sign In
              </button>
            </form>
          </div>

          <!-- Register Form -->
          <div id="registerForm" class="hidden">
            <form id="registerFormElement" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input type="text" name="company_name" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                  <input type="text" name="contact_name" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" name="email" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password * (min 6 characters)</label>
                <input type="password" name="password" required minlength="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" name="phone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" name="address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" name="state" maxlength="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input type="text" name="zip"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
              </div>
              <button type="submit"
                class="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-md hover:from-green-700 hover:to-green-600 transition duration-200">
                Register
              </button>
            </form>
          </div>

          <!-- Messages -->
          <div id="authMessage" class="mt-4"></div>
        </div>
      </div>
    `;
  }

  renderAdminDashboard() {
    return `
      <div class="space-y-8">
        <!-- Admin Controls -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
              <h3 class="font-semibold mb-2 text-blue-800">Upload Inventory</h3>
              <input type="file" id="inventoryFile" accept=".xlsx,.xls" class="mb-2 text-sm">
              <button id="uploadInventoryBtn" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <i class="fas fa-upload mr-2"></i>Upload
              </button>
            </div>
            <div class="border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-white">
              <h3 class="font-semibold mb-2 text-orange-800">Pending Approvals</h3>
              <div id="pendingUsers" class="text-3xl font-bold text-orange-600">0</div>
              <button id="viewPendingBtn" class="mt-2 text-orange-600 hover:underline">View Users →</button>
            </div>
            <div class="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-white">
              <h3 class="font-semibold mb-2 text-green-800">Total Orders</h3>
              <div id="totalOrders" class="text-3xl font-bold text-green-600">0</div>
              <button id="viewOrdersBtn" class="mt-2 text-green-600 hover:underline">View All →</button>
            </div>
          </div>
        </div>

        <!-- Pending Users -->
        <div id="pendingUsersSection" class="bg-white rounded-lg shadow p-6 hidden">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Pending User Approvals</h2>
          <div id="pendingUsersList"></div>
        </div>

        <!-- Orders -->
        <div id="ordersSection" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
          <div id="ordersList"></div>
        </div>
      </div>
    `;
  }

  renderCustomerDashboard() {
    const isLoggedIn = !!this.token && !!this.user;
    
    return `
      <div class="space-y-8">
        ${!isLoggedIn ? `
          <!-- Call to Action Banner -->
          <div class="bg-gradient-to-r from-green-600 to-green-500 rounded-lg shadow-lg p-8 text-white">
            <div class="max-w-3xl mx-auto text-center">
              <h2 class="text-3xl font-bold mb-4">Welcome to Honest Pharm Co Online Ordering</h2>
              <p class="text-lg mb-6">Browse our premium cannabis products below. Sign in to place orders and access exclusive features.</p>
              <button onclick="app.showLoginModal()" class="px-8 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition">
                Sign In to Order
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Product Categories -->
        <div class="flex flex-wrap gap-4 justify-center">
          <button class="px-6 py-2 bg-white border-2 border-gray-300 rounded-full hover:border-green-500 transition">
            <i class="fas fa-joint mr-2"></i>Pre-rolls
          </button>
          <button class="px-6 py-2 bg-white border-2 border-gray-300 rounded-full hover:border-green-500 transition">
            <i class="fas fa-tint mr-2"></i>Tinctures
          </button>
          <button class="px-6 py-2 bg-white border-2 border-gray-300 rounded-full hover:border-green-500 transition">
            <i class="fas fa-wind mr-2"></i>Vapes
          </button>
          <button class="px-6 py-2 bg-white border-2 border-gray-300 rounded-full hover:border-green-500 transition">
            <i class="fas fa-cookie-bite mr-2"></i>Edibles
          </button>
        </div>

        <!-- Products Grid -->
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-6">
            ${isLoggedIn ? 'Available Products' : 'Browse Our Products'}
            ${!isLoggedIn ? '<span class="text-sm font-normal text-gray-600 ml-2">(Login required to order)</span>' : ''}
          </h2>
          <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <!-- Products will be loaded here -->
          </div>
        </div>

        ${isLoggedIn ? `
          <!-- My Orders -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">My Recent Orders</h2>
            <div id="myOrdersList"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderCartModal() {
    return `
      <div id="cartModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Shopping Cart</h2>
              <button id="closeCartBtn" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            <div id="cartItems"></div>
            <div class="mt-4 pt-4 border-t">
              <div class="flex justify-between items-center mb-4">
                <span class="text-lg font-semibold">Total:</span>
                <span id="cartTotal" class="text-2xl font-bold text-green-600">$0.00</span>
              </div>
              <textarea id="orderNotes" placeholder="Order notes (optional)" 
                class="w-full p-2 border rounded mb-4" rows="3"></textarea>
              <button id="checkoutBtn" class="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded hover:from-green-700 hover:to-green-600">
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachHandlers() {
    // Login/Logout
    document.getElementById('showLoginBtn')?.addEventListener('click', () => {
      this.showLoginModal();
    });

    document.getElementById('closeLoginBtn')?.addEventListener('click', () => {
      this.hideLoginModal();
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      this.logout();
    });

    // Tab switching in login modal
    document.getElementById('loginTab')?.addEventListener('click', () => {
      document.getElementById('loginForm').classList.remove('hidden');
      document.getElementById('registerForm').classList.add('hidden');
      document.getElementById('loginTab').classList.add('text-gray-800', 'border-b-2', 'border-green-600');
      document.getElementById('loginTab').classList.remove('text-gray-500');
      document.getElementById('registerTab').classList.remove('text-gray-800', 'border-b-2', 'border-green-600');
      document.getElementById('registerTab').classList.add('text-gray-500');
    });

    document.getElementById('registerTab')?.addEventListener('click', () => {
      document.getElementById('registerForm').classList.remove('hidden');
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('registerTab').classList.add('text-gray-800', 'border-b-2', 'border-green-600');
      document.getElementById('registerTab').classList.remove('text-gray-500');
      document.getElementById('loginTab').classList.remove('text-gray-800', 'border-b-2', 'border-green-600');
      document.getElementById('loginTab').classList.add('text-gray-500');
    });

    // Login form
    document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await this.login({
        email: formData.get('email'),
        password: formData.get('password')
      });
    });

    // Register form
    document.getElementById('registerFormElement')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await this.register({
        email: formData.get('email'),
        password: formData.get('password'),
        company_name: formData.get('company_name'),
        contact_name: formData.get('contact_name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip')
      });
    });

    // Cart
    document.getElementById('cartBtn')?.addEventListener('click', () => {
      this.showCart();
    });

    document.getElementById('closeCartBtn')?.addEventListener('click', () => {
      this.hideCart();
    });

    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
      this.checkout();
    });

    // Admin handlers
    if (this.user?.role === 'admin') {
      document.getElementById('uploadInventoryBtn')?.addEventListener('click', () => {
        this.uploadInventory();
      });

      document.getElementById('viewPendingBtn')?.addEventListener('click', () => {
        this.loadPendingUsers();
      });

      document.getElementById('viewOrdersBtn')?.addEventListener('click', () => {
        this.loadOrders();
      });
    }
  }

  showLoginModal() {
    document.getElementById('loginModal')?.classList.remove('hidden');
  }

  hideLoginModal() {
    document.getElementById('loginModal')?.classList.add('hidden');
  }

  async login(credentials) {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      if (response.data.success) {
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        this.hideLoginModal();
        this.render();
      }
    } catch (error) {
      this.showMessage('authMessage', error.response?.data?.error || 'Login failed', 'error');
    }
  }

  async register(data) {
    try {
      const response = await axios.post('/api/auth/register', data);
      if (response.data.success) {
        this.showMessage('authMessage', response.data.message, 'success');
        // Switch to login tab
        document.getElementById('loginTab').click();
      }
    } catch (error) {
      this.showMessage('authMessage', error.response?.data?.error || 'Registration failed', 'error');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    this.token = null;
    this.user = null;
    this.cart = [];
    delete axios.defaults.headers.common['Authorization'];
    this.render();
  }

  async loadProducts() {
    try {
      const response = await axios.get('/api/products');
      this.products = response.data;
      this.renderProducts();
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const isLoggedIn = !!this.token && !!this.user;

    grid.innerHTML = this.products.map(product => {
      // Determine category icon
      let categoryIcon = 'fas fa-cannabis';
      if (product.category === 'Pre-rolls') categoryIcon = 'fas fa-joint';
      else if (product.category === 'Tinctures') categoryIcon = 'fas fa-tint';
      else if (product.category === 'Vapes') categoryIcon = 'fas fa-wind';
      else if (product.category === 'Edibles') categoryIcon = 'fas fa-cookie-bite';

      return `
        <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-5 border border-gray-200">
          <div class="mb-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-green-600 uppercase tracking-wider">${product.category || 'Product'}</span>
              <i class="${categoryIcon} text-gray-400"></i>
            </div>
            <h3 class="font-bold text-gray-800 text-sm mb-1 line-clamp-2">${product.product_name}</h3>
            ${product.strain ? `<p class="text-xs text-gray-600 italic">${product.strain}</p>` : ''}
          </div>
          <div class="space-y-2 mb-4">
            ${product.thc_percentage ? `
              <div class="flex items-center text-xs bg-green-50 rounded px-2 py-1">
                <span class="text-gray-600 font-medium">THC:</span>
                <span class="ml-2 font-bold text-green-700">${product.thc_percentage}</span>
              </div>
            ` : ''}
            ${product.case_size ? `
              <div class="flex items-center text-xs bg-gray-50 rounded px-2 py-1">
                <span class="text-gray-600 font-medium">Case:</span>
                <span class="ml-2 font-bold text-gray-700">${product.case_size} units</span>
              </div>
            ` : ''}
          </div>
          <div class="flex justify-between items-center pt-3 border-t">
            <span class="text-xl font-bold text-green-600">$${product.price}</span>
            ${isLoggedIn ? `
              <button onclick="app.addToCart(${product.id})" 
                class="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold rounded hover:from-green-700 hover:to-green-600 transition">
                Add to Cart
              </button>
            ` : `
              <button onclick="app.showLoginModal()" 
                class="px-4 py-2 bg-gray-200 text-gray-600 text-sm font-semibold rounded hover:bg-gray-300 transition">
                Login to Order
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  addToCart(productId) {
    if (!this.token || !this.user) {
      this.showLoginModal();
      return;
    }

    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({
        ...product,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
    this.showNotification('Added to cart!');
  }

  updateCartCount() {
    const countEl = document.getElementById('cartCount');
    if (countEl) {
      countEl.textContent = this.cart.length;
    }
  }

  showCart() {
    const modal = document.getElementById('cartModal');
    if (!modal) return;

    modal.classList.remove('hidden');
    this.renderCartItems();
  }

  hideCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  renderCartItems() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">Your cart is empty</p>';
      totalEl.textContent = '$0.00';
      return;
    }

    let total = 0;
    container.innerHTML = this.cart.map(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      return `
        <div class="flex justify-between items-center py-3 border-b">
          <div class="flex-1">
            <h4 class="font-semibold">${item.product_name}</h4>
            <p class="text-sm text-gray-600">$${item.price} each</p>
          </div>
          <div class="flex items-center space-x-3">
            <button onclick="app.updateQuantity(${item.id}, ${item.quantity - 1})" 
              class="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300">
              <i class="fas fa-minus text-xs"></i>
            </button>
            <span class="w-12 text-center font-semibold">${item.quantity}</span>
            <button onclick="app.updateQuantity(${item.id}, ${item.quantity + 1})"
              class="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300">
              <i class="fas fa-plus text-xs"></i>
            </button>
            <span class="w-20 text-right font-semibold">$${subtotal.toFixed(2)}</span>
            <button onclick="app.removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.renderCartItems();
    }
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
    this.renderCartItems();
  }

  async checkout() {
    if (this.cart.length === 0) {
      this.showNotification('Your cart is empty', 'error');
      return;
    }

    const notes = document.getElementById('orderNotes')?.value;
    const orderData = {
      items: this.cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      notes: notes
    };

    try {
      const response = await axios.post('/api/orders', orderData);
      if (response.data.success) {
        this.cart = [];
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.hideCart();
        this.showNotification(`Order placed successfully! Order #${response.data.order_number}`, 'success');
        this.loadMyOrders();
        this.updateCartCount();
      }
    } catch (error) {
      this.showNotification(error.response?.data?.error || 'Failed to place order', 'error');
    }
  }

  async loadMyOrders() {
    if (!this.token) return;
    
    try {
      const response = await axios.get('/api/orders');
      const container = document.getElementById('myOrdersList');
      if (!container) return;

      if (response.data.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No orders yet</p>';
        return;
      }

      container.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2">Order #</th>
                <th class="text-left py-2">Date</th>
                <th class="text-left py-2">Status</th>
                <th class="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              ${response.data.slice(0, 5).map(order => `
                <tr class="border-b">
                  <td class="py-2 font-mono text-sm">${order.order_number}</td>
                  <td class="py-2">${new Date(order.created_at).toLocaleDateString()}</td>
                  <td class="py-2">
                    <span class="px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }">
                      ${order.status}
                    </span>
                  </td>
                  <td class="py-2 text-right font-semibold">$${order.total_amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }

  async loadAdminData() {
    this.loadPendingUsers();
    this.loadOrders();
  }

  async uploadInventory() {
    const fileInput = document.getElementById('inventoryFile');
    const file = fileInput?.files[0];
    
    if (!file) {
      this.showNotification('Please select a file', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/admin/upload-inventory', formData);
      if (response.data.success) {
        this.showNotification(response.data.message, 'success');
        fileInput.value = '';
        this.loadProducts();
      }
    } catch (error) {
      this.showNotification(error.response?.data?.error || 'Upload failed', 'error');
    }
  }

  async loadPendingUsers() {
    try {
      const response = await axios.get('/api/admin/pending-users');
      const container = document.getElementById('pendingUsersList');
      const countEl = document.getElementById('pendingUsers');
      
      if (countEl) {
        countEl.textContent = response.data.length;
      }

      if (!container) return;

      if (response.data.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No pending approvals</p>';
        return;
      }

      container.innerHTML = response.data.map(user => `
        <div class="flex justify-between items-center p-4 border rounded mb-2">
          <div>
            <p class="font-semibold">${user.company_name}</p>
            <p class="text-sm text-gray-600">${user.contact_name} - ${user.email}</p>
            <p class="text-xs text-gray-500">Registered: ${new Date(user.created_at).toLocaleDateString()}</p>
          </div>
          <button onclick="app.approveUser(${user.id})" 
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Approve
          </button>
        </div>
      `).join('');

      // Show the section
      document.getElementById('pendingUsersSection')?.classList.remove('hidden');
    } catch (error) {
      console.error('Failed to load pending users:', error);
    }
  }

  async approveUser(userId) {
    try {
      const response = await axios.post(`/api/admin/approve-user/${userId}`);
      if (response.data.success) {
        this.showNotification('User approved successfully', 'success');
        this.loadPendingUsers();
      }
    } catch (error) {
      this.showNotification('Failed to approve user', 'error');
    }
  }

  async loadOrders() {
    try {
      const response = await axios.get('/api/orders');
      const container = document.getElementById('ordersList');
      const countEl = document.getElementById('totalOrders');
      
      if (countEl) {
        countEl.textContent = response.data.length;
      }

      if (!container) return;

      if (response.data.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No orders yet</p>';
        return;
      }

      container.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-gray-50">
                <th class="text-left py-2 px-2">Order #</th>
                <th class="text-left py-2">Company</th>
                <th class="text-left py-2">Date</th>
                <th class="text-left py-2">Status</th>
                <th class="text-right py-2 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              ${response.data.map(order => `
                <tr class="border-b hover:bg-gray-50">
                  <td class="py-2 px-2 font-mono text-sm">${order.order_number}</td>
                  <td class="py-2">${order.company_name}</td>
                  <td class="py-2">${new Date(order.created_at).toLocaleDateString()}</td>
                  <td class="py-2">
                    <select onchange="app.updateOrderStatus(${order.id}, this.value)"
                      class="px-2 py-1 border rounded text-sm">
                      <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                      <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                      <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </td>
                  <td class="py-2 px-2 text-right font-semibold">$${order.total_amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }

  async updateOrderStatus(orderId, status) {
    // This would be implemented with an API endpoint
    console.log(`Update order ${orderId} to ${status}`);
    this.showNotification('Order status updated', 'success');
  }

  showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const colorClass = type === 'error' ? 'text-red-600' : 
                      type === 'success' ? 'text-green-600' : 'text-blue-600';
    
    element.innerHTML = `<p class="${colorClass} text-sm mt-2">${message}</p>`;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 
                   type === 'success' ? 'bg-green-500' : 'bg-blue-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HonestPharmcoApp();

  // Set up axios defaults if token exists
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
});