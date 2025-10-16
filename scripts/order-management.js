// Order Management System
class OrderManager {
    constructor() {
        this.orders = adminDashboard.orders;
        this.init();
    }

    init() {
        this.displayOrders();
        this.setupEventListeners();
        this.updateOrderStats();
    }

    // Setup event listeners
    setupEventListeners() {
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.displayOrders());
        }

        // Date filter
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.displayOrders());
        }
    }

    // Display orders with filters
    displayOrders() {
        const container = document.getElementById('ordersGrid');
        if (!container) return;

        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        const dateFilter = document.getElementById('dateFilter')?.value || '';

        const filters = {
            status: statusFilter,
            date: dateFilter
        };

        const filteredOrders = adminDashboard.getOrders(filters);

        if (filteredOrders.length === 0) {
            container.innerHTML = '<div class="no-orders"><p>No orders found</p></div>';
            return;
        }

        container.innerHTML = filteredOrders.map(order => this.createOrderCard(order)).join('');
        this.updateOrderStats();
    }

    // Create order card HTML
    createOrderCard(order) {
        const orderDate = new Date(order.orderDate).toLocaleDateString();
        const orderTime = new Date(order.orderDate).toLocaleTimeString();

        return `
            <div class="order-card">
                <div class="order-card-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
                <div class="order-card-content">
                    <div class="order-detail">
                        <h4>Customer</h4>
                        <p>${order.customerName}</p>
                        <p>${order.customerEmail}</p>
                    </div>
                    <div class="order-detail">
                        <h4>Order Date</h4>
                        <p>${orderDate}</p>
                        <p>${orderTime}</p>
                    </div>
                    <div class="order-detail">
                        <h4>Total</h4>
                        <p>$${order.total.toFixed(2)}</p>
                        <p>${order.items.length} items</p>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-secondary btn-small" onclick="orderManager.viewOrderDetails('${order.id}')">
                        View Details
                    </button>
                    ${this.getStatusActions(order)}
                </div>
            </div>
        `;
    }

    // Get status-specific action buttons
    getStatusActions(order) {
        switch (order.status) {
            case 'pending':
                return `
                    <button class="btn btn-primary btn-small" onclick="orderManager.updateStatus('${order.id}', 'confirmed')">
                        Confirm
                    </button>
                    <button class="btn btn-error btn-small" onclick="orderManager.updateStatus('${order.id}', 'cancelled')">
                        Cancel
                    </button>
                `;
            case 'confirmed':
                return `
                    <button class="btn btn-primary btn-small" onclick="orderManager.updateStatus('${order.id}', 'preparing')">
                        Start Preparing
                    </button>
                `;
            case 'preparing':
                return `
                    <button class="btn btn-primary btn-small" onclick="orderManager.updateStatus('${order.id}', 'ready')">
                        Mark Ready
                    </button>
                `;
            case 'ready':
                return `
                    <button class="btn btn-success btn-small" onclick="orderManager.updateStatus('${order.id}', 'completed')">
                        Complete Order
                    </button>
                `;
            default:
                return '';
        }
    }

    // View order details in modal
    viewOrderDetails(orderId) {
        const order = adminDashboard.getOrderById(orderId);
        if (!order) return;

        const modal = document.getElementById('orderModal');
        const modalTitle = document.getElementById('orderModalTitle');
        const modalContent = document.getElementById('orderModalContent');

        modalTitle.textContent = `Order ${order.id} Details`;

        const orderDate = new Date(order.orderDate).toLocaleString();

        modalContent.innerHTML = `
            <div class="order-details">
                <div class="order-info-section">
                    <h3>Order Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Order ID:</strong> ${order.id}
                        </div>
                        <div class="info-item">
                            <strong>Status:</strong> 
                            <span class="order-status ${order.status}">${order.status}</span>
                        </div>
                        <div class="info-item">
                            <strong>Order Date:</strong> ${orderDate}
                        </div>
                        <div class="info-item">
                            <strong>Customer:</strong> ${order.customerName}
                        </div>
                        <div class="info-item">
                            <strong>Email:</strong> ${order.customerEmail}
                        </div>
                        ${order.notes ? `<div class="info-item"><strong>Notes:</strong> ${order.notes}</div>` : ''}
                    </div>
                </div>

                <div class="order-items-section">
                    <h3>Order Items</h3>
                    <div class="order-items-list">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <div class="item-info">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-quantity">x${item.quantity}</span>
                                </div>
                                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="order-summary-section">
                    <h3>Order Summary</h3>
                    <div class="summary-lines">
                        <div class="summary-line">
                            <span>Subtotal:</span>
                            <span>$${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-line">
                            <span>Tax:</span>
                            <span>$${order.tax.toFixed(2)}</span>
                        </div>
                        <div class="summary-line total">
                            <span>Total:</span>
                            <span>$${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="order-actions-section">
                    <h3>Actions</h3>
                    <div class="modal-order-actions">
                        ${this.getModalStatusActions(order)}
                        <button class="btn btn-error" onclick="orderManager.deleteOrder('${order.id}')">
                            Delete Order
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    // Get status actions for modal
    getModalStatusActions(order) {
        const actions = [];
        
        switch (order.status) {
            case 'pending':
                actions.push(`<button class="btn btn-primary" onclick="orderManager.updateStatus('${order.id}', 'confirmed')">Confirm Order</button>`);
                actions.push(`<button class="btn btn-error" onclick="orderManager.updateStatus('${order.id}', 'cancelled')">Cancel Order</button>`);
                break;
            case 'confirmed':
                actions.push(`<button class="btn btn-primary" onclick="orderManager.updateStatus('${order.id}', 'preparing')">Start Preparing</button>`);
                break;
            case 'preparing':
                actions.push(`<button class="btn btn-primary" onclick="orderManager.updateStatus('${order.id}', 'ready')">Mark as Ready</button>`);
                break;
            case 'ready':
                actions.push(`<button class="btn btn-success" onclick="orderManager.updateStatus('${order.id}', 'completed')">Complete Order</button>`);
                break;
        }

        return actions.join('');
    }

    // Update order status
    updateStatus(orderId, newStatus) {
        if (adminDashboard.updateOrderStatus(orderId, newStatus)) {
            this.displayOrders();
            this.closeOrderModal();
            this.showNotification(`Order ${orderId} status updated to ${newStatus}`, 'success');
        } else {
            this.showNotification('Failed to update order status', 'error');
        }
    }

    // Delete order
    deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        if (adminDashboard.deleteOrder(orderId)) {
            this.displayOrders();
            this.closeOrderModal();
            this.showNotification(`Order ${orderId} deleted successfully`, 'success');
        } else {
            this.showNotification('Failed to delete order', 'error');
        }
    }

    // Update order statistics
    updateOrderStats() {
        const allOrders = adminDashboard.orders;
        
        const pendingCount = allOrders.filter(order => order.status === 'pending').length;
        const confirmedCount = allOrders.filter(order => order.status === 'confirmed' || order.status === 'preparing').length;
        const completedCount = allOrders.filter(order => order.status === 'completed').length;

        const pendingElement = document.getElementById('pendingCount');
        const confirmedElement = document.getElementById('confirmedCount');
        const completedElement = document.getElementById('completedCount');

        if (pendingElement) pendingElement.textContent = `${pendingCount} Pending`;
        if (confirmedElement) confirmedElement.textContent = `${confirmedCount} In Progress`;
        if (completedElement) completedElement.textContent = `${completedCount} Completed`;
    }

    // Close order modal
    closeOrderModal() {
        document.getElementById('orderModal').style.display = 'none';
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
            background-color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--primary-red)'};
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
}

// Initialize order manager
const orderManager = new OrderManager();

// Global functions for HTML onclick handlers
function closeOrderModal() {
    orderManager.closeOrderModal();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('orderModal');
    if (e.target === modal) {
        closeOrderModal();
    }
});

// Add additional CSS for order management
const orderStyles = document.createElement('style');
orderStyles.textContent = `
    .no-orders {
        text-align: center;
        padding: 60px 20px;
        color: var(--medium-gray);
        grid-column: 1 / -1;
    }
    
    .btn-success {
        background-color: var(--success);
        color: var(--white);
    }
    
    .btn-success:hover {
        background-color: #059669;
    }
    
    .order-details {
        display: grid;
        gap: 32px;
    }
    
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
    }
    
    .info-item {
        padding: 12px;
        background-color: var(--light-gray);
        border-radius: 6px;
    }
    
    .order-items-list {
        display: grid;
        gap: 12px;
    }
    
    .order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background-color: var(--light-gray);
        border-radius: 6px;
    }
    
    .item-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .item-name {
        font-weight: 600;
    }
    
    .item-quantity {
        color: var(--medium-gray);
        font-size: 14px;
    }
    
    .item-price {
        font-weight: 600;
        color: var(--primary-red);
    }
    
    .summary-lines {
        display: grid;
        gap: 8px;
    }
    
    .summary-line {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
    }
    
    .summary-line.total {
        font-weight: 700;
        font-size: 1.1rem;
        border-top: 2px solid var(--primary-red);
        padding-top: 12px;
    }
    
    .modal-order-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }
`;
document.head.appendChild(orderStyles);

// Make order manager globally available
window.orderManager = orderManager;