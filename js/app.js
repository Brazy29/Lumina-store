const STATE = {
  products: typeof PRODUCTS !== "undefined" ? PRODUCTS : [],
  cart: JSON.parse(localStorage.getItem("lumina_cart")) || [],
  wishlist: JSON.parse(localStorage.getItem("lumina_wishlist")) || [],
  filters: {
    search: "",
    category: "All",
    maxPrice: 1200,
    minRating: 0,
    inStockOnly: false,
    onSaleOnly: false,
  },
  sortBy: "featured",
  activeProductModalId: null,
  activeModalImageIndex: 0,
  modalSelectedQty: 1,
  currentHeroSlide: 0,
  heroInterval: null,
};

const CATEGORY_ICONS = {
  Electronics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
  Fashion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>`,
  Footwear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v-2.38C4 11.5 7 11 11 11c3 0 5 1.5 7 2.5V16"></path><path d="M2 16h20v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3z"></path></svg>`,
  "Home & Living": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  Beauty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
  Sports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M4.93 4.93l4.24 4.24"></path><path d="M14.83 14.83l4.24 4.24"></path><path d="M14.83 9.17l4.24-4.24"></path><path d="M4.93 19.07l4.24-4.24"></path></svg>`,
};

function initApp() {
  initHeroCarousel();
  initCategories();
  renderFeaturedSection();
  renderNewArrivalsSection();
  renderBestSellersSection();
  renderCatalog();
  renderCategoryFilterSidebar();
  updateCartBadge();
  updateWishlistBadge();
  setupEventListeners();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function initHeroCarousel() {
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  const dots = document.querySelectorAll(".carousel-dot");
  const totalSlides = 3;

  function updateSlide(index) {
    STATE.currentHeroSlide = (index + totalSlides) % totalSlides;
    if (track) {
      track.style.transform = `translateX(-${STATE.currentHeroSlide * 100}%)`;
    }
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === STATE.currentHeroSlide);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    STATE.heroInterval = setInterval(() => {
      updateSlide(STATE.currentHeroSlide + 1);
    }, 5500);
  }

  function stopAutoplay() {
    if (STATE.heroInterval) clearInterval(STATE.heroInterval);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      updateSlide(STATE.currentHeroSlide - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      updateSlide(STATE.currentHeroSlide + 1);
      startAutoplay();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      updateSlide(idx);
      startAutoplay();
    });
  });

  const carousel = document.getElementById("heroCarousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
  }

  startAutoplay();
}

function initCategories() {
  const grid = document.getElementById("categoriesGrid");
  if (!grid) return;

  const categories = [
    "Electronics",
    "Fashion",
    "Footwear",
    "Home & Living",
    "Beauty",
    "Sports",
  ];

  grid.innerHTML = categories
    .map((cat) => {
      const count = STATE.products.filter((p) => p.category === cat).length;
      const iconSvg = CATEGORY_ICONS[cat] || CATEGORY_ICONS["Electronics"];
      const isActive = STATE.filters.category === cat;

      return `
      <div class="category-card ${isActive ? "active" : ""}" data-category="${cat}">
        <div class="category-icon-box">
          ${iconSvg}
        </div>
        <h3 class="category-title">${cat}</h3>
        <span class="category-count">${count} Products</span>
      </div>
    `;
    })
    .join("");

  grid.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const cat = card.dataset.category;
      setCategoryFilter(cat);
      scrollToSection("catalog");
    });
  });
}

function renderCategoryFilterSidebar() {
  const list = document.getElementById("categoryFilterList");
  if (!list) return;

  const categories = [
    "All",
    "Electronics",
    "Fashion",
    "Footwear",
    "Home & Living",
    "Beauty",
    "Sports",
  ];

  list.innerHTML = categories
    .map((cat) => {
      const isChecked = STATE.filters.category === cat;
      const count =
        cat === "All"
          ? STATE.products.length
          : STATE.products.filter((p) => p.category === cat).length;

      return `
      <li>
        <label class="filter-label">
          <span class="filter-input-wrap">
            <input type="radio" name="categoryFilter" value="${cat}" ${isChecked ? "checked" : ""}>
            <span>${cat}</span>
          </span>
          <span class="filter-count">${count}</span>
        </label>
      </li>
    `;
    })
    .join("");

  list.querySelectorAll('input[name="categoryFilter"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      setCategoryFilter(e.target.value);
    });
  });
}

