// Contact form functionality
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
    }

    // Add form validation
    setupFormValidation();
});

// Handle contact form submission
function handleFormSubmission(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    // Basic validation
    if (!validateForm(formValues)) {
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate form submission (in real app, this would be an API call)
    setTimeout(() => {
        showSuccessMessage();
        e.target.reset();
        
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Validate form data
function validateForm(formValues) {
    const errors = [];

    // Required fields validation
    if (!formValues.name?.trim()) {
        errors.push('Name is required');
    }

    if (!formValues.email?.trim()) {
        errors.push('Email is required');
    } else if (!isValidEmail(formValues.email)) {
        errors.push('Please enter a valid email address');
    }

    if (!formValues.subject?.trim()) {
        errors.push('Subject is required');
    }

    if (!formValues.message?.trim()) {
        errors.push('Message is required');
    }

    if (errors.length > 0) {
        showErrorMessage(errors.join('\n'));
        return false;
    }

    return true;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Setup form validation (real-time feedback)
function setupFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    field.classList.remove('error');
    
    let isValid = true;
    let errorMessage = '';

    // Field-specific validation
    switch (field.name) {
        case 'name':
            if (!value) {
                isValid = false;
                errorMessage = 'Name is required';
            }
            break;
        case 'email':
            if (!value) {
                isValid = false;
                errorMessage = 'Email is required';
            } else if (!isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'subject':
            if (!value) {
                isValid = false;
                errorMessage = 'Please select a subject';
            }
            break;
        case 'message':
            if (!value) {
                isValid = false;
                errorMessage = 'Message is required';
            } else if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long';
            }
            break;
    }

    if (!isValid) {
        field.classList.add('error');
        showFieldError(field, errorMessage);
    } else {
        clearFieldError({ target: field });
    }
}

// Clear field error on input
function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    // Remove error message if exists
    const errorMessage = field.parentElement.querySelector('.field-error');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Show field-specific error
function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: var(--error);
        font-size: 14px;
        margin-top: 4px;
        display: block;
    `;
    
    field.parentElement.appendChild(errorElement);
}

// Show success message
function showSuccessMessage() {
    showFormMessage('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
}

// Show error message
function showErrorMessage(message) {
    showFormMessage(message, 'error');
}

// Generic message display
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
    const form = document.getElementById('contactForm');
    form.insertBefore(messageElement, form.firstChild);

    // Auto-remove success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.remove();
            }
        }, 5000);
    }
}

// Phone number formatting (optional enhancement)
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', formatPhoneNumber);
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d+)/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d+)/, '($1) $2');
    }
    
    e.target.value = value;
}

// Add CSS for error states
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .form-input.error,
    .form-select.error,
    .form-textarea.error {
        border-color: var(--error);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .field-error {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(errorStyles);