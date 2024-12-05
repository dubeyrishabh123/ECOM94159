const products = [
    { id: 1, title: "Autumn Hoodie", price: 264.9, image: "images/download.jpeg" },
    { id: 2, title: "FUSION HOODIE", price: 295, image: "images/Hoodies-Manufacturer-in-Bangladesh-550x550.jpeg.webp" },
    { id: 3, title: "Chestnut Brown", price: 74.9, image: "images/images.jpeg" },
    { id: 4, title: "Nike Sportswear", price: 80, image: "images/images.jpg" },
    { id: 5, title: "Champion BASIC", price: 48.99, image: "images/images1.jpeg" },
    { id: 6, title: "Autumn Hoodie", price: 395, image: "images/images3.jpeg" },
    { id: 7, title: "CLASSIC CREWNECK", price: 48.99, image: "images/images5.jpeg" },
    { id: 8, title: "TAPE HOODED", price: 79.99, image: "images/images8.jpeg" },
];

const productList = document.getElementById('productList');
const cartItemsElement = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartIcon = document.getElementById('cart-icon');

let cart = JSON.parse(localStorage.getItem("CART")) || [];

// Render products for the product list
function renderProducts() {
    if (!productList) return; // Prevent error if productList doesn't exist
    productList.innerHTML = products.map(product => `
        <div class="product">
            <img src="${product.image}" alt="${product.title}" class="product-img"/>
            <div class="product-info">
                <h2 class="product-title">${product.title}</h2>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <a href="#" class="add-to-cart" data-id="${product.id}">Add to cart</a>
            </div>
        </div>
    `).join("");

    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener("click", addToCart);
    });
}

function addToCart(event) {
    event.preventDefault(); // Prevent default link behavior
    const productID = parseInt(event.target.dataset.id);
    const product = products.find(product => product.id === productID);

    if (product) {
        const existingItem = cart.find(item => item.id === productID);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            const cartItem = {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1,
            };
            cart.push(cartItem);
        } 
        event.target.textContent = "Added";
        saveToLocalStorage();
        renderCartItems();
        updateCartIcon();
        calculateCartTotal();
    }
}

function saveToLocalStorage() {
    localStorage.setItem("CART", JSON.stringify(cart));
    updateCartIcon(); // Update cart icon immediately after saving
}

// Render cart items
function renderCartItems() {
    if (!cartItemsElement) return; // Prevent error if cartItemsElement doesn't exist

    cartItemsElement.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" />
            <div class="cart-item-info">
                <h2 class="cart-item-title">${item.title}</h2>
                <input class="cart-item-quantity" type="number" min="1" value="${item.quantity}" data-id="${item.id}">
            </div>
            <h2 class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</h2>
            <button class="remove-from-cart" data-id="${item.id}">Remove</button>
        </div>
    `).join("");

    const quantityInputs = document.querySelectorAll('.cart-item-quantity');
    const removeButtons = document.querySelectorAll('.remove-from-cart');

    quantityInputs.forEach(input => {
        input.addEventListener('change', updateCartQuantity);
    });

    removeButtons.forEach(button => {
        button.addEventListener('click', removeFromCart);
    });
}

function updateCartQuantity(event) {
    const productID = parseInt(event.target.dataset.id);
    const newQuantity = parseInt(event.target.value);

    const cartItem = cart.find(item => item.id === productID);
    if (cartItem && newQuantity > 0) {
        cartItem.quantity = newQuantity;
    } else {
        cart = cart.filter(item => item.id !== productID);
    }

    saveToLocalStorage();
    renderCartItems();
    calculateCartTotal();
    updateCartIcon();
}

function removeFromCart(event) {
    const productID = parseInt(event.target.dataset.id);
    cart = cart.filter(item => item.id !== productID);

    saveToLocalStorage();
    renderCartItems();
    calculateCartTotal();
    updateCartIcon();
}

function calculateCartTotal() {
    if (!cartTotalElement) return; // Prevent error if cartTotalElement doesn't exist
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
}

// Update the cart icon with the total quantity
function updateCartIcon() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartIcon.setAttribute("data-quantity", totalQuantity);
}

// Ensure the cart icon updates when the cart changes
function updateCartIconOnCartChange() {
    updateCartIcon();
}

// Add an event listener for changes in localStorage (sync between tabs)
window.addEventListener('storage', updateCartIconOnCartChange);

// Initial update of the cart icon
updateCartIcon();

// Ensure rendering based on the current page
if (window.location.pathname.includes('cart.html')) {
    renderCartItems();
    calculateCartTotal();
} else {
    renderProducts();
}