function renderProductCardHTML(product) {
  const isWishlisted = STATE.wishlist.some((id) => id === product.id);
  const cartItem = STATE.cart.find((item) => item.id === product.id);
  const starsHTML = generateStarsHTML(product.rating);

  let badgeHTML = "";
  if (product.discount > 0) {
    badgeHTML = `<span class="badge-discount">-${product.discount}%</span>`;
  } else if (product.newArrival) {
    badgeHTML = `<span class="badge-new">NEW</span>`;
  } else if (product.bestSeller) {
    badgeHTML = `<span class="badge-bestseller">POPULAR</span>`;
  }

  let cartBtnHTML = "";
  if (cartItem) {
    cartBtnHTML = `
      <div class="qty-stepper" data-product-id="${product.id}">
        <button type="button" class="qty-step-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
        <span>${cartItem.quantity}</span>
        <button type="button" class="qty-step-btn" data-action="increase" aria-label="Increase quantity">+</button>
      </div>
    `;
  } else {
    cartBtnHTML = `
      <button type="button" class="btn-add-cart" data-product-id="${product.id}" aria-label="Add ${escapeHTML(product.name)} to cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Add to Cart</span>
      </button>
    `;
  }

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="card-media" onclick="openProductModal(${product.id})">
        <div class="card-badges">${badgeHTML}</div>
        <button type="button" class="wishlist-toggle-btn ${isWishlisted ? "is-active" : ""}" 
                onclick="event.stopPropagation(); toggleWishlist(${product.id});" 
                aria-label="Save ${escapeHTML(product.name)} to wishlist">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <img src="${product.image}" alt="${escapeHTML(product.name)}" decoding="async" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';">
      </div>
      <div class="card-body">
        <span class="card-category">${product.category}</span>
        <h3 class="card-title" onclick="openProductModal(${product.id})">${escapeHTML(product.name)}</h3>
        <div class="card-rating">
          <span class="rating-stars">${starsHTML}</span>
          <span class="rating-score">${product.rating.toFixed(1)}</span>
          <span class="rating-count">(${product.reviews})</span>
        </div>
        <div class="card-footer">
          <div class="price-wrapper">
            <span class="current-price">$${product.price.toFixed(2)}</span>
            ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ""}
          </div>
          ${cartBtnHTML}
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedSection() {
  const container = document.getElementById("featuredGrid");
  if (!container) return;
  const items = STATE.products.filter((p) => p.featured).slice(0, 4);
  container.innerHTML = items.map(renderProductCardHTML).join("");
  attachProductCardEvents(container);
}

function renderNewArrivalsSection() {
  const container = document.getElementById("newArrivalsGrid");
  if (!container) return;
  const items = STATE.products.filter((p) => p.newArrival).slice(0, 4);
  container.innerHTML = items.map(renderProductCardHTML).join("");
  attachProductCardEvents(container);
}

function renderBestSellersSection() {
  const container = document.getElementById("bestSellersGrid");
  if (!container) return;
  const items = STATE.products.filter((p) => p.bestSeller).slice(0, 4);
  container.innerHTML = items.map(renderProductCardHTML).join("");
  attachProductCardEvents(container);
}

function renderCatalog() {
  const grid = document.getElementById("catalogProductGrid");
  const emptyState = document.getElementById("catalogEmptyState");
  const resultsCount = document.getElementById("resultsCount");
  if (!grid) return;

  const filtered = getFilteredProducts();
  const sorted = sortProducts(filtered, STATE.sortBy);

  if (resultsCount) {
    resultsCount.innerHTML = `Showing <strong>${sorted.length}</strong> of ${STATE.products.length} products`;
  }

  renderActiveFilterChips();

  if (sorted.length === 0) {
    grid.style.display = "none";
    if (emptyState) emptyState.hidden = false;
  } else {
    grid.style.display = "grid";
    if (emptyState) emptyState.hidden = true;
    grid.innerHTML = sorted.map(renderProductCardHTML).join("");
    attachProductCardEvents(grid);
  }
}

