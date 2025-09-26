// Menu builder data and functionality
const builderMenuData = {
    appetizer: [
        { id: 'app1', name: 'Bruschetta Classica', price: 12.99 },
        { id: 'app2', name: 'Antipasto Platter', price: 18.99 },
        { id: 'app3', name: 'Calamari Fritti', price: 14.99 },
        { id: 'app4', name: 'Caprese Salad', price: 13.99 }
    ],
    main: [
        { id: 'main1', name: 'Spaghetti Carbonara', price: 22.99 },
        { id: 'main2', name: 'Margherita Pizza', price: 18.99 },
        { id: 'main3', name: 'Chicken Parmigiana', price: 26.99 },
        { id: 'main4', name: 'Branzino Mediterranean', price: 28.99 },
        { id: 'main5', name: 'Osso Buco', price: 32.99 }
    ],
    dessert: [
        { id: 'dessert1', name: 'Tiramisu', price: 8.99 },
        { id: 'dessert2', name: 'Panna Cotta', price: 7.99 },
        { id: 'dessert3', name: 'Cannoli', price: 9.99 },
        { id: 'dessert4', name: 'Gelato Selection', price: 6.99 }
    ],
    beverage: [
        { id: 'bev1', name: 'Italian Wine (Glass)', price: 8.99 },
        { id: 'bev2', name: 'Sparkling Water', price: 3.99 },
        { id: 'bev3', name: 'Espresso', price: 4.99 },
        { id: 'bev4', name: 'Italian Soda', price: 4.99 }
    ]
};

// Current menu state
let customMenu = {
    name: '',
    courses: [],
    selections: {},
    servingSize: 1,
    specialRequests: ''
};

// DOM Elements
const courseCheckboxes = document.querySelectorAll('input[name="courses"]');
const courseSelections = document.getElementById('courseSelections');
const previewContent = document.getElementById('previewContent');
const previewPrice = document.getElementById('previewPrice');
const menuNameInput = document.getElementById('menuName');
const specialRequestsInput = document.getElementById('specialRequests');
const servingSizeSelect = document.getElementById('servingSize');
const resetMenuBtn = document.getElementById('resetMenu');
const saveMenuBtn = document.getElementById('saveMenu');

// Initialize build menu page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updatePreview();
});

// Setup all event listeners
function setupEventListeners() {
    // Course selection checkboxes
    courseCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCourseSelection);
    });

    // Menu customization inputs
    if (menuNameInput) {
        menuNameInput.addEventListener('input', (e) => {
            customMenu.name = e.target.value;
            updatePreview();
        });
    }

    if (specialRequestsInput) {
        specialRequestsInput.addEventListener('input', (e) => {
            customMenu.specialRequests = e.target.value;
        });
    }

    if (servingSizeSelect) {
        servingSizeSelect.addEventListener('change', (e) => {
            customMenu.servingSize = parseInt(e.target.value);
            updatePreview();
        });
    }

    // Action buttons
    if (resetMenuBtn) {
        resetMenuBtn.addEventListener('click', resetMenu);
    }

    if (saveMenuBtn) {
        saveMenuBtn.addEventListener('click', saveMenu);
    }
}

// Handle course selection
function handleCourseSelection(e) {
    const course = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
        if (!customMenu.courses.includes(course)) {
            customMenu.courses.push(course);
            createCourseSection(course);
        }
    } else {
        customMenu.courses = customMenu.courses.filter(c => c !== course);
        delete customMenu.selections[course];
        removeCourseSection(course);
    }

    updatePreview();
    updateSaveButton();
}

// Create course selection section
function createCourseSection(course) {
    const courseSection = document.createElement('div');
    courseSection.className = 'course-section';
    courseSection.id = `course-${course}`;

    const courseName = course.charAt(0).toUpperCase() + course.slice(1);
    const items = builderMenuData[course] || [];

    courseSection.innerHTML = `
        <h4>${courseName}</h4>
        <div class="course-items">
            ${items.map(item => `
                <div class="course-item">
                    <input type="radio" id="${item.id}" name="${course}" value="${item.id}">
                    <label for="${item.id}">
                        <div class="course-item-info">
                            <div class="course-item-name">${item.name}</div>
                            <div class="course-item-price">$${item.price.toFixed(2)}</div>
                        </div>
                    </label>
                </div>
            `).join('')}
        </div>
    `;

    courseSelections.appendChild(courseSection);

    // Add event listeners to radio buttons
    const radioButtons = courseSection.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', handleItemSelection);
    });
}

