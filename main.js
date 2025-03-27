// Local Storage Keys
const STORAGE_KEYS = {
    USERS: 'shop_users',
    PRODUCTS: 'shop_products',
    CATEGORIES: 'shop_categories',
    CART: 'shop_cart',
    WISHLIST: 'shop_wishlist',
    ORDERS: 'shop_orders',
    CURRENT_USER: 'shop_current_user'
};

// Initial Data
const initialCategories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Books' },
    { id: 4, name: 'Home & Kitchen' }
];

// Initial Data
const initialProducts = [
    {
        id: 1,
        name: "Headphones",
        price: 99.99,
        image: "https://m.media-amazon.com/images/I/515X1z3CmML.__AC_SX300_SY300_QL70_ML2_.jpg",
        description: "High-quality headphones ",
        categoryId: 1
    },
    {
        id: 2,
        name: "Smartphone",
        price: 699.99,
        image: "https://m.media-amazon.com/images/I/513QlbbUAZL._AC_SL1000_.jpg",
        description: "Latest model smartphone ",
        categoryId: 1
    },
    {
        id: 3,
        name: "Cotton T-Shirt",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
        description: "Comfortable cotton t-shirt",
        categoryId: 2
    },
    {
        id: 4,
        name: "Kids Wear",
        price: 19.99,
        image: "https://m.media-amazon.com/images/I/81GdX3OHpGL._AC_SX522_.jpg",
        description: "Comfortable cotton wear ",
        categoryId: 2
    }, 
    {
        id: 5,
        name: "Coffee Maker",
        price: 79.99,
        image: "https://m.media-amazon.com/images/I/619e4dEHgSL.__AC_SY300_SX300_QL70_ML2_.jpg",
        description: "A simple set of home kitchen",
        categoryId: 4
    },
    
    {
        id: 6,
        name: "Kitchen set",
        price: 79.99,
        image: "https://m.media-amazon.com/images/I/71nfFlCiIXS._AC_SX569_.jpg",
        description: "A simple set of home kitchen",
        categoryId: 4
    },
    
    {
        id: 7,
        name: "Mienta",
        price: 79.99,
        image: "https://m.media-amazon.com/images/I/51LXNQTZSwL.__AC_SX300_SY300_QL70_ML2_.jpg",
        description: "A simple set of home kitchen",
        categoryId: 4
    },
    
    {
        id: 8,
        name: "Cupcacks",
        price: 79.99,
        image: "https://m.media-amazon.com/images/I/51RM+6ovM4L._AC_.jpg",
        description: "A simple set of home kitchen",
        categoryId: 4
    }
];
const initialAdminUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
};

// State Management
let currentUser = null;
let currentPage = 'products';
let currentCategory = null;
let editingProductId = null;
let editingCategoryId = null;

// Initialize Local Storage
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([initialAdminUser]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }
}

// Storage Helpers
function getFromStorage(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Toast Notification
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), duration);
}