function getFilteredProducts() {
  const { search, category, maxPrice, minRating, inStockOnly, onSaleOnly } =
    STATE.filters;
  const query = search.trim().toLowerCase();

  return STATE.products.filter((product) => {
    if (query) {
      const matchName = product.name.toLowerCase().includes(query);
      const matchCat = product.category.toLowerCase().includes(query);
      const matchBrand = product.brand.toLowerCase().includes(query);
      const matchDesc = product.description.toLowerCase().includes(query);
      if (!matchName && !matchCat && !matchBrand && !matchDesc) return false;
    }

    if (category !== "All" && product.category !== category) {
      return false;
    }

    if (product.price > maxPrice) {
      return false;
    }

    if (minRating > 0 && product.rating < minRating) {
      return false;
    }

    if (inStockOnly && product.stock <= 0) {
      return false;
    }

    if (onSaleOnly && product.discount <= 0) {
      return false;
    }

    return true;
  });
}

function sortProducts(list, sortBy) {
  const copy = [...list];
  switch (sortBy) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort(
        (a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0),
      );
    case "popular":
      return copy.sort((a, b) => b.reviews - a.reviews);
    case "featured":
    default:
      return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}

function renderActiveFilterChips() {
  const container = document.getElementById("activeFilterChips");
  if (!container) return;

  const chips = [];

  if (STATE.filters.search) {
    chips.push({
      label: `Search: "${STATE.filters.search}"`,
      clear: () => setSearchFilter(""),
    });
  }

  if (STATE.filters.category !== "All") {
    chips.push({
      label: `Category: ${STATE.filters.category}`,
      clear: () => setCategoryFilter("All"),
    });
  }

  if (STATE.filters.maxPrice < 1200) {
    chips.push({
      label: `Price ≤ $${STATE.filters.maxPrice}`,
      clear: () => setPriceFilter(1200),
    });
  }

  if (STATE.filters.minRating > 0) {
    chips.push({
      label: `Rating: ${STATE.filters.minRating}★+`,
      clear: () => setRatingFilter(0),
    });
  }

  if (STATE.filters.inStockOnly) {
    chips.push({
      label: "In Stock Only",
      clear: () => setStockFilter(false),
    });
  }

  if (STATE.filters.onSaleOnly) {
    chips.push({
      label: "On Sale Only",
      clear: () => setSaleFilter(false),
    });
  }

  container.innerHTML = chips
    .map(
      (chip, idx) => `
    <span class="filter-chip">
      <span>${chip.label}</span>
      <button type="button" class="filter-chip-remove" data-chip-index="${idx}" aria-label="Remove filter">✕</button>
    </span>
  `,
    )
    .join("");

  container.querySelectorAll(".filter-chip-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.chipIndex, 10);
      if (chips[idx]) chips[idx].clear();
    });
  });
}

function attachProductCardEvents(container) {
  container.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.productId, 10);
      addToCart(id, 1);
    });
  });

  container.querySelectorAll(".qty-stepper").forEach((stepper) => {
    const id = parseInt(stepper.dataset.productId, 10);
    stepper.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === "increase") {
          updateCartQuantity(id, 1);
        } else if (action === "decrease") {
          updateCartQuantity(id, -1);
        }
      });
    });
  });
}

function addToCart(productId, quantity = 1) {
  const product = STATE.products.find((p) => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    showToast(`${product.name} is currently out of stock.`);
    return;
  }

  const existing = STATE.cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
    showToast(`Updated quantity for ${product.name} in cart.`);
  } else {
    STATE.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: quantity,
    });
    showToast(`${product.name} added to your cart.`);
  }

  saveCart();
  refreshAllProductGrids();
  updateCartBadge();
  renderCartDrawer();
}

function updateCartQuantity(productId, delta) {
  const item = STATE.cart.find((i) => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    STATE.cart = STATE.cart.filter((i) => i.id !== productId);
    showToast(`Removed item from cart.`);
  }

  saveCart();
  refreshAllProductGrids();
  updateCartBadge();
  renderCartDrawer();
}

function removeFromCart(productId) {
  STATE.cart = STATE.cart.filter((i) => i.id !== productId);
  saveCart();
  refreshAllProductGrids();
  updateCartBadge();
  renderCartDrawer();
  showToast("Item removed from cart.");
}

function saveCart() {
  localStorage.setItem("lumina_cart", JSON.stringify(STATE.cart));
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const count = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) {
    badge.textContent = count;
    badge.classList.remove("pop");
    void badge.offsetWidth;
    badge.classList.add("pop");
  }

  const drawerCount = document.getElementById("cartDrawerCount");
  if (drawerCount) {
    drawerCount.textContent = `${count} ${count === 1 ? "item" : "items"}`;
  }
}

