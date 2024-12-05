const payBtn = document.querySelector(".checkout-btn");

payBtn.addEventListener("click", async () => {
    // Retrieve cart from localStorage and validate
    const cartItems = localStorage.getItem("CART");
    if (!cartItems) {
        alert("Your cart is empty. Please add items before proceeding to checkout.");
        return;
    }

    let items;
    try {
        // Parse cart items
        items = JSON.parse(cartItems);

        // Validate that items is a non-empty array
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("Cart is empty or invalid.");
        }
    } catch (err) {
        console.error("Failed to parse cart items from localStorage:", err);
        alert("Error processing cart. Please refresh the page and try again.");
        return;
    }

    // Disable button and show loading indicator
    payBtn.textContent = "Processing...";
    payBtn.disabled = true;

    try {
        // Make fetch request to the server
        const response = await fetch("/stripe-checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ items }),
        });

        // Check if the response is ok (status 200-299)
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        // Parse the response data
        const data = await response.json();

        // Check for the URL and redirect to Stripe Checkout
        if (data.url && data.url.startsWith("http")) {
            window.location.href = data.url; // Redirect to Stripe checkout
        } else {
            console.error("Invalid URL received from the server:", data.url);
            alert("Error during checkout. Please try again.");
        }
    } catch (err) {
        // Enhanced error handling and logging
        if (err instanceof TypeError) {
            console.error("Network or fetch error:", err);
            alert("Network error during checkout. Please try again.");
        } else {
            console.error("Error during checkout:", err);
            alert("An error occurred during checkout. Please try again.");
        }
    } finally {
        // Reset button state
        payBtn.textContent = "Checkout";
        payBtn.disabled = false;
    }
});