// Validation Helpers
function showError(elementId, message) {
    const errorElement = document.getElementById(`${elementId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(error => error.textContent = '');
}

// Navigation Functions
function showPage(pageId) {
    currentPage = pageId;
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById('products-container').classList.add('hidden');
    
    if (pageId === 'products') {
        document.getElementById('products-container').classList.remove('hidden');
    } else {
        document.getElementById(`${pageId}`).classList.remove('hidden');
    }

    if (pageId === 'admin-products') {
        displayAdminProducts();
    } else if (pageId === 'admin-categories') {
        displayAdminCategories();
    } else if (pageId === 'admin-orders') {
        displayAdminOrders();
    } else if (pageId === 'orders-page') {
        displayUserOrders();
    }
}

// User Management
function handleLogin(event) {
    event.preventDefault();
    clearErrors();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Validation
    let isValid = true;
    if (!email) {
        showError('login-email', 'Email is required');
        isValid = false;
    }
    if (!password) {
        showError('login-password', 'Password is required');
        isValid = false;
    }

    if (!isValid) return false;

    const users = getFromStorage(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
        updateUIForUser();
        showPage('products');
        showToast('Successfully logged in!');
    } else {
        showError('login-email', 'Invalid email or password');
    }

    return false;
}

function handleRegister(event) {
    event.preventDefault();
    clearErrors();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Validation
    let isValid = true;
    if (!name || name.length < 3) {
        showError('register-name', 'Name must be at least 3 characters');
        isValid = false;
    }
    if (!email || !email.includes('@')) {
        showError('register-email', 'Invalid email address');
        isValid = false;
    }
    if (!password || password.length < 6) {
        showError('register-password', 'Password must be at least 6 characters');
        isValid = false;
    }
    if (password !== confirmPassword) {
        showError('register-confirm-password', 'Passwords do not match');
        isValid = false;
    }

    if (!isValid) return false;

    const users = getFromStorage(STORAGE_KEYS.USERS);
    if (users.some(u => u.email === email)) {
        showError('register-email', 'Email already exists');
        return false;
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        role: 'customer'
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    currentUser = newUser;
    saveToStorage(STORAGE_KEYS.CURRENT_USER, newUser);
    updateUIForUser();
    showPage('products');
    showToast('Registration successful!');

    return false;
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    updateUIForUser();
    showPage('products');
    showToast('Successfully logged out!');
}

function updateUIForUser() {
    const accountBtn = document.getElementById('account-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminControls = document.querySelectorAll('.admin-only');
    const customerControls = document.querySelectorAll('.customer-only');

    if (currentUser) {
        accountBtn.textContent = currentUser.name;
        logoutBtn.classList.remove('hidden');
        
        if (currentUser.role === 'admin') {
            adminControls.forEach(el => el.classList.remove('hidden'));
            customerControls.forEach(el => el.classList.add('hidden'));
        } else {
            adminControls.forEach(el => el.classList.add('hidden'));
            customerControls.forEach(el => el.classList.remove('hidden'));
        }
    } else {
        accountBtn.textContent = 'Sign In';
        logoutBtn.classList.add('hidden');
        adminControls.forEach(el => el.classList.add('hidden'));
        customerControls.forEach(el => el.classList.add('hidden'));
    }
}

// Product Management
function displayProducts(categoryId = null) {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const categories = getFromStorage(STORAGE_KEYS.CATEGORIES);
    
    const filteredProducts = categoryId 
        ? products.filter(p => p.categoryId === parseInt(categoryId))
        : products;

    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = filteredProducts.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p><small>Category: ${category ? category.name : 'Uncategorized'}</small></p>
                <div class="price">$${product.price.toFixed(2)}</div>
                ${currentUser && currentUser.role === 'customer' ? `
                    <div class="buttons">
                        <button onclick="addToCart(${product.id})">Add to Cart</button>
                        <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">♡</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function displayAdminProducts() {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const categories = getFromStorage(STORAGE_KEYS.CATEGORIES);
    
    const productsList = document.getElementById('admin-products-list');
    productsList.innerHTML = products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p><small>Category: ${category ? category.name : 'Uncategorized'}</small></p>
                <div class="price">$${product.price.toFixed(2)}</div>
                <div class="buttons">
                    <button onclick="editProduct(${product.id})">Edit</button>
                    <button onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function showProductForm() {
    document.getElementById('product-form').classList.remove('hidden');
    document.getElementById('product-form-title').textContent = 
        editingProductId ? 'Edit Product' : 'Add New Product';

    if (editingProductId) {
        const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
        const product = products.find(p => p.id === editingProductId);
        if (product) {
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-category').value = product.categoryId;
            document.getElementById('product-image').value = product.image;
        }
    }

    // Populate categories dropdown
    const categories = getFromStorage(STORAGE_KEYS.CATEGORIES);
    const categorySelect = document.getElementById('product-category');
    categorySelect.innerHTML = categories.map(category =>
        `<option value="${category.id}">${category.name}</option>`
    ).join('');
}

function hideProductForm() {
    document.getElementById('product-form').classList.add('hidden');
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-description').value = '';
    document.getElementById('product-image').value = '';
    editingProductId = null;
}

function handleProductSubmit(event) {
    event.preventDefault();
    clearErrors();

    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const categoryId = parseInt(document.getElementById('product-category').value);
    const image = document.getElementById('product-image').value;

    // Validation
    let isValid = true;
    if (!name || name.length < 3) {
        showError('product-name', 'Name must be at least 3 characters');
        isValid = false;
    }
    if (!price || price < 0) {
        showError('product-price', 'Price must be a positive number');
        isValid = false;
    }
    if (!description || description.length < 10) {
        showError('product-description', 'Description must be at least 10 characters');
        isValid = false;
    }
    if (!image || !image.startsWith('http')) {
        showError('product-image', 'Please enter a valid image URL');
        isValid = false;
    }

    if (!isValid) return false;

    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    
    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = { ...products[index], name, price, description, categoryId, image };
        }
    } else {
        const newProduct = {
            id: products.length + 1,
            name,
            price,
            description,
            categoryId,
            image
        };
        products.push(newProduct);
    }

    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    hideProductForm();
    displayAdminProducts();
    showToast(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');

    return false;
}

function editProduct(productId) {
    editingProductId = productId;
    showProductForm();
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
        const updatedProducts = products.filter(p => p.id !== productId);
        saveToStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
        displayAdminProducts();
        showToast('Product deleted successfully!');
    }
}

