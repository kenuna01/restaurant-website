// Import menu data (in a real app, this would be from an API)
const orderMenuData = {
    appetizers: [
        {
            id: 1,
            name: "Bruschetta Classica",
            description: "Grilled bread with fresh tomatoes, basil, and garlic",
            price: 12.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
        },
        {
            id: 2,
            name: "Antipasto Platter",
            description: "Selection of Italian meats, cheeses, and marinated vegetables",
            price: 18.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
        },
        {
            id: 3,
            name: "Calamari Fritti",
            description: "Crispy fried squid rings with marinara sauce",
            price: 14.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
        }
    ],
    pasta: [
        {
            id: 4,
            name: "Spaghetti Carbonara",
            description: "Classic Roman pasta with eggs, pancetta, and parmesan",
            price: 22.99,
            image: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg"
        },
        {
            id: 5,
            name: "Fettuccine Alfredo",
            description: "Rich and creamy parmesan sauce with fresh fettuccine",
            price: 19.99,
            image: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg"
        },
        {
            id: 6,
            name: "Penne Arrabbiata",
            description: "Spicy tomato sauce with garlic, chili, and herbs",
            price: 18.99,
            image: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg"
        }
    ],
    pizza: [
        {
            id: 8,
            name: "Margherita Pizza",
            description: "San Marzano tomatoes, fresh mozzarella, and basil",
            price: 18.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
        },
        {
            id: 9,
            name: "Pepperoni Pizza",
            description: "Classic pepperoni with mozzarella and tomato sauce",
            price: 21.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
        }
    ],
    mains: [
        {
            id: 11,
            name: "Chicken Parmigiana",
            description: "Breaded chicken breast with marinara and mozzarella",
            price: 26.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
        },
        {
            id: 12,
            name: "Branzino Mediterranean",
            description: "Pan-seared sea bass with lemon, herbs, and vegetables",
            price: 28.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
        }
    ],
    desserts: [
        {
            id: 14,
            name: "Tiramisu",
            description: "Classic coffee-flavored dessert with mascarpone",
            price: 8.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
        },
        {
            id: 15,
            name: "Cannoli",
            description: "Sicilian pastry tubes filled with sweet ricotta",
            price: 9.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
        }
    ]
};

// Cart management
let cart = [];
const TAX_RATE = 0.08; // 8% tax

// DOM Elements
const categoryBtns = document.querySelectorAll('.category-btn');
const menuItemsContainer = document.getElementById('orderMenuItems');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const subtotalElement = document.getElementById('subtotal');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');

// Initialize order page
document.addEventListener('DOMContentLoaded', () => {
    displayMenuItems('all');
    setupCategoryListeners();
    updateCartDisplay();
});

// Setup category button listeners
function setupCategoryListeners() {
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            setActiveCategory(btn);
            displayMenuItems(category);
        });
    });
}

// Set active category button
function setActiveCategory(activeBtn) {
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Display menu items for ordering
function displayMenuItems(category) {
    menuItemsContainer.innerHTML = '';

    let itemsToShow = [];
    
    if (category === 'all') {
        Object.values(orderMenuData).forEach(categoryItems => {
            itemsToShow.push(...categoryItems);
        });
    } else {
        itemsToShow = orderMenuData[category] || [];
    }

    itemsToShow.forEach(item => {
        const menuItem = createOrderMenuItem(item);
        menuItemsContainer.appendChild(menuItem);
    });
}

// Create order menu item element
function createOrderMenuItem(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'order-menu-item';

    menuItem.innerHTML = `
        <div class="item-image">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-description">${item.description}</div>
            <div class="item-price">$${item.price.toFixed(2)}</div>
        </div>
        <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
            Add to Cart
        </button>
    `;

    return menuItem;
}

// Add item to cart
function addToCart(itemId) {
    // Find the item in menu data
    let item = null;
    Object.values(orderMenuData).forEach(categoryItems => {
        const found = categoryItems.find(menuItem => menuItem.id === itemId);
        if (found) item = found;
    });

    if (!item) return;

    // Check if item already exists in cart
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        });
    }

    updateCartDisplay();
    showAddToCartFeedback();
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
}

// Update item quantity in cart
function updateQuantity(itemId, newQuantity) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
        }
    }
}

// Update cart display
function updateCartDisplay() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = `${totalItems} items`;

    // Update cart items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <p>Add some delicious items to get started!</p>
            </div>
        `;
        checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => createCartItemElement(item)).join('');
        checkoutBtn.disabled = false;
    }

    // Update totals
    updateCartTotals();
}

// Create cart item element
function createCartItemElement(item) {
    return `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `;
}

// Update cart totals
function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Show add to cart feedback
function showAddToCartFeedback() {
    // Create and show a temporary feedback message
    const feedback = document.createElement('div');
    feedback.textContent = 'Item added to cart!';
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--success);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 1001;
        animation: fadeInOut 2s ease-in-out;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(feedback);
    setTimeout(() => {
        document.body.removeChild(feedback);
        document.head.removeChild(style);
    }, 2000);
}

// Checkout functionality
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        // In a real app, this would integrate with a payment processor
        alert(`Thank you for your order!\n\nTotal: ${totalElement.textContent}\n\nYour order will be ready in 25-30 minutes.`);
        
        // Clear cart
        cart = [];
        updateCartDisplay();
    });
}

// Prevent global function errors
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;