import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import path from "path";

dotenv.config(); // Load environment variables

const app = express();

// Ensure the Stripe secret key is defined
if (!process.env.stripe_key) {
    throw new Error("Stripe secret key is not defined in the environment variables.");
}

const stripeGateway = new Stripe(process.env.stripe_key); // Initialize Stripe

// Middleware to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public"), { index: false })); // Disable directory listing
app.use(express.json()); // Parse JSON request bodies

// Define routes for HTML pages
app.get("/", (req, res) => res.sendFile("index.html", { root: path.join(__dirname, "public") }));


// Stripe Checkout route
app.post("/stripe-checkout", async (req, res) => {
    try {
        // Validate the items array in the request body
        if (!req.body.items || !Array.isArray(req.body.items)) {
            return res.status(400).send("Invalid items array in the request body.");
        }

        // Create line items for Stripe Checkout
        const lineItems = req.body.items.map((item) => {
            const unitAmount = Math.round(parseFloat(item.price) * 100); // Convert price to cents
            if (isNaN(unitAmount)) {
                throw new Error(`Invalid price for item: ${item.title}`);
            }

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.title || "Untitled Product", // Default title if missing
                        images: item.image ? [item.image] : [], // Handle missing images gracefully
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity > 0 ? item.quantity : 1, // Default to quantity 1 if invalid
            };
        });

        // Create a Stripe Checkout session
        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `http://127.0.0.1:3000/success`, // Redirect to success route
            cancel_url: `http://127.0.0.1:3000/cancel`,   // Redirect to cancel route
            billing_address_collection: "required",
            line_items: lineItems,
        });

        // Respond with the session URL
        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating Stripe checkout session:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Catch-all route for undefined paths to prevent directory listing or "index of" issues
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Start the server
app.listen(3000, () => {
    console.log("Server listening on http://127.0.0.1:3000");
});