function renderCartDrawer() {
  const body = document.getElementById("cartDrawerBody");
  const subtotalEl = document.getElementById("cartSubtotal");
  const shippingEl = document.getElementById("cartShipping");
  const totalEl = document.getElementById("cartTotal");
  const footer = document.getElementById("cartDrawerFooter");
  const shippingTrack = document.getElementById("shippingProgressFill");
  const shippingRemaining = document.getElementById("shippingRemaining");

  if (!body) return;

  if (STATE.cart.length === 0) {
    body.innerHTML = `
      <div class="empty-state" style="border: none; padding: 3rem 1rem;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h4 class="empty-state-title">Your cart is empty</h4>
        <p class="empty-state-desc">Looks like you haven't added any premium essentials yet.</p>
        <button type="button" class="btn-primary" onclick="closeAllDrawers(); scrollToSection('catalog');">Start Shopping</button>
      </div>
    `;
    if (footer) footer.style.display = "none";
    if (shippingTrack) shippingTrack.style.width = "0%";
    if (shippingRemaining) shippingRemaining.textContent = "$50.00 away";
    return;
  }

  if (footer) footer.style.display = "block";

  body.innerHTML = STATE.cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${escapeHTML(item.name)}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-name">${escapeHTML(item.name)}</h4>
        <span class="cart-item-price">$${item.price.toFixed(2)} each</span>
        <div class="cart-item-row">
          <div class="cart-qty-ctrl">
            <button type="button" class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, -1)">−</button>
            <span class="cart-qty-num">${item.quantity}</span>
            <button type="button" class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
          </div>
          <span class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
      <button type="button" class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `,
    )
    .join("");

  const subtotal = STATE.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const freeShippingThreshold = 50.0;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0.0 : 5.99;
  const total = subtotal + shippingCost;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingEl)
    shippingEl.textContent = isFreeShipping
      ? "FREE"
      : `$${shippingCost.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  if (shippingTrack) {
    const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
    shippingTrack.style.width = `${progress}%`;
  }

  if (shippingRemaining) {
    if (isFreeShipping) {
      shippingRemaining.textContent = "Unlocked FREE shipping!";
    } else {
      const diff = freeShippingThreshold - subtotal;
      shippingRemaining.textContent = `$${diff.toFixed(2)} away`;
    }
  }
}

function toggleWishlist(productId) {
  const index = STATE.wishlist.indexOf(productId);
  const product = STATE.products.find((p) => p.id === productId);

  if (index > -1) {
    STATE.wishlist.splice(index, 1);
    showToast(`Removed from wishlist.`);
  } else {
    STATE.wishlist.push(productId);
    showToast(`Saved ${product ? product.name : "item"} to wishlist.`);
  }

  localStorage.setItem("lumina_wishlist", JSON.stringify(STATE.wishlist));
  updateWishlistBadge();
  refreshAllProductGrids();
  renderWishlistDrawer();

  const modalWishlistBtn = document.getElementById("modalWishlistBtn");
  if (modalWishlistBtn && STATE.activeProductModalId === productId) {
    modalWishlistBtn.classList.toggle(
      "is-active",
      STATE.wishlist.includes(productId),
    );
  }
}

function updateWishlistBadge() {
  const badge = document.getElementById("wishlistBadge");
  const count = STATE.wishlist.length;
  if (badge) {
    badge.textContent = count;
  }
  const drawerCount = document.getElementById("wishlistDrawerCount");
  if (drawerCount) {
    drawerCount.textContent = `${count} ${count === 1 ? "item" : "items"}`;
  }
}

function renderWishlistDrawer() {
  const body = document.getElementById("wishlistDrawerBody");
  if (!body) return;

  const items = STATE.products.filter((p) => STATE.wishlist.includes(p.id));

  if (items.length === 0) {
    body.innerHTML = `
      <div class="empty-state" style="border: none; padding: 3rem 1rem;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <h4 class="empty-state-title">Your wishlist is empty</h4>
        <p class="empty-state-desc">Tap the heart icon on any product to save your favorite picks.</p>
        <button type="button" class="btn-primary" onclick="closeAllDrawers(); scrollToSection('catalog');">Browse Catalog</button>
      </div>
    `;
    return;
  }

  body.innerHTML = items
    .map(
      (product) => `
    <div class="cart-item">
      <img src="${product.image}" alt="${escapeHTML(product.name)}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-name" style="cursor: pointer;" onclick="openProductModal(${product.id})">${escapeHTML(product.name)}</h4>
        <span class="cart-item-price">$${product.price.toFixed(2)}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
          <button type="button" class="btn-primary" style="padding: 0.35rem 0.85rem; font-size: 0.8rem;" onclick="addToCart(${product.id}, 1)">Add to Cart</button>
        </div>
      </div>
      <button type="button" class="cart-item-remove" onclick="toggleWishlist(${product.id})" aria-label="Remove from wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `,
    )
    .join("");
}