// Category Management
function displayCategories() {
    const categories = getFromStorage(STORAGE_KEYS.CATEGORIES);
    const categoryList = document.getElementById('category-list');
    
    categoryList.innerHTML = categories.map(category =>
        `<li data-category="${category.id}" onclick="filterProducts(${category.id})">${category.name}</li>`
    ).join('');
}

function displayAdminCategories() {
    const categories = getFromStorage(STORAGE_KEYS.CATEGORIES);
    const categoriesList = document.getElementById('admin-categories-list');
    
    categoriesList.innerHTML = categories.map(category => `
        <div class="category-item">
            <h3>${category.name}</h3>
            <div class="buttons">
                <button onclick="editCategory(${category.id})">Edit</button>
                <button onclick="deleteCategory(${category.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function showCategoryForm() {
    document.getElementById('category-form').classList.remove('hidden');
    document.getElementById('category-form-title').textContent = 
        editingCategoryId ? 'Edit Category' : 'Add New Category';

    if (editingCategoryId) {
        const categories = getFromStorage(STORAGE_KEYS.CATEGORIES);
        const category = categories.find(c => c.id === editingCategoryId);
        if (category) {
            document.getElementById('category-name').value = category.name;
        }
    }
}

function hideCategoryForm() {
    document.getElementById('category-form').classList.add('hidden');
    document.getElementById('category-name').value = '';
    editingCategoryId = null;
}

function handleCategorySubmit(event) {
    event.preventDefault();
    clearErrors();

    const name = document.getElementById('category-name').value;

    // Validation
    if (!name || name.length < 3) {
        showError('category-name', 'Name must be at least 3 characters');
        return false;
    }

    const categories = getFromStorage(STORAGE_KEYS.CATEGORIES);
    
    if (editingCategoryId) {
        const index = categories.findIndex(c => c.id === editingCategoryId);
        if (index !== -1) {
            categories[index] = { ...categories[index], name };
        }
    } else {
        const newCategory = {
            id: categories.length + 1,
            name
        };
        categories.push(newCategory);
    }

    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    hideCategoryForm();
    displayCategories();
    displayAdminCategories();
    showToast(editingCategoryId ? 'Category updated successfully!' : 'Category added successfully!');

    return false;
}

function editCategory(categoryId) {
    editingCategoryId = categoryId;
    showCategoryForm();
}

function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        const categories = getFromStorage(STORAGE_KEYS.CATEGORIES);
        const updatedCategories = categories.filter(c => c.id !== categoryId);
        saveToStorage(STORAGE_KEYS.CATEGORIES, updatedCategories);
        displayCategories();
        displayAdminCategories();
        showToast('Category deleted successfully!');
    }
}

// Wishlist Management
function getWishlist() {
    return currentUser 
        ? JSON.parse(localStorage.getItem(`${STORAGE_KEYS.WISHLIST}_${currentUser.id}`) || '[]') 
        : [];
}

function saveWishlist(wishlist) {
    if (currentUser) {
        localStorage.setItem(`${STORAGE_KEYS.WISHLIST}_${currentUser.id}`, JSON.stringify(wishlist));
        updateWishlistCount();
        updateWishlistUI(); // تحديث الواجهة فورًا
    }
}

function toggleWishlist(productId) {
    if (!currentUser) {
        showToast('Please sign in to add items to wishlist');
        return;
    }

    const wishlist = getWishlist();
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const product = products.find(p => p.id === productId);
    const index = wishlist.findIndex(item => item.id === productId);

    if (index === -1) {
        wishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });
        showToast('Item added to wishlist!');
    } else {
        wishlist.splice(index, 1);
        showToast('Item removed from wishlist!');
    }

    saveWishlist(wishlist);
    if (currentPage === 'wishlist-page') {
        updateWishlistUI(); // تحديث الواجهة إذا كنا في صفحة الـ Wishlist
    }
}

function updateWishlistUI() {
    const wishlist = getWishlist();
    const wishlistContainer = document.getElementById("wishlist-items");
    wishlistContainer.innerHTML = "";

    wishlist.forEach((product, index) => {
        let item = document.createElement("div");
        item.innerHTML = `
            <img src="${product.image}" alt="${product.name}" style="width: 50px;">
            <p>${product.name} - $${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
            <button onclick="toggleWishlist(${product.id})">Delete</button>
        `;
        wishlistContainer.appendChild(item);
    });
}

function updateWishlistCount() {
    const wishlist = getWishlist();
    document.getElementById('wishlist-count').textContent = wishlist.length;
}

// Cart Management
function getCart() {
    return currentUser 
        ? JSON.parse(localStorage.getItem(`${STORAGE_KEYS.CART}_${currentUser.id}`) || '[]') 
        : [];
}

function saveCart(cart) {
    if (currentUser) {
        localStorage.setItem(`${STORAGE_KEYS.CART}_${currentUser.id}`, JSON.stringify(cart));
        updateCartCount();
        updateCartUI(); // تحديث الواجهة فورًا
    }
}

function addToCart(productId) {
    if (!currentUser) {
        showToast('Please sign in to add items to cart');
        return;
    }

    const cart = getCart();
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            productId: product.id, 
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1 
        });
    }

    saveCart(cart);
    showToast('Item added to cart!');
}

function removeFromCart(productId) {
    if (!currentUser) {
        showToast('Please sign in to modify cart');
        return;
    }

    // استرجاع السلة بناءً على المستخدم الحالي
    const cart = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.CART}_${currentUser.id}`) || '[]');
    
    // تحويل productId إلى عدد صحيح لضمان المطابقة
    const parsedProductId = parseInt(productId);
    
    // تصفية السلة لإزالة العنصر المطابق
    const updatedCart = cart.filter(item => item.productId !== parsedProductId);

    // التحقق مما إذا تمت إزالة عنصر فعلاً
    if (cart.length === updatedCart.length) {
        console.warn(`لم يتم العثور على منتج بمعرف ${parsedProductId} في السلة`);
        showToast('Item not found in cart!');
        return;
    }

    // حفظ السلة المحدثة في localStorage
    localStorage.setItem(`${STORAGE_KEYS.CART}_${currentUser.id}`, JSON.stringify(updatedCart));
    
    // تحديث الواجهة
    updateCartUI();
    
    // إظهار رسالة تأكيد
    showToast('Item removed from cart!');
    
}

