// Customer Management System
class CustomerManager {
    constructor() {
        this.customers = auth.getAllUsers().filter(user => user.role === 'customer');
        this.init();
    }

    init() {
        this.displayCustomers();
        this.setupEventListeners();
        this.updateCustomerStats();
    }

    // Setup event listeners
    setupEventListeners() {
        // Search filter
        const searchCustomers = document.getElementById('searchCustomers');
        if (searchCustomers) {
            searchCustomers.addEventListener('input', () => this.displayCustomers());
        }

        // Sort filter
        const sortCustomers = document.getElementById('sortCustomers');
        if (sortCustomers) {
            sortCustomers.addEventListener('change', () => this.displayCustomers());
        }
    }

    // Display customers with filters and sorting
    displayCustomers() {
        const tableBody = document.getElementById('customersTableBody');
        if (!tableBody) return;

        const searchTerm = document.getElementById('searchCustomers')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortCustomers')?.value || 'name';

        let filteredCustomers = [...this.customers];

        // Apply search filter
        if (searchTerm) {
            filteredCustomers = filteredCustomers.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filteredCustomers.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'email':
                    return a.email.localeCompare(b.email);
                case 'orders':
                    return (b.orders?.length || 0) - (a.orders?.length || 0);
                case 'joined':
                    return new Date(b.joinDate) - new Date(a.joinDate);
                default:
                    return 0;
            }
        });

        if (filteredCustomers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--medium-gray);">
                        No customers found
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = filteredCustomers.map(customer => this.createCustomerRow(customer)).join('');
    }

    // Create customer table row
    createCustomerRow(customer) {
        const joinDate = new Date(customer.joinDate).toLocaleDateString();
        const orderCount = customer.orders?.length || 0;
        const totalSpent = customer.totalSpent || 0;
        const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();

        return `
            <tr>
                <td>
                    <div class="customer-info">
                        <div class="customer-avatar">${initials}</div>
                        <div class="customer-details">
                            <h4>${customer.name}</h4>
                            <p>ID: ${customer.id}</p>
                        </div>
                    </div>
                </td>
                <td>${customer.email}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${orderCount}</td>
                <td>$${totalSpent.toFixed(2)}</td>
                <td>${joinDate}</td>
                <td>
                    <div class="customer-actions">
                        <button class="btn btn-secondary btn-small" onclick="customerManager.viewCustomerDetails(${customer.id})">
                            View
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // View customer details in modal
    viewCustomerDetails(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        const modal = document.getElementById('customerModal');
        const modalTitle = document.getElementById('customerModalTitle');
        const modalContent = document.getElementById('customerModalContent');

        modalTitle.textContent = `${customer.name} - Customer Details`;

        // Get customer's orders
        const customerOrders = adminDashboard.orders.filter(order => order.customerId === customerId);
        const recentOrders = customerOrders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);

        const joinDate = new Date(customer.joinDate).toLocaleDateString();
        const orderCount = customer.orders?.length || 0;
        const totalSpent = customer.totalSpent || 0;

        modalContent.innerHTML = `
            <div class="customer-details">
                <div class="customer-info-section">
                    <h3>Customer Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Name:</strong> ${customer.name}
                        </div>
                        <div class="info-item">
                            <strong>Email:</strong> ${customer.email}
                        </div>
                        <div class="info-item">
                            <strong>Phone:</strong> ${customer.phone || 'N/A'}
                        </div>
                        <div class="info-item">
                            <strong>Customer ID:</strong> ${customer.id}
                        </div>
                        <div class="info-item">
                            <strong>Join Date:</strong> ${joinDate}
                        </div>
                        <div class="info-item">
                            <strong>Status:</strong> 
                            <span class="customer-status active">Active</span>
                        </div>
                    </div>
                </div>

                <div class="customer-stats-section">
                    <h3>Customer Statistics</h3>
                    <div class="stats-row">
                        <div class="stat-item">
                            <div class="stat-value">${orderCount}</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">$${totalSpent.toFixed(2)}</div>
                            <div class="stat-label">Total Spent</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">$${orderCount > 0 ? (totalSpent / orderCount).toFixed(2) : '0.00'}</div>
                            <div class="stat-label">Average Order</div>
                        </div>
                    </div>
                </div>

                <div class="customer-orders-section">
                    <h3>Recent Orders</h3>
                    ${recentOrders.length > 0 ? `
                        <div class="recent-orders-list">
                            ${recentOrders.map(order => `
                                <div class="recent-order-item">
                                    <div class="order-info">
                                        <div class="order-id">${order.id}</div>
                                        <div class="order-date">${new Date(order.orderDate).toLocaleDateString()}</div>
                                    </div>
                                    <div class="order-details">
                                        <div class="order-total">$${order.total.toFixed(2)}</div>
                                        <div class="order-status ${order.status}">${order.status}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${customerOrders.length > 5 ? `
                            <p class="more-orders">And ${customerOrders.length - 5} more orders...</p>
                        ` : ''}
                    ` : `
                        <p class="no-orders">No orders found for this customer.</p>
                    `}
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    // Update customer statistics
    updateCustomerStats() {
        const totalCustomersElement = document.getElementById('totalCustomersCount');
        const activeCustomersElement = document.getElementById('activeCustomersCount');

        if (totalCustomersElement) {
            totalCustomersElement.textContent = this.customers.length;
        }

        if (activeCustomersElement) {
            // For demo purposes, consider all customers as active
            // In a real app, you might have logic to determine active customers
            activeCustomersElement.textContent = this.customers.length;
        }
    }

    // Close customer modal
    closeCustomerModal() {
        document.getElementById('customerModal').style.display = 'none';
    }

    // Refresh customer data
    refreshCustomers() {
        this.customers = auth.getAllUsers().filter(user => user.role === 'customer');
        this.displayCustomers();
        this.updateCustomerStats();
    }
}

// Initialize customer manager
const customerManager = new CustomerManager();

// Global functions for HTML onclick handlers
function closeCustomerModal() {
    customerManager.closeCustomerModal();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('customerModal');
    if (e.target === modal) {
        closeCustomerModal();
    }
});

// Add additional CSS for customer management
const customerStyles = document.createElement('style');
customerStyles.textContent = `
    .customer-actions {
        display: flex;
        gap: 8px;
    }
    
    .customer-details {
        display: grid;
        gap: 32px;
    }
    
    .customer-status.active {
        color: var(--success);
        font-weight: 600;
    }
    
    .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 20px;
    }
    
    .stat-item {
        text-align: center;
        padding: 20px;
        background-color: var(--light-gray);
        border-radius: 8px;
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-red);
        margin-bottom: 4px;
    }
    
    .stat-label {
        color: var(--medium-gray);
        font-size: 14px;
    }
    
    .recent-orders-list {
        display: grid;
        gap: 12px;
    }
    
    .recent-order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background-color: var(--light-gray);
        border-radius: 8px;
        border-left: 4px solid var(--primary-red);
    }
    
    .order-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .order-id {
        font-weight: 600;
        color: var(--black);
    }
    
    .order-date {
        color: var(--medium-gray);
        font-size: 14px;
    }
    
    .order-details {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
    }
    
    .order-total {
        font-weight: 600;
        color: var(--primary-red);
    }
    
    .more-orders {
        text-align: center;
        color: var(--medium-gray);
        font-style: italic;
        margin-top: 16px;
    }
    
    .no-orders {
        text-align: center;
        color: var(--medium-gray);
        padding: 40px 20px;
    }
`;
document.head.appendChild(customerStyles);

// Make customer manager globally available
window.customerManager = customerManager;