function openProductModal(productId) {
  const product = STATE.products.find((p) => p.id === productId);
  if (!product) return;

  STATE.activeProductModalId = productId;
  STATE.activeModalImageIndex = 0;
  STATE.modalSelectedQty = 1;

  const container = document.getElementById("modalProductDetails");
  const relatedContainer = document.getElementById("modalRelatedGrid");
  const modal = document.getElementById("productModal");
  const backdrop = document.getElementById("overlayBackdrop");

  const galleryImages = [product.image, ...(product.additionalImages || [])];
  const isWishlisted = STATE.wishlist.includes(product.id);
  const starsHTML = generateStarsHTML(product.rating);

  container.innerHTML = `
    <div class="modal-gallery">
      <div class="modal-main-img">
        <img id="modalMainImg" src="${galleryImages[0]}" alt="${escapeHTML(product.name)}">
      </div>
      <div class="modal-thumbs">
        ${galleryImages
          .map(
            (img, idx) => `
          <div class="modal-thumb ${idx === 0 ? "active" : ""}" data-index="${idx}">
            <img src="${img}" alt="Thumbnail preview">
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <div class="modal-details">
      <div class="modal-category-brand">
        <span>${product.category}</span>
        <span>•</span>
        <span>${product.brand}</span>
      </div>
      <h2 class="modal-title">${escapeHTML(product.name)}</h2>

      <div class="modal-rating-row">
        <span class="rating-stars">${starsHTML}</span>
        <strong style="color: var(--color-navy);">${product.rating.toFixed(1)}</strong>
        <span style="color: var(--color-slate-light);">(${product.reviews} customer reviews)</span>
      </div>

      <div class="modal-price-row">
        <span class="modal-price">$${product.price.toFixed(2)}</span>
        ${product.originalPrice ? `<span class="modal-orig-price">$${product.originalPrice.toFixed(2)}</span>` : ""}
        ${product.discount > 0 ? `<span class="badge-discount">-${product.discount}% OFF</span>` : ""}
      </div>

      <div class="modal-stock-badge ${product.stock > 0 ? "in-stock" : "out-stock"}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
        <span>${product.stock > 0 ? `In Stock (${product.stock} units available)` : "Out of Stock"}</span>
      </div>

      <p class="modal-description">${escapeHTML(product.description)}</p>

      <div class="modal-actions">
        <div class="modal-qty-picker">
          <button type="button" class="modal-qty-btn" id="modalQtyMinus">−</button>
          <span class="modal-qty-val" id="modalQtyDisplay">1</span>
          <button type="button" class="modal-qty-btn" id="modalQtyPlus">+</button>
        </div>

        <button type="button" class="modal-add-cart-btn" id="modalAddCartBtn" ${product.stock <= 0 ? "disabled" : ""}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>${product.stock > 0 ? "Add to Cart" : "Sold Out"}</span>
        </button>

        <button type="button" class="modal-wishlist-btn ${isWishlisted ? "is-active" : ""}" id="modalWishlistBtn" aria-label="Toggle Wishlist">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
    </div>
  `;

  const related = STATE.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);
  if (relatedContainer) {
    relatedContainer.innerHTML = related.map(renderProductCardHTML).join("");
    attachProductCardEvents(relatedContainer);
  }

  container.querySelectorAll(".modal-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const idx = parseInt(thumb.dataset.index, 10);
      container
        .querySelectorAll(".modal-thumb")
        .forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      const mainImg = document.getElementById("modalMainImg");
      if (mainImg) mainImg.src = galleryImages[idx];
    });
  });

  const qtyMinus = document.getElementById("modalQtyMinus");
  const qtyPlus = document.getElementById("modalQtyPlus");
  const qtyDisplay = document.getElementById("modalQtyDisplay");
  const addCartBtn = document.getElementById("modalAddCartBtn");
  const wishlistBtn = document.getElementById("modalWishlistBtn");

  if (qtyMinus && qtyPlus && qtyDisplay) {
    qtyMinus.addEventListener("click", () => {
      if (STATE.modalSelectedQty > 1) {
        STATE.modalSelectedQty--;
        qtyDisplay.textContent = STATE.modalSelectedQty;
      }
    });

    qtyPlus.addEventListener("click", () => {
      if (STATE.modalSelectedQty < product.stock) {
        STATE.modalSelectedQty++;
        qtyDisplay.textContent = STATE.modalSelectedQty;
      }
    });
  }

  if (addCartBtn) {
    addCartBtn.addEventListener("click", () => {
      addToCart(product.id, STATE.modalSelectedQty);
      closeProductModal();
    });
  }

  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
      toggleWishlist(product.id);
    });
  }

  if (modal) modal.classList.add("is-open");
  if (backdrop) backdrop.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  const backdrop = document.getElementById("overlayBackdrop");
  if (modal) modal.classList.remove("is-open");
  if (backdrop) backdrop.classList.remove("is-open");
  STATE.activeProductModalId = null;
  document.body.style.overflow = "";
}

function closeAllDrawers() {
  const cartDrawer = document.getElementById("cartDrawer");
  const wishlistDrawer = document.getElementById("wishlistDrawer");
  const mobileNavDrawer = document.getElementById("mobileNavDrawer");
  const modal = document.getElementById("productModal");
  const successModal = document.getElementById("checkoutSuccessModal");
  const backdrop = document.getElementById("overlayBackdrop");
  const sidebar = document.getElementById("catalogSidebar");

  if (cartDrawer) cartDrawer.classList.remove("is-open");
  if (wishlistDrawer) wishlistDrawer.classList.remove("is-open");
  if (mobileNavDrawer) mobileNavDrawer.classList.remove("is-open");
  if (modal) modal.classList.remove("is-open");
  if (successModal) successModal.classList.remove("is-open");
  if (sidebar) sidebar.classList.remove("is-open-mobile");
  if (backdrop) backdrop.classList.remove("is-open");

  document.body.style.overflow = "";
}

function openCartDrawer() {
  closeAllDrawers();
  renderCartDrawer();
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("overlayBackdrop");
  if (drawer) drawer.classList.add("is-open");
  if (backdrop) backdrop.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function openWishlistDrawer() {
  closeAllDrawers();
  renderWishlistDrawer();
  const drawer = document.getElementById("wishlistDrawer");
  const backdrop = document.getElementById("overlayBackdrop");
  if (drawer) drawer.classList.add("is-open");
  if (backdrop) backdrop.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function openCheckoutSuccessModal() {
  const subtotal = STATE.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const grandTotal = subtotal + shipping;

  closeAllDrawers();

  const totalEl = document.getElementById("orderSummaryTotal");
  const orderNum = document.getElementById("orderNumberCode");
  if (totalEl) totalEl.textContent = `$${grandTotal.toFixed(2)}`;
  if (orderNum)
    orderNum.textContent = `#LUM-${Math.floor(10000 + Math.random() * 90000)}`;

  STATE.cart = [];
  saveCart();
  updateCartBadge();
  refreshAllProductGrids();

  const modal = document.getElementById("checkoutSuccessModal");
  const backdrop = document.getElementById("overlayBackdrop");
  if (modal) modal.classList.add("is-open");
  if (backdrop) backdrop.classList.add("is-open");
}

