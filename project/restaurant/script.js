/* Sizzle & Crust — menu rendering, category filtering, cart drawer (vanilla JS) */
(function () {
  "use strict";

  /* ---------- Menu catalogue (images mapped per spec) ---------- */
  var MENU = [
    { id: "smash-burger", title: "Classic Smash Burger", category: "burgers", tag: "Burgers",
      desc: "Smashed beef patty, cheddar, pickles and house sauce in a toasted brioche bun.",
      price: 12.99, img: "images/jonathan-borba-8l8Yl2ruUsg-unsplash.jpg" },
    { id: "double-cheese", title: "Double Cheese Burger", category: "burgers", tag: "Burgers",
      desc: "Two juicy patties, double cheddar, caramelised onions and smoky mayo.",
      price: 14.49, img: "images/amirali-mirhashemian-jh5XyK4Rr3Y-unsplash.jpg" },
    { id: "bbq-bacon", title: "BBQ Bacon Burger", category: "burgers", tag: "Burgers",
      desc: "Crispy bacon, onion rings and bourbon BBQ glaze over a flame-grilled patty.",
      price: 15.99, img: "images/david-foodphototasty-E94j3rMcxlw-unsplash.jpg" },
    { id: "swiss-burger", title: "Mushroom Swiss Burger", category: "burgers", tag: "Burgers",
      desc: "Garlic-butter mushrooms, melted Swiss and truffle aioli on a soft potato roll.",
      price: 13.99, img: "images/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg" },
    { id: "margherita", title: "Margherita Pizza", category: "pizza", tag: "Pizza",
      desc: "San Marzano tomato, fior di latte, basil and cold-pressed olive oil.",
      price: 13.49, img: "images/chad-montano-MqT0asuoIcU-unsplash (1).jpg" },
    { id: "pepperoni", title: "Pepperoni Pizza", category: "pizza", tag: "Pizza",
      desc: "Loaded pepperoni cups, mozzarella blend and oregano on a stone-baked crust.",
      price: 15.49, img: "images/ivan-torres-MQUqbmszGGM-unsplash.jpg" },
    { id: "alfredo", title: "Creamy Alfredo Pasta", category: "pasta", tag: "Pasta",
      desc: "Fettuccine folded through parmesan cream with cracked pepper and herbs.",
      price: 14.99, img: "images/aleksandra-tanasiienko-0y6eMd8vevA-unsplash.jpg" },
    { id: "arrabbiata", title: "Spicy Arrabbiata Pasta", category: "pasta", tag: "Pasta",
      desc: "Penne in a fiery tomato-chilli sugo, finished with pecorino and basil.",
      price: 13.49, img: "images/ben-lei-flFd8L7_B3g-unsplash.jpg" },
    { id: "bbq-platter", title: "Grilled BBQ Platter", category: "bbq", tag: "BBQ & Fresh",
      desc: "Slow-smoked skewers and grilled bites with charred lemon and herb butter.",
      price: 19.99, img: "images/victoria-shes-UC0HZdUitWY-unsplash (1).jpg" },
    { id: "garden-bowl", title: "Fresh Garden Bowl", category: "bbq", tag: "BBQ & Fresh",
      desc: "Crisp seasonal greens, avocado, grains and citrus dressing — light and fresh.",
      price: 11.99, img: "images/dan-gold-4_jhDO54BYg-unsplash.jpg" }
  ];

  var byId = {};
  MENU.forEach(function (item) { byId[item.id] = item; });

  /* ---------- State ---------- */
  var activeFilter = "all";
  var cart = {}; // id -> qty

  /* ---------- DOM refs ---------- */
  var grid = document.getElementById("menu-grid");
  var noResults = document.getElementById("no-results");
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var cartCount = document.getElementById("cart-count");
  var drawer = document.getElementById("cart-drawer");
  var overlay = document.getElementById("cart-overlay");
  var cartItemsEl = document.getElementById("cart-items");
  var cartEmptyEl = document.getElementById("cart-empty");
  var cartTotalEl = document.getElementById("cart-total");
  var cartMessage = document.getElementById("cart-message");

  function money(n) { return "$" + n.toFixed(2); }

  /* ---------- Menu rendering + filtering ---------- */
  function renderMenu() {
    grid.innerHTML = "";
    var shown = 0;
    MENU.forEach(function (item) {
      if (activeFilter !== "all" && item.category !== activeFilter) return;
      shown++;
      var card = document.createElement("article");
      card.className = "card";
      card.innerHTML =
        '<img src="' + item.img + '" alt="' + item.title + '" loading="lazy" />' +
        '<div class="card-body">' +
          '<span class="card-tag">' + item.tag + "</span>" +
          "<h3>" + item.title + "</h3>" +
          "<p>" + item.desc + "</p>" +
          '<div class="card-foot">' +
            '<span class="price">' + money(item.price) + "</span>" +
            '<button class="add-btn" type="button" data-add="' + item.id + '">Add to Cart</button>' +
          "</div>" +
        "</div>";
      grid.appendChild(card);
    });
    noResults.hidden = shown !== 0;
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter");
      renderMenu();
    });
  });

  /* ---------- Cart ---------- */
  function cartQty() {
    return Object.keys(cart).reduce(function (n, id) { return n + cart[id]; }, 0);
  }
  function cartSum() {
    return Object.keys(cart).reduce(function (sum, id) { return sum + byId[id].price * cart[id]; }, 0);
  }

  function renderCart() {
    cartCount.textContent = cartQty();
    cartItemsEl.innerHTML = "";
    var ids = Object.keys(cart);
    cartEmptyEl.style.display = ids.length ? "none" : "block";
    ids.forEach(function (id) {
      var item = byId[id];
      var qty = cart[id];
      var li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML =
        "<strong>" + item.title + "</strong>" +
        '<div class="qty-controls">' +
          '<button type="button" data-dec="' + id + '" aria-label="Decrease quantity">−</button>' +
          "<span>" + qty + "</span>" +
          '<button type="button" data-inc="' + id + '" aria-label="Increase quantity">+</button>' +
        "</div>" +
        '<span class="unit">' + money(item.price) + " each</span>" +
        '<span class="line-total">' + money(item.price * qty) + "</span>" +
        '<button type="button" class="remove-link" data-remove="' + id + '">Remove</button>';
      cartItemsEl.appendChild(li);
    });
    cartTotalEl.textContent = money(cartSum());
  }

  function flashMessage(text) {
    cartMessage.textContent = text;
    window.clearTimeout(flashMessage.t);
    flashMessage.t = window.setTimeout(function () { cartMessage.textContent = ""; }, 2200);
  }

  function openCart() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  // Delegated clicks: add-to-cart (grid) + qty/remove (drawer)
  document.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      var id = add.getAttribute("data-add");
      cart[id] = (cart[id] || 0) + 1;
      renderCart();
      flashMessage(byId[id].title + " added to cart.");
      return;
    }
    var inc = e.target.closest("[data-inc]");
    if (inc) {
      cart[inc.getAttribute("data-inc")]++;
      renderCart();
      return;
    }
    var dec = e.target.closest("[data-dec]");
    if (dec) {
      var did = dec.getAttribute("data-dec");
      cart[did]--;
      if (cart[did] <= 0) delete cart[did];
      renderCart();
      return;
    }
    var rem = e.target.closest("[data-remove]");
    if (rem) {
      delete cart[rem.getAttribute("data-remove")];
      renderCart();
    }
  });

  document.getElementById("cart-open-btn").addEventListener("click", openCart);
  document.getElementById("cart-close-btn").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
  });

  document.getElementById("cart-clear-btn").addEventListener("click", function () {
    cart = {};
    renderCart();
  });

  document.getElementById("cart-checkout-btn").addEventListener("click", function () {
    if (!cartQty()) {
      flashMessage("Your cart is empty — add a dish first.");
      return;
    }
    var total = money(cartSum());
    cart = {};
    renderCart();
    flashMessage("Order placed! Total " + total + ". Ready in ~15 minutes.");
  });

  /* ---------- Init ---------- */
  renderMenu();
  renderCart();
})();