// Remove course selection section
function removeCourseSection(course) {
    const section = document.getElementById(`course-${course}`);
    if (section) {
        section.remove();
    }
}

// Handle item selection within a course
function handleItemSelection(e) {
    const course = e.target.name;
    const itemId = e.target.value;
    
    customMenu.selections[course] = itemId;
    updatePreview();
    updateSaveButton();
}

// Update menu preview
function updatePreview() {
    if (customMenu.courses.length === 0) {
        previewContent.innerHTML = `
            <div class="preview-empty">
                <p>Select courses to see your menu preview</p>
            </div>
        `;
        previewPrice.textContent = '$0.00';
        return;
    }

    let totalPrice = 0;
    let previewHTML = '';

    // Display menu name
    const displayName = customMenu.name || 'My Custom Menu';
    previewHTML += `<div class="preview-menu-name"><h4>${displayName}</h4></div>`;

    // Display selected courses and items
    customMenu.courses.forEach(course => {
        const selectedItemId = customMenu.selections[course];
        const courseName = course.charAt(0).toUpperCase() + course.slice(1);
        
        previewHTML += `<div class="preview-course">`;
        previewHTML += `<div class="preview-course-title">${courseName}</div>`;

        if (selectedItemId) {
            const item = findItemById(selectedItemId, course);
            if (item) {
                const itemPrice = item.price * customMenu.servingSize;
                totalPrice += itemPrice;
                
                previewHTML += `
                    <div class="preview-item">
                        <span class="preview-item-name">${item.name}</span>
                        <span class="preview-item-price">$${itemPrice.toFixed(2)}</span>
                    </div>
                `;
            }
        } else {
            previewHTML += `<div class="preview-item"><em>No selection made</em></div>`;
        }
        
        previewHTML += `</div>`;
    });

    // Display serving size info
    if (customMenu.servingSize > 1) {
        previewHTML += `<div class="preview-serving-info"><small>Prices shown for ${customMenu.servingSize} people</small></div>`;
    }

    previewContent.innerHTML = previewHTML;
    previewPrice.textContent = `$${totalPrice.toFixed(2)}`;
}

// Find item by ID in a specific course
function findItemById(itemId, course) {
    const items = builderMenuData[course] || [];
    return items.find(item => item.id === itemId);
}

// Update save button state
function updateSaveButton() {
    const hasSelections = Object.keys(customMenu.selections).length > 0;
    const allCoursesSelected = customMenu.courses.every(course => 
        customMenu.selections[course] !== undefined
    );
    
    saveMenuBtn.disabled = !hasSelections || !allCoursesSelected;
}

// Reset menu builder
function resetMenu() {
    // Reset menu state
    customMenu = {
        name: '',
        courses: [],
        selections: {},
        servingSize: 1,
        specialRequests: ''
    };

    // Reset form inputs
    courseCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    if (menuNameInput) menuNameInput.value = '';
    if (specialRequestsInput) specialRequestsInput.value = '';
    if (servingSizeSelect) servingSizeSelect.value = '1';

    // Clear course selections
    courseSelections.innerHTML = '';

    // Update preview
    updatePreview();
    updateSaveButton();
}

// Save custom menu
function saveMenu() {
    if (Object.keys(customMenu.selections).length === 0) {
        alert('Please make at least one selection to save your menu.');
        return;
    }

    // Calculate final details
    let totalPrice = 0;
    const menuItems = [];

    customMenu.courses.forEach(course => {
        const selectedItemId = customMenu.selections[course];
        if (selectedItemId) {
            const item = findItemById(selectedItemId, course);
            if (item) {
                const itemPrice = item.price * customMenu.servingSize;
                totalPrice += itemPrice;
                menuItems.push({
                    course: course,
                    name: item.name,
                    price: itemPrice
                });
            }
        }
    });

    // Create save confirmation
    const menuName = customMenu.name || 'My Custom Menu';
    let confirmationMessage = `Menu saved successfully!\n\n${menuName}\n`;
    confirmationMessage += `For ${customMenu.servingSize} people\n`;
    confirmationMessage += `Total: $${totalPrice.toFixed(2)}\n\n`;
    confirmationMessage += `Items:\n`;
    menuItems.forEach(item => {
        confirmationMessage += `- ${item.name} ($${item.price.toFixed(2)})\n`;
    });

    if (customMenu.specialRequests) {
        confirmationMessage += `\nSpecial Requests: ${customMenu.specialRequests}`;
    }

    alert(confirmationMessage);

    // In a real application, you would save this to a backend
    console.log('Custom menu saved:', customMenu);
}