function setCategoryFilter(category) {
  STATE.filters.category = category;
  syncFilterInputs();
  renderCatalog();
}

function setSearchFilter(query) {
  STATE.filters.search = query;
  const desktopSearch = document.getElementById("desktopSearchInput");
  const mobileSearch = document.getElementById("mobileSearchInput");
  const desktopClear = document.getElementById("desktopSearchClear");
  const mobileClear = document.getElementById("mobileSearchClear");

  if (desktopSearch) desktopSearch.value = query;
  if (mobileSearch) mobileSearch.value = query;
  if (desktopClear) desktopClear.style.display = query ? "flex" : "none";
  if (mobileClear) mobileClear.style.display = query ? "flex" : "none";

  renderCatalog();
}

function setPriceFilter(maxPrice) {
  STATE.filters.maxPrice = maxPrice;
  const slider = document.getElementById("priceRangeSlider");
  const maxInput = document.getElementById("maxPriceInput");
  if (slider) slider.value = maxPrice;
  if (maxInput) maxInput.value = maxPrice;
  renderCatalog();
}

function setRatingFilter(rating) {
  STATE.filters.minRating = rating;
  const radios = document.querySelectorAll('input[name="ratingFilter"]');
  radios.forEach((radio) => {
    radio.checked = parseFloat(radio.value) === rating;
  });
  renderCatalog();
}

