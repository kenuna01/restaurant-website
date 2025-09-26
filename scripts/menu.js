// Menu Data
const menuData = {
    appetizers: [
        {
            id: 1,
            name: "Bruschetta Classica",
            description: "Grilled bread with fresh tomatoes, basil, and garlic",
            price: 12.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: ["vegetarian", "popular"]
        },
        {
            id: 2,
            name: "Antipasto Platter",
            description: "Selection of Italian meats, cheeses, and marinated vegetables",
            price: 18.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: ["popular"]
        },
        {
            id: 3,
            name: "Calamari Fritti",
            description: "Crispy fried squid rings with marinara sauce",
            price: 14.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: []
        }
    ],
    pasta: [
        {
            id: 4,
            name: "Spaghetti Carbonara",
            description: "Classic Roman pasta with eggs, pancetta, and parmesan",
            price: 22.99,
            image: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg",
            tags: ["popular"]
        },
        {
            id: 5,
            name: "Fettuccine Alfredo",
            description: "Rich and creamy parmesan sauce with fresh fettuccine",
            price: 19.99,
            image: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg",
            tags: ["vegetarian"]
        },
        {
            id: 6,
            name: "Penne Arrabbiata",
            description: "Spicy tomato sauce with garlic, chili, and herbs",
            price: 18.99,
            image: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg",
            tags: ["vegetarian", "spicy"]
        },
        {
            id: 7,
            name: "Lasagna Bolognese",
            description: "Traditional layered pasta with meat sauce and three cheeses",
            price: 24.99,
            image: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg",
            tags: ["popular"]
        }
    ],
    pizza: [
        {
            id: 8,
            name: "Margherita Pizza",
            description: "San Marzano tomatoes, fresh mozzarella, and basil",
            price: 18.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: ["vegetarian", "popular"]
        },
        {
            id: 9,
            name: "Pepperoni Pizza",
            description: "Classic pepperoni with mozzarella and tomato sauce",
            price: 21.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: ["popular"]
        },
        {
            id: 10,
            name: "Quattro Stagioni",
            description: "Four seasons pizza with mushrooms, ham, artichokes, and olives",
            price: 26.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: []
        }
    ],
    mains: [
        {
            id: 11,
            name: "Osso Buco",
            description: "Braised veal shanks with risotto Milanese",
            price: 32.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: []
        },
        {
            id: 12,
            name: "Chicken Parmigiana",
            description: "Breaded chicken breast with marinara and mozzarella",
            price: 26.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: ["popular"]
        },
        {
            id: 13,
            name: "Branzino Mediterranean",
            description: "Pan-seared sea bass with lemon, herbs, and vegetables",
            price: 28.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: []
        }
    ],
    desserts: [
        {
            id: 14,
            name: "Tiramisu",
            description: "Classic coffee-flavored dessert with mascarpone",
            price: 8.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: ["popular"]
        },
        {
            id: 15,
            name: "Panna Cotta",
            description: "Vanilla bean custard with berry compote",
            price: 7.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: ["vegetarian"]
        },
        {
            id: 16,
            name: "Cannoli",
            description: "Sicilian pastry tubes filled with sweet ricotta",
            price: 9.99,
            image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            tags: ["vegetarian"]
        }
    ]
};

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const menuGrid = document.getElementById('menuGrid');

// Current category
let currentCategory = 'all';

// Initialize menu
document.addEventListener('DOMContentLoaded', () => {
    displayMenu('all');
    setupTabListeners();
});

// Setup tab button listeners
function setupTabListeners() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            setActiveTab(btn);
            displayMenu(category);
        });
    });
}

// Set active tab
function setActiveTab(activeBtn) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Display menu items
function displayMenu(category) {
    currentCategory = category;
    menuGrid.innerHTML = '';

    let itemsToShow = [];
    
    if (category === 'all') {
        // Show all items
        Object.values(menuData).forEach(categoryItems => {
            itemsToShow.push(...categoryItems);
        });
    } else {
        // Show specific category
        itemsToShow = menuData[category] || [];
    }

    if (itemsToShow.length === 0) {
        menuGrid.innerHTML = '<div class="menu-empty"><p>No items found in this category.</p></div>';
        return;
    }

    itemsToShow.forEach(item => {
        const menuItem = createMenuItemElement(item);
        menuGrid.appendChild(menuItem);
    });

    // Add animation to new items
    const items = menuGrid.querySelectorAll('.menu-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Create menu item element
function createMenuItemElement(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    const tagsHtml = item.tags.map(tag => `<span class="menu-tag ${tag}">${tag}</span>`).join('');

    menuItem.innerHTML = `
        <div class="menu-item-image">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="menu-item-content">
            <div class="menu-item-header">
                <h3 class="menu-item-title">${item.name}</h3>
                <span class="menu-item-price">$${item.price.toFixed(2)}</span>
            </div>
            <p class="menu-item-description">${item.description}</p>
            <div class="menu-item-tags">
                ${tagsHtml}
            </div>
        </div>
    `;

    return menuItem;
}

// Search functionality (if search input exists)
const searchInput = document.querySelector('#menuSearch');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterMenuItems(searchTerm);
    });
}

// Filter menu items based on search
function filterMenuItems(searchTerm) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const title = item.querySelector('.menu-item-title').textContent.toLowerCase();
        const description = item.querySelector('.menu-item-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = 'flex';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 50);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}