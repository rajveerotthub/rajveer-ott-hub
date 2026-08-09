/* RAJVEER OTT HUB - Order & Checkout Script */

const BUSINESS_WHATSAPP = "918745077671"; // Example: 919876543210
const BUSINESS_EMAIL = "YOUR_EMAIL@example.com";

function openCheckout(plan, validity, price) {
  const checkout = document.getElementById("checkout");
  if (!checkout) return;

  checkout.classList.add("open");
  checkout.setAttribute("aria-hidden", "false");

  const selectedPlan = document.getElementById("selectedPlan");
  const selectedPrice = document.getElementById("selectedPrice");
  const planInput = document.getElementById("planInput");
  const validityInput = document.getElementById("validityInput");
  const priceInput = document.getElementById("priceInput");
  const result = document.getElementById("orderResult");

  if (selectedPlan) selectedPlan.textContent = `${plan} — ${validity}`;
  if (selectedPrice) selectedPrice.textContent = `₹${price}`;
  if (planInput) planInput.value = plan;
  if (validityInput) validityInput.value = validity;
  if (priceInput) priceInput.value = price;
  if (result) {
    result.hidden = true;
    result.innerHTML = "";
  }

  // Keep the selected validity visible if the page has validity selectors.
  document.querySelectorAll("[data-validity], .validity-option, .plan-validity").forEach(el => {
    el.classList.remove("selected", "active");
    el.setAttribute("aria-selected", "false");
  });
}

function closeCheckout() {
  const checkout = document.getElementById("checkout");
  if (!checkout) return;
  checkout.classList.remove("open");
  checkout.setAttribute("aria-hidden", "true");
}

function getOrderData() {
  return {
    name: document.getElementById("customerName")?.value.trim() || "",
    email: document.getElementById("customerEmail")?.value.trim() || "",
    phone: document.getElementById("customerPhone")?.value.trim() || "",
    plan: document.getElementById("planInput")?.value || "",
    validity: document.getElementById("validityInput")?.value || "",
    price: document.getElementById("priceInput")?.value || "",
    method: document.getElementById("paymentMethod")?.value || "UPI"
  };
}

function buildOrderMessage(order) {
  return [
    "RAJVEER OTT HUB - New Order",
    "",
    `Plan: ${order.plan}`,
    `Validity: ${order.validity}`,
    `Price: ₹${order.price}`,
    "",
    `Name: ${order.name}`,
    `Email: ${order.email}`,
    `WhatsApp: ${order.phone}`,
    `Payment Method: ${order.method}`
  ].join("\n");
}

function sendWhatsApp(order) {
  if (!BUSINESS_WHATSAPP || BUSINESS_WHATSAPP === "YOUR_WHATSAPP_NUMBER") {
    alert("Please add your business WhatsApp number in script.js first.");
    return;
  }

  const url = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(buildOrderMessage(order))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function sendEmail(order) {
  if (!BUSINESS_EMAIL || BUSINESS_EMAIL === "YOUR_EMAIL@example.com") {
    alert("Please add your business email in script.js first.");
    return;
  }

  const subject = `New OTT Order - ${order.plan} - ${order.validity}`;
  const body = buildOrderMessage(order);
  window.location.href =
    `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function submitOrder(event) {
  event.preventDefault();

  const order = getOrderData();
  const result = document.getElementById("orderResult");

  if (!order.name || !order.email || !order.phone) {
    if (result) {
      result.hidden = false;
      result.innerHTML = "<strong>Please fill in Name, Email and WhatsApp Number.</strong>";
    }
    return;
  }

  if (!order.plan || !order.validity || !order.price) {
    if (result) {
      result.hidden = false;
      result.innerHTML = "<strong>Please select a plan and validity first.</strong>";
    }
    return;
  }

  // Do not pretend that a live payment has happened.
  // The actual gateway can be connected later.
  if (result) {
    result.hidden = false;
    result.innerHTML =
      `<strong>Order ready:</strong> ${order.plan} (${order.validity}) — ₹${order.price}` +
      `<br>Customer: ${order.name}` +
      `<br>Payment method: ${order.method}` +
      `<br><br>Choose WhatsApp or Email below to send this order.`;
  }

  // Automatically add action buttons when the existing result container is present.
  if (result) {
    let actions = document.getElementById("orderActions");

    if (!actions) {
      actions = document.createElement("div");
      actions.id = "orderActions";
      actions.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;";

      const wa = document.createElement("button");
      wa.type = "button";
      wa.textContent = "WhatsApp Order";
      wa.addEventListener("click", () => sendWhatsApp(getOrderData()));

      const email = document.createElement("button");
      email.type = "button";
      email.textContent = "Email Order";
      email.addEventListener("click", () => sendEmail(getOrderData()));

      actions.append(wa, email);
      result.appendChild(actions);
    }
  }
}

/* Supports common plan-card markup:
   - data-plan="YouTube Premium"
   - data-validity="1 Month"
   - data-price="49"
   - data-plan + data-validity + data-price on a Buy button
*/
function setupPlanSelection() {
  document.addEventListener("click", function (event) {
    const button = event.target.closest(
      "[data-plan][data-validity][data-price], [data-plan][data-validity][data-price] button"
    );

    if (!button) return;

    const target = button.matches("[data-plan]")
      ? button
      : button.closest("[data-plan][data-validity][data-price]");

    if (!target) return;

    const plan = target.dataset.plan;
    const validity = target.dataset.validity;
    const price = target.dataset.price;

    if (plan && validity && price) {
      event.preventDefault();
      openCheckout(plan, validity, price);
    }
  });

  // If validity buttons contain the plan card's data attributes, make sure
  // clicking a specific validity opens THAT validity instead of always 1 Month.
  document.querySelectorAll("[data-validity][data-price]").forEach(el => {
    el.addEventListener("click", function () {
      const card = el.closest("[data-plan]");
      const plan = el.dataset.plan || card?.dataset.plan;
      if (!plan) return;

      document.querySelectorAll("[data-validity], .validity-option, .plan-validity")
        .forEach(x => x.classList.remove("selected", "active"));

      el.classList.add("selected", "active");
      el.setAttribute("aria-selected", "true");

      const buyButton = card?.querySelector(
        "[data-buy-plan], .buy-now, button, a"
      );

      if (buyButton && !buyButton.dataset.boundValidity) {
        buyButton.dataset.boundValidity = "true";
        buyButton.addEventListener("click", function (e) {
          if (el.dataset.validity && el.dataset.price) {
            e.preventDefault();
            openCheckout(plan, el.dataset.validity, el.dataset.price);
          }
        });
      }
    });
  });
}

function setupContactButtons() {
  document.addEventListener("click", function (event) {
    const whatsappButton = event.target.closest(
      "#whatsappOrder, .whatsapp-order, [data-contact='whatsapp']"
    );

    if (whatsappButton) {
      event.preventDefault();
      sendWhatsApp(getOrderData());
      return;
    }

    const emailButton = event.target.closest(
      "#emailOrder, .email-order, [data-contact='email']"
    );

    if (emailButton) {
      event.preventDefault();
      sendEmail(getOrderData());
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupPlanSelection();
  setupContactButtons();

  const checkout = document.getElementById("checkout");
  if (checkout) {
    checkout.addEventListener("click", function (event) {
      if (event.target === checkout) closeCheckout();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeCheckout();
  });
});