function setStockFilter(onlyInStock) {
  STATE.filters.inStockOnly = onlyInStock;
  const checkbox = document.getElementById("inStockCheckbox");
  if (checkbox) checkbox.checked = onlyInStock;
  renderCatalog();
}

function setSaleFilter(onlyOnSale) {
  STATE.filters.onSaleOnly = onlyOnSale;
  const checkbox = document.getElementById("onSaleCheckbox");
  if (checkbox) checkbox.checked = onlyOnSale;
  renderCatalog();
}

function resetAllFilters() {
  STATE.filters = {
    search: "",
    category: "All",
    maxPrice: 1200,
    minRating: 0,
    inStockOnly: false,
    onSaleOnly: false,
  };
  STATE.sortBy = "featured";

  const sortSelect = document.getElementById("catalogSort");
  if (sortSelect) sortSelect.value = "featured";

  syncFilterInputs();
  renderCatalog();
  showToast("Filters reset.");
}

function syncFilterInputs() {
  const desktopSearch = document.getElementById("desktopSearchInput");
  const mobileSearch = document.getElementById("mobileSearchInput");
  const desktopClear = document.getElementById("desktopSearchClear");
  const mobileClear = document.getElementById("mobileSearchClear");
  const slider = document.getElementById("priceRangeSlider");
  const maxInput = document.getElementById("maxPriceInput");
  const inStock = document.getElementById("inStockCheckbox");
  const onSale = document.getElementById("onSaleCheckbox");

  if (desktopSearch) desktopSearch.value = STATE.filters.search;
  if (mobileSearch) mobileSearch.value = STATE.filters.search;
  if (desktopClear)
    desktopClear.style.display = STATE.filters.search ? "flex" : "none";
  if (mobileClear)
    mobileClear.style.display = STATE.filters.search ? "flex" : "none";
  if (slider) slider.value = STATE.filters.maxPrice;
  if (maxInput) maxInput.value = STATE.filters.maxPrice;
  if (inStock) inStock.checked = STATE.filters.inStockOnly;
  if (onSale) onSale.checked = STATE.filters.onSaleOnly;

  document.querySelectorAll('input[name="categoryFilter"]').forEach((radio) => {
    radio.checked = radio.value === STATE.filters.category;
  });

  document.querySelectorAll('input[name="ratingFilter"]').forEach((radio) => {
    radio.checked = parseFloat(radio.value) === STATE.filters.minRating;
  });

  document.querySelectorAll(".category-card").forEach((card) => {
    card.classList.toggle(
      "active",
      card.dataset.category === STATE.filters.category,
    );
  });
}

function refreshAllProductGrids() {
  renderFeaturedSection();
  renderNewArrivalsSection();
  renderBestSellersSection();
  renderCatalog();
}

