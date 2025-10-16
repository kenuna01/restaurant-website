// Menu Management System
class MenuManager {
    constructor() {
        this.menuItems = this.loadMenuItems();
        this.currentEditingItem = null;
        this.init();
    }

    init() {
        this.displayMenuItems();
        this.setupEventListeners();
    }

    // Load menu items from localStorage or use default data
    loadMenuItems() {
        const savedItems = localStorage.getItem('menuItems');
        if (savedItems) {
            return JSON.parse(savedItems);
        }

        // Use default menu data and convert to flat array
        let allItems = [];
        if (typeof menuData !== 'undefined') {
            Object.entries(menuData).forEach(([category, items]) => {
                items.forEach(item => {
                    allItems.push({ ...item, category });
                });
            });
        }

        this.saveMenuItems(allItems);
        return allItems;
    }

    // Save menu items to localStorage
    saveMenuItems(items = this.menuItems) {
        localStorage.setItem('menuItems', JSON.stringify(items));
        this.menuItems = items;
    }

    // Setup event listeners
    setupEventListeners() {
        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.displayMenuItems());
        }

        // Search filter
        const searchMenu = document.getElementById('searchMenu');
        if (searchMenu) {
            searchMenu.addEventListener('input', () => this.displayMenuItems());
        }

        // Item form submission
        const itemForm = document.getElementById('itemForm');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => this.handleItemSubmission(e));
        }
    }

    // Display menu items with filters
    displayMenuItems() {
        const container = document.getElementById('menuManagementGrid');
        if (!container) return;

        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        const searchTerm = document.getElementById('searchMenu')?.value.toLowerCase() || '';

        let filteredItems = this.menuItems;

        // Apply category filter
        if (categoryFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.category === categoryFilter);
        }

        // Apply search filter
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }

        if (filteredItems.length === 0) {
            container.innerHTML = '<div class="no-items"><p>No menu items found</p></div>';
            return;
        }

        container.innerHTML = filteredItems.map(item => this.createMenuItemCard(item)).join('');
    }

    // Create menu item card HTML
    createMenuItemCard(item) {
        const tags = item.tags ? item.tags.map(tag => 
            `<span class="menu-tag ${tag}">${tag}</span>`
        ).join('') : '';

        return `
            <div class="menu-item-card">
                <div class="menu-item-header">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-meta">
                    <span class="menu-item-category">${item.category}</span>
                    <div class="menu-item-tags">${tags}</div>
                </div>
                <div class="menu-item-actions">
                    <button class="btn btn-secondary btn-small" onclick="menuManager.editItem(${item.id})">
                        Edit
                    </button>
                    <button class="btn btn-error btn-small" onclick="menuManager.deleteItem(${item.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Open add item modal
    openAddItemModal() {
        this.currentEditingItem = null;
        document.getElementById('modalTitle').textContent = 'Add New Menu Item';
        document.getElementById('itemForm').reset();
        document.getElementById('itemModal').style.display = 'block';
    }

    // Edit existing item
    editItem(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;

        this.currentEditingItem = item;
        document.getElementById('modalTitle').textContent = 'Edit Menu Item';
        
        // Populate form
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.description;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemImage').value = item.image || '';
        document.getElementById('itemTags').value = item.tags ? item.tags.join(', ') : '';

        document.getElementById('itemModal').style.display = 'block';
    }

    // Delete item
    deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this menu item?')) return;

        this.menuItems = this.menuItems.filter(item => item.id !== itemId);
        this.saveMenuItems();
        this.displayMenuItems();
        
        this.showNotification('Menu item deleted successfully', 'success');
    }

    // Handle form submission
    handleItemSubmission(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const itemData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            image: formData.get('image') || 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
        };

        if (this.currentEditingItem) {
            // Update existing item
            const itemIndex = this.menuItems.findIndex(item => item.id === this.currentEditingItem.id);
            if (itemIndex !== -1) {
                this.menuItems[itemIndex] = { ...this.currentEditingItem, ...itemData };
                this.showNotification('Menu item updated successfully', 'success');
            }
        } else {
            // Add new item
            const newItem = {
                id: Date.now(),
                ...itemData
            };
            this.menuItems.push(newItem);
            this.showNotification('Menu item added successfully', 'success');
        }

        this.saveMenuItems();
        this.displayMenuItems();
        this.closeItemModal();
    }

    // Close item modal
    closeItemModal() {
        document.getElementById('itemModal').style.display = 'none';
        this.currentEditingItem = null;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background-color: ${type === 'success' ? 'var(--success)' : 'var(--primary-red)'};
            color: white;
            border-radius: 8px;
            z-index: 2001;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    // Get all menu items
    getAllItems() {
        return this.menuItems;
    }

    // Get items by category
    getItemsByCategory(category) {
        return this.menuItems.filter(item => item.category === category);
    }
}

// Initialize menu manager
const menuManager = new MenuManager();

// Global functions for HTML onclick handlers
function openAddItemModal() {
    menuManager.openAddItemModal();
}

function closeItemModal() {
    menuManager.closeItemModal();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('itemModal');
    if (e.target === modal) {
        closeItemModal();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .btn-error {
        background-color: var(--error);
        color: var(--white);
    }
    
    .btn-error:hover {
        background-color: #DC2626;
    }
    
    .no-items {
        text-align: center;
        padding: 60px 20px;
        color: var(--medium-gray);
        grid-column: 1 / -1;
    }
`;
document.head.appendChild(style);

// Make menu manager globally available
window.menuManager = menuManager;