// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }

        // Protect admin routes
        this.protectRoutes();
    }

    // Load users from localStorage or create default users
    loadUsers() {
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            return JSON.parse(savedUsers);
        }

        // Default users for demo
        const defaultUsers = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@bellavista.com',
                password: 'admin123',
                role: 'admin',
                phone: '(555) 123-4567',
                joinDate: new Date().toISOString(),
                orders: [],
                totalSpent: 0
            },
            {
                id: 2,
                name: 'John Customer',
                email: 'customer@example.com',
                password: 'customer123',
                role: 'customer',
                phone: '(555) 987-6543',
                joinDate: new Date().toISOString(),
                orders: [],
                totalSpent: 0
            }
        ];

        this.saveUsers(defaultUsers);
        return defaultUsers;
    }

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Register new user
    async register(userData) {
        try {
            // Validate input
            if (!this.validateRegistration(userData)) {
                throw new Error('Please fill in all required fields correctly');
            }

            // Check if email already exists
            if (this.users.find(user => user.email === userData.email)) {
                throw new Error('Email already registered');
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                name: userData.fullName,
                email: userData.email,
                password: userData.password, // In real app, this would be hashed
                role: 'customer',
                phone: userData.phone,
                joinDate: new Date().toISOString(),
                orders: [],
                totalSpent: 0
            };

            this.users.push(newUser);
            this.saveUsers(this.users);

            // Auto login after registration
            this.currentUser = { ...newUser };
            delete this.currentUser.password; // Don't store password in session
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            return { success: true, user: this.currentUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Login user
    async login(email, password) {
        try {
            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Invalid email or password');
            }

            this.currentUser = { ...user };
            delete this.currentUser.password; // Don't store password in session
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            return { success: true, user: this.currentUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = '/login.html';
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Protect admin routes
    protectRoutes() {
        const currentPath = window.location.pathname;
        
        // Admin routes
        if (currentPath.includes('/admin/')) {
            if (!this.isLoggedIn()) {
                window.location.href = '/login.html';
                return;
            }
            
            if (!this.isAdmin()) {
                alert('Access denied. Admin privileges required.');
                window.location.href = '/index.html';
                return;
            }
        }

        // Redirect logged-in users away from auth pages
        if ((currentPath.includes('login.html') || currentPath.includes('register.html')) && this.isLoggedIn()) {
            if (this.isAdmin()) {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/index.html';
            }
        }
    }

    // Validate registration data
    validateRegistration(data) {
        if (!data.fullName || data.fullName.trim().length < 2) return false;
        if (!data.email || !this.isValidEmail(data.email)) return false;
        if (!data.phone || data.phone.trim().length < 10) return false;
        if (!data.password || data.password.length < 6) return false;
        if (data.password !== data.confirmPassword) return false;
        return true;
    }

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Update user data
    updateUser(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.saveUsers(this.users);
            
            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = { ...this.currentUser, ...updates };
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
        }
    }

    // Get all users (admin only)
    getAllUsers() {
        if (!this.isAdmin()) return [];
        return this.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Form handlers
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Update navigation based on auth state
    updateNavigation();
});

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const result = await auth.login(email, password);
        
        if (result.success) {
            // Redirect based on user role
            if (result.user.role === 'admin') {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/index.html';
            }
        } else {
            showFormError(result.error);
        }
    } catch (error) {
        showFormError('Login failed. Please try again.');
    } finally {
        // Restore button state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const result = await auth.register(userData);
        
        if (result.success) {
            showFormSuccess('Account created successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            showFormError(result.error);
        }
    } catch (error) {
        showFormError('Registration failed. Please try again.');
    } finally {
        // Restore button state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Show form error message
function showFormError(message) {
    showFormMessage(message, 'error');
}

// Show form success message
function showFormSuccess(message) {
    showFormMessage(message, 'success');
}

// Generic form message display
function showFormMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;

    // Insert at top of form
    const form = document.querySelector('.auth-form');
    if (form) {
        form.insertBefore(messageElement, form.firstChild);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentElement) {
            messageElement.remove();
        }
    }, 5000);
}

// Update navigation based on authentication state
function updateNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    if (auth.isLoggedIn()) {
        const user = auth.getCurrentUser();
        
        // Add user menu
        const userMenu = document.createElement('li');
        userMenu.className = 'nav-item';
        userMenu.innerHTML = `
            <div class="user-menu">
                <span class="user-name">Welcome, ${user.name}</span>
                ${user.role === 'admin' ? '<a href="/admin/dashboard.html" class="nav-link">Admin</a>' : ''}
                <button class="btn btn-secondary btn-small" onclick="auth.logout()">Logout</button>
            </div>
        `;
        
        navMenu.appendChild(userMenu);
    } else {
        // Add login/register links
        const authMenu = document.createElement('li');
        authMenu.className = 'nav-item';
        authMenu.innerHTML = `
            <div class="auth-menu">
                <a href="/login.html" class="nav-link">Login</a>
                <a href="/register.html" class="btn btn-primary btn-small">Sign Up</a>
            </div>
        `;
        
        navMenu.appendChild(authMenu);
    }
}

// Global logout function
function logout() {
    auth.logout();
}

// Export auth system for use in other scripts
window.auth = auth;