function updateCartUI() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById("cart-items-page");
    const cartTotalElement = document.getElementById("cart-total-page");
    cartItemsContainer.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {
        let itemElement = document.createElement("div");
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 50px;">
            <p>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</p>
            <button onclick="removeFromCart(${item.productId})">🗑 Delete</button>
        `;
        cartItemsContainer.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    cartTotalElement.textContent = total.toFixed(2);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Order Management
function placeOrder() {
    if (!currentUser) {
        showToast('Please sign in to place an order');
        return;
    }

    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }

    const orders = getFromStorage(STORAGE_KEYS.ORDERS);
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    
    const orderItems = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
        };
    });

    const newOrder = {
        id: orders.length + 1,
        userId: currentUser.id,
        items: orderItems,
        total: orderItems.reduce((total, item) => total + (item.price * item.quantity), 0),
        status: 'pending',
        date: new Date().toISOString()
    };

    orders.push(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    
    // Clear cart
    saveCart([]);    
    showToast('Order placed successfully!');
    showPage('orders-page');
}

function displayUserOrders() {
    if (!currentUser) return;

    const orders = getFromStorage(STORAGE_KEYS.ORDERS)
        .filter(order => order.userId === currentUser.id);
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <h3>Order #${order.id}</h3>
                    <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="order-status ${order.status}">${order.status}</div>
            </div>
            <div class="order-products">
                ${order.items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return `
                        <div class="order-product">
                            <p>${product.name} x ${item.quantity}</p>
                            <p>$${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="order-total">
                <strong>Total: $${order.total.toFixed(2)}</strong>
            </div>
        </div>
    `).join('');
}

function displayAdminOrders() {
    const orders = getFromStorage(STORAGE_KEYS.ORDERS);
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const users = getFromStorage(STORAGE_KEYS.USERS);
    
    const ordersList = document.getElementById('admin-orders-list');
    ordersList.innerHTML = orders.map(order => {
        const user = users.find(u => u.id === order.userId);
        return `
            <div class="order-item">
                <div class="order-header">
                    <div>
                        <h3>Order #${order.id}</h3>
                        <p>Customer: ${user ? user.name : 'Unknown'}</p>
                        <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div class="order-status ${order.status}">${order.status}</div>
                </div>
                <div class="order-products">
                    ${order.items.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        return `
                            <div class="order-product">
                                <p>${product.name} x ${item.quantity}</p>
                                <p>$${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="order-total">
                    <strong>Total: $${order.total.toFixed(2)}</strong>
                </div>
                ${order.status === 'pending' ? `
                    <div class="order-actions">
                        <button onclick="updateOrderStatus(${order.id}, 'confirmed')">Confirm</button>
                        <button onclick="updateOrderStatus(${order.id}, 'rejected')">Reject</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function updateOrderStatus(orderId, status) {
    const orders = getFromStorage(STORAGE_KEYS.ORDERS);
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        saveToStorage(STORAGE_KEYS.ORDERS, orders);
        displayAdminOrders();
        showToast(`Order ${status}!`);
    }
}

// Search Function
function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );

    const productsContainer = document.getElementById('products-container');
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<p>No products found</p>';
    } else {
        displayProducts(currentCategory);
    }
}

