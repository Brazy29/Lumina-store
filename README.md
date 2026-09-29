# Lumina Store

Lumina is a responsive e-commerce storefront demo built with HTML, CSS, and vanilla JavaScript. It has no build step or package dependencies.

## Run Locally

Serve the project root with VS Code Live Server or another static web server, then open the local address it provides. The entry point is `index.html`.

The page loads product images from Unsplash and the Plus Jakarta Sans font from Google Fonts, so an internet connection is needed for those external assets.

## Features

- Responsive storefront with a hero carousel and mobile navigation drawer.
- Product sections for featured items, new arrivals, and best sellers.
- Search, category and catalog filters, and product sorting.
- Product detail views with image selection and quantity controls.
- Cart and wishlist interactions. Their contents persist in browser local storage.
- Demo checkout flow with a simulated order confirmation; no payment or order backend is connected.

## Project Structure

```text
.
|-- index.html       # Storefront markup
|-- css/
|   `-- style.css    # Layout, components, and responsive styles
|-- js/
|   |-- products.js  # Product catalog data
|   `-- app.js       # Rendering and interactive behavior
`-- design/          # Design resources
```

Products are defined in `js/products.js`. The HTML loads that file before `js/app.js`, which reads the `PRODUCTS` array to render the store.