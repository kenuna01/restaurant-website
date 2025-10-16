// Admin Dashboard Functionality
class AdminDashboard {
    constructor() {
        this.orders = this.loadOrders();
        this.menuItems = this.loadMenuItems();
        this.customers = auth.getAllUsers().filter(user => user.role === 'customer');
        this.init();
    }

    init() {
        if (document.getElementById('totalOrders')) {
            this.updateDashboardStats();
            this.loadRecentOrders();
        }
    }

    // Load orders from localStorage
    loadOrders() {
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
            return JSON.parse(savedOrders);
        }

        // Create some demo orders
        const demoOrders = [
            {
                id: 'ORD-001',
                customerId: 2,
                customerName: 'John Customer',
                customerEmail: 'customer@example.com',
                items: [
                    { id: 4, name: 'Spaghetti Carbonara', price: 22.99, quantity: 1 },
                    { id: 8, name: 'Margherita Pizza', price: 18.99, quantity: 1 }
                ],
                subtotal: 41.98,
                tax: 3.36,
                total: 45.34,
                status: 'pending',
                orderDate: new Date().toISOString(),
                notes: 'Extra cheese on pizza'
            },
            {
                id: 'ORD-002',
                customerId: 2,
                customerName: 'John Customer',
                customerEmail: 'customer@example.com',
                items: [
                    { id: 14, name: 'Tiramisu', price: 8.99, quantity: 2 }
                ],
                subtotal: 17.98,
                tax: 1.44,
                total: 19.42,
                status: 'confirmed',
                orderDate: new Date(Date.now() - 86400000).toISOString(),
                notes: ''
            }
        ];

        localStorage.setItem('orders', JSON.stringify(demoOrders));
        return demoOrders;
    }

    // Load menu items from the existing menu data
    loadMenuItems() {
        // Use the menu data from menu.js if available
        if (typeof menuData !== 'undefined') {
            let allItems = [];
            Object.entries(menuData).forEach(([category, items]) => {
                items.forEach(item => {
                    allItems.push({ ...item, category });
                });
            });
            return allItems;
        }
        return [];
    }

    // Update dashboard statistics
    updateDashboardStats() {
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(order => 
            new Date(order.orderDate).toDateString() === today
        );

        // Total orders today
        document.getElementById('totalOrders').textContent = todayOrders.length;

        // Revenue today
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('totalRevenue').textContent = `$${todayRevenue.toFixed(2)}`;

        // Menu items count
        document.getElementById('menuItems').textContent = this.menuItems.length;

        // Total customers
        document.getElementById('totalCustomers').textContent = this.customers.length;
    }

    // Load recent orders for dashboard
    loadRecentOrders() {
        const recentOrdersContainer = document.getElementById('recentOrders');
        if (!recentOrdersContainer) return;

        const recentOrders = this.orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);

        if (recentOrders.length === 0) {
            recentOrdersContainer.innerHTML = '<p class="no-data">No recent orders</p>';
            return;
        }

        recentOrdersContainer.innerHTML = recentOrders.map(order => `
            <div class="recent-order">
                <div class="order-info">
                    <h4>${order.id}</h4>
                    <p>${order.customerName} • $${order.total.toFixed(2)}</p>
                </div>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
        `).join('');
    }

    // Add new order (called from order system)
    addOrder(orderData) {
        const newOrder = {
            id: `ORD-${String(this.orders.length + 1).padStart(3, '0')}`,
            ...orderData,
            orderDate: new Date().toISOString()
        };

        this.orders.push(newOrder);
        this.saveOrders();
        
        // Update customer's order history
        const customer = auth.users.find(u => u.id === orderData.customerId);
        if (customer) {
            customer.orders.push(newOrder.id);
            customer.totalSpent += orderData.total;
            auth.updateUser(customer.id, { 
                orders: customer.orders, 
                totalSpent: customer.totalSpent 
            });
        }

        return newOrder;
    }

    // Save orders to localStorage
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    // Get orders with filters
    getOrders(filters = {}) {
        let filteredOrders = [...this.orders];

        if (filters.status && filters.status !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === filters.status);
        }

        if (filters.date) {
            const filterDate = new Date(filters.date).toDateString();
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.orderDate).toDateString() === filterDate
            );
        }

        return filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }

    // Update order status
    updateOrderStatus(orderId, newStatus) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = newStatus;
            this.saveOrders();
            return true;
        }
        return false;
    }

    // Get order by ID
    getOrderById(orderId) {
        return this.orders.find(order => order.id === orderId);
    }

    // Delete order
    deleteOrder(orderId) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            this.orders.splice(orderIndex, 1);
            this.saveOrders();
            return true;
        }
        return false;
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();

// Make it globally available
window.adminDashboard = adminDashboard;