// Filter Products
function filterProducts(categoryId) {
    currentCategory = categoryId;
    displayProducts(categoryId);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
    
    // Restore user session
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForUser();
    }

    displayCategories();
    displayProducts();
    updateCartCount();
    updateWishlistCount();

    // Event Listeners
    document.getElementById('account-btn').addEventListener('click', () => {
        if (!currentUser) {
            showPage('auth-page');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    document.getElementById('show-register').addEventListener('click', () => {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    document.getElementById('orders-btn').addEventListener('click', () => {
        if (currentUser) {
            showPage('orders-page');
        } else {
            showToast('Please sign in to view orders');
        }
    });

    document.querySelector('.logo').addEventListener('click', () => {
        showPage('products');
    });
});
let cart = JSON.parse(localStorage.getItem("shop_cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("shop_wishlist")) || [];

function saveToLocalStorage() {
    localStorage.setItem("shop_cart", JSON.stringify(cart));
    localStorage.setItem("shop_wishlist", JSON.stringify(wishlist));
}

// إضافة منتج إلى السلة
function addToCart(productId) {
    if (!currentUser) {
        showToast('Please sign in to add items to cart');
        return;
    }

    const products = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const product = products.find(p => p.id === parseInt(productId));

    if (!product || !product.name || !product.price) {
        console.error("المنتج غير صحيح أو غير موجود:", productId);
        showToast('Product not found!');
        return;
    }

    let cart = getCart();
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

  

    saveCart(cart);
    showToast('Item added to cart!');
    updateCartUI();
}



// إضافة منتج إلى قائمة الأمنيات
function addToWishlist(productId, productName, productPrice) {
    wishlist.push({ id: productId, name: productName, price: productPrice });
    saveToLocalStorage();
    updateWishlistUI();
}

// إزالة منتج من قائمة الأمنيات
function removeFromWishlist(productId) {
    if (!currentUser) {
        showToast('Please sign in to modify wishlist');
        return;
    }

    const wishlist = currentUser 
        ? JSON.parse(localStorage.getItem(`${STORAGE_KEYS.WISHLIST}_${currentUser.id}`) || '[]') 
        : [];
    const updatedWishlist = wishlist.filter(item => item.id !== productId);

    if (currentUser) {
        localStorage.setItem(`${STORAGE_KEYS.WISHLIST}_${currentUser.id}`, JSON.stringify(updatedWishlist));
    }
    updateWishlistUI();
    showToast('Item removed from wishlist!');
}

// تحديث واجهة السلة
function updateCartUI() {
    const cartItemsContainer = document.getElementById("cart-items-page");
    const cartTotalElement = document.getElementById("cart-total-page");

    // التحقق من وجود العناصر في الصفحة
    if (!cartItemsContainer || !cartTotalElement) {
        console.error("عناصر السلة غير موجودة في الصفحة!");
        return;
    }

    // استرجاع السلة بناءً على المستخدم الحالي
    const cart = currentUser 
        ? JSON.parse(localStorage.getItem(`${STORAGE_KEYS.CART}_${currentUser.id}`) || '[]') 
        : [];

    // مسح المحتوى الحالي
    cartItemsContainer.innerHTML = "";

    let total = 0;

    // عرض كل عنصر في السلة
    cart.forEach((item, index) => {
        // التحقق من صحة بيانات العنصر
        if (!item.name || !item.price || !item.productId) {
            console.error("خطأ في بيانات المنتج:", item);
            return;
        }

        const itemTotal = parseFloat(item.price) * (item.quantity || 1); // حساب الإجمالي لكل عنصر
        total += itemTotal;

        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";
        itemElement.innerHTML = `
            <p>${item.name} - $${parseFloat(item.price).toFixed(2)} x ${item.quantity || 1}</p>
            <p>الإجمالي: $${itemTotal.toFixed(2)}</p>
            <button onclick="removeFromCart(${item.productId})"> delete</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    // تحديث الإجمالي الكلي
    cartTotalElement.textContent = total.toFixed(2);

    }


// تحديث واجهة قائمة الأمنيات
function updateWishlistUI() {
    const wishlistContainer = document.getElementById("wishlist-items");

    // التحقق من وجود العنصر في الصفحة
    if (!wishlistContainer) {
        console.error("عنصر قائمة الأمنيات 'wishlist-items' غير موجود في الصفحة!");
        return;
    }

    // استرجاع قائمة الأمنيات بناءً على المستخدم الحالي
    const wishlist = currentUser 
        ? JSON.parse(localStorage.getItem(`${STORAGE_KEYS.WISHLIST}_${currentUser.id}`) || '[]') 
        : [];

    // مسح المحتوى الحالي
    wishlistContainer.innerHTML = "";

    wishlist.forEach((product) => {
        if (!product.name || !product.price || !product.id) {
            console.error("خطأ في بيانات المنتج في قائمة الأمنيات:", product);
            return;
        }

        const itemElement = document.createElement("div");
        itemElement.className = "wishlist-item";
        itemElement.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}" style="width: 50px;">
            <div>
                <p>${product.name} - $${parseFloat(product.price).toFixed(2)}</p>
            </div>
            <div>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
                <button onclick="removeFromWishlist(${product.id})">Delete</button>
            </div>
        `;
        wishlistContainer.appendChild(itemElement);
    });

    }

document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    updateWishlistUI();
    
});
