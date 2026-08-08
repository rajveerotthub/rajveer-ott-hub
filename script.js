function openCheckout(plan, validity, price){
  document.getElementById('checkout').classList.add('open');
  document.getElementById('checkout').setAttribute('aria-hidden','false');
  document.getElementById('selectedPlan').textContent = plan + " — " + validity;
  document.getElementById('selectedPrice').textContent = "₹" + price;
  document.getElementById('planInput').value = plan;
  document.getElementById('validityInput').value = validity;
  document.getElementById('priceInput').value = price;
  document.getElementById('orderResult').hidden = true;
}
function closeCheckout(){
  document.getElementById('checkout').classList.remove('open');
  document.getElementById('checkout').setAttribute('aria-hidden','true');
}
function submitOrder(event){
  event.preventDefault();
  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const plan = document.getElementById('planInput').value;
  const validity = document.getElementById('validityInput').value;
  const price = document.getElementById('priceInput').value;
  const method = document.getElementById('paymentMethod').value;
  const result = document.getElementById('orderResult');

  result.hidden = false;
  result.innerHTML = "<strong>Order ready:</strong> " + plan + " (" + validity + ") — ₹" + price +
    "<br>Customer: " + name + "<br>Payment: " + method +
    "<br><br>Next step: connect your real UPI/payment gateway here before accepting live payments.";
}
window.addEventListener('click', function(e){
  if(e.target.id === 'checkout') closeCheckout();
});