function setupEventListeners() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const closeMobileNavBtn = document.getElementById("closeMobileNavBtn");
  const mobileNavDrawer = document.getElementById("mobileNavDrawer");
  const backdrop = document.getElementById("overlayBackdrop");

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      closeAllDrawers();
      mobileNavDrawer.classList.add("is-open");
      if (backdrop) backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  }
  if (closeMobileNavBtn)
    closeMobileNavBtn.addEventListener("click", closeAllDrawers);
  if (mobileNavDrawer) {
    mobileNavDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeAllDrawers);
    });
  }

  const headerNotificationBtn = document.getElementById(
    "headerNotificationBtn",
  );
  if (headerNotificationBtn) {
    headerNotificationBtn.addEventListener("click", () => {
      showToast(
        "Exclusive Offer: Free shipping on orders over $50 with code LUMINA10",
      );
    });
  }

  const headerCartBtn = document.getElementById("headerCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  if (headerCartBtn) headerCartBtn.addEventListener("click", openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeAllDrawers);

  const headerWishlistBtn = document.getElementById("headerWishlistBtn");
  const closeWishlistBtn = document.getElementById("closeWishlistBtn");
  if (headerWishlistBtn)
    headerWishlistBtn.addEventListener("click", openWishlistDrawer);
  if (closeWishlistBtn)
    closeWishlistBtn.addEventListener("click", closeAllDrawers);

  const closeProductModalBtn = document.getElementById("closeProductModalBtn");
  if (closeProductModalBtn)
    closeProductModalBtn.addEventListener("click", closeProductModal);

  const orderConfirmedCloseBtn = document.getElementById(
    "orderConfirmedCloseBtn",
  );
  if (orderConfirmedCloseBtn)
    orderConfirmedCloseBtn.addEventListener("click", closeAllDrawers);

  if (backdrop) backdrop.addEventListener("click", closeAllDrawers);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllDrawers();
  });

  const desktopSearch = document.getElementById("desktopSearchInput");
  const mobileSearch = document.getElementById("mobileSearchInput");
  const desktopClear = document.getElementById("desktopSearchClear");
  const mobileClear = document.getElementById("mobileSearchClear");

  function handleSearchInput(e) {
    setSearchFilter(e.target.value);
  }

  if (desktopSearch) desktopSearch.addEventListener("input", handleSearchInput);
  if (mobileSearch) mobileSearch.addEventListener("input", handleSearchInput);

  if (desktopClear) {
    desktopClear.addEventListener("click", () => {
      setSearchFilter("");
      if (desktopSearch) desktopSearch.focus();
    });
  }

  if (mobileClear) {
    mobileClear.addEventListener("click", () => {
      setSearchFilter("");
      if (mobileSearch) mobileSearch.focus();
    });
  }

  const slider = document.getElementById("priceRangeSlider");
  const maxInput = document.getElementById("maxPriceInput");
  if (slider) {
    slider.addEventListener("input", (e) => {
      setPriceFilter(parseInt(e.target.value, 10));
    });
  }
  if (maxInput) {
    maxInput.addEventListener("change", (e) => {
      const val = Math.max(
        10,
        Math.min(1200, parseInt(e.target.value, 10) || 1200),
      );
      setPriceFilter(val);
    });
  }

  document.querySelectorAll('input[name="ratingFilter"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      setRatingFilter(parseFloat(e.target.value));
    });
  });

  const inStockCheckbox = document.getElementById("inStockCheckbox");
  if (inStockCheckbox) {
    inStockCheckbox.addEventListener("change", (e) => {
      setStockFilter(e.target.checked);
    });
  }

  const onSaleCheckbox = document.getElementById("onSaleCheckbox");
  if (onSaleCheckbox) {
    onSaleCheckbox.addEventListener("change", (e) => {
      setSaleFilter(e.target.checked);
    });
  }

  const resetFiltersBtn = document.getElementById("resetFiltersBtn");
  if (resetFiltersBtn)
    resetFiltersBtn.addEventListener("click", resetAllFilters);

  const emptyStateResetBtn = document.getElementById("emptyStateResetBtn");
  if (emptyStateResetBtn)
    emptyStateResetBtn.addEventListener("click", resetAllFilters);

  const catalogSort = document.getElementById("catalogSort");
  if (catalogSort) {
    catalogSort.addEventListener("change", (e) => {
      STATE.sortBy = e.target.value;
      renderCatalog();
    });
  }

  const promoDealsBtn = document.getElementById("promoDealsBtn");
  if (promoDealsBtn) {
    promoDealsBtn.addEventListener("click", () => {
      setSaleFilter(true);
      scrollToSection("catalog");
    });
  }

  document.querySelectorAll("[data-filter-category]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const cat = link.dataset.filterCategory;
      setCategoryFilter(cat);
    });
  });

  document.querySelectorAll('[data-filter-sale="true"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      setSaleFilter(true);
    });
  });

  const mobileFilterBtn = document.getElementById("mobileFilterBtn");
  const sidebar = document.getElementById("catalogSidebar");
  if (mobileFilterBtn && sidebar) {
    mobileFilterBtn.addEventListener("click", () => {
      sidebar.classList.toggle("is-open-mobile");
      if (backdrop) backdrop.classList.toggle("is-open");
    });
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn)
    checkoutBtn.addEventListener("click", openCheckoutSuccessModal);

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletterEmail");
      if (emailInput && emailInput.value) {
        showToast(`Subscribed successfully! Use discount code LUMINA10`);
        emailInput.value = "";
      }
    });
  }

  window.addEventListener("scroll", () => {
    const header = document.getElementById("siteHeader");
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    }
  });
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="toast-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </span>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-remove");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

function generateStarsHTML(rating) {
  const fullStars = Math.floor(rating);
  let stars = "";
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    } else {
      stars += `<svg viewBox="0 0 24 24" style="color: #cbd5e1;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
  }
  return stars;
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[tag] || tag,
  );
}
