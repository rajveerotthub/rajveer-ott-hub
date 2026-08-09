/* RAJVEER OTT HUB - Fixed Order & Checkout Script */

const BUSINESS_WHATSAPP = "918745077671";
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
    method: document.getElementById("paymentMethod")?.value || ""
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
  const url =
    `https://wa.me/${BUSINESS_WHATSAPP}?text=` +
    encodeURIComponent(buildOrderMessage(order));
  window.location.href = url;
}

function sendEmail(order) {
  if (!BUSINESS_EMAIL || BUSINESS_EMAIL === "YOUR_EMAIL@example.com") {
    alert("Business email is not configured yet.");
    return;
  }

  const subject = `New OTT Order - ${order.plan} - ${order.validity}`;
  window.location.href =
    `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(buildOrderMessage(order))}`;
}

function submitOrder(event) {
  event.preventDefault();

  const order = getOrderData();
  const result = document.getElementById("orderResult");

  if (!order.name || !order.email || !order.phone) {
    result.hidden = false;
    result.innerHTML =
      "<strong>Please fill in Name, Email and WhatsApp Number.</strong>";
    return;
  }

  if (!order.plan || !order.validity || !order.price) {
    result.hidden = false;
    result.innerHTML =
      "<strong>Please select a plan and validity first.</strong>";
    return;
  }

  result.hidden = false;
  result.innerHTML =
    `<strong>Order ready:</strong> ${order.plan} (${order.validity}) — ₹${order.price}` +
    `<br>Customer: ${order.name}` +
    `<br>Payment method: ${order.method || "Not selected"}` +
    `<br><br>Choose WhatsApp Order or Email Order below.`;

  let actions = document.getElementById("orderActions");

  if (!actions) {
    actions = document.createElement("div");
    actions.id = "orderActions";
    actions.style.cssText =
      "display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;";

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

/*
  IMPORTANT FIX:
  The original page has Buy Now buttons with inline onclick="...1 Month...".
  That hardcoded 1 Month was overriding the user's selected 6/12 month option.

  This capture-phase handler runs BEFORE the inline onclick.
  If a user has selected 6 Months or 12 Months, Buy Now opens that exact
  selected validity instead of always opening 1 Month.
*/
function setupPlanSelection() {
  document.addEventListener(
    "click",
    function (event) {
      const target = event.target.closest(".plans button");
      if (target) {
        const card = target.closest(".card");
        if (!card) return;

        card.querySelectorAll(".plans button").forEach(btn => {
          btn.classList.remove("selected", "active");
          btn.setAttribute("aria-selected", "false");
        });

        target.classList.add("selected", "active");
        target.setAttribute("aria-selected", "true");
        return;
      }

      const buyButton = event.target.closest(
        ".card .buy, .card button.buy, .combo-buy"
      );

      if (!buyButton) return;

      const card = buyButton.closest(".card");

      // Regular OTT card: use the selected validity.
      if (card) {
        const selected = card.querySelector(
          ".plans button.selected, .plans button.active"
        );

        if (selected) {
          const span = selected.querySelector("span");
          const strong = selected.querySelector("strong");

          const plan = card.querySelector("h3")?.textContent.trim();
          const validity = span?.textContent.trim();
          const price = strong?.textContent.replace(/[₹,\s]/g, "");

          if (plan && validity && price) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openCheckout(plan, validity, price);
            return;
          }
        }
      }

      // Combo / single-validity cards keep their existing inline behavior.
    },
    true
  );

  // Also support pages using data attributes instead of inline onclick.
  document.addEventListener("click", function (event) {
    const el = event.target.closest("[data-plan][data-validity][data-price]");
    if (!el) return;

    const plan = el.dataset.plan;
    const validity = el.dataset.validity;
    const price = el.dataset.price;

    if (plan && validity && price) {
      event.preventDefault();
      openCheckout(plan, validity, price);
    }
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
