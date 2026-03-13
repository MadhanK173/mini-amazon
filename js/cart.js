const cartContainer = document.getElementById("cart-items");
const totalElement = document.getElementById("cart-total");


/* =========================
LOAD CART
========================= */

function loadCart(){

if(!cartContainer) return;

let cart = JSON.parse(localStorage.getItem("cart")) || [];

cartContainer.innerHTML = "";

if(cart.length === 0){

cartContainer.innerHTML = `
<div class="alert alert-info">
Your cart is empty
</div>
`;

if(totalElement) totalElement.innerText = "0";

updateCartCount();

return;

}

let total = 0;

cart.forEach((item,index)=>{

total += item.price * item.quantity;

cartContainer.innerHTML += `

<div class="card p-3 mb-3">

<div class="row align-items-center">

<div class="col-md-2 text-center">
<img src="${item.image}"
width="80"
onerror="this.src='https://via.placeholder.com/80?text=Product'">
</div>

<div class="col-md-3">
<h6>${item.name}</h6>
</div>

<div class="col-md-2">
₹${item.price}
</div>

<div class="col-md-3">

<div class="qty-box">

<button onclick="decreaseQty(${index})">-</button>

<span>${item.quantity}</span>

<button onclick="increaseQty(${index})">+</button>

</div>

</div>

<div class="col-md-2 text-end">

<button class="btn btn-danger btn-sm"
onclick="removeItem(${index})">
Remove
</button>

</div>

</div>

</div>

`;

});

if(totalElement){
totalElement.innerText = total;
}

updateCartCount();

}


/* =========================
INCREASE QUANTITY
========================= */

function increaseQty(index){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

cart[index].quantity++;

localStorage.setItem("cart",JSON.stringify(cart));

loadCart();

}


/* =========================
DECREASE QUANTITY
========================= */

function decreaseQty(index){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart[index].quantity > 1){
cart[index].quantity--;
}

localStorage.setItem("cart",JSON.stringify(cart));

loadCart();

}


/* =========================
REMOVE ITEM
========================= */

function removeItem(index){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

cart.splice(index,1);

localStorage.setItem("cart",JSON.stringify(cart));

loadCart();

}


/* =========================
UPDATE CART BADGE
========================= */

function updateCartCount(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let totalItems = 0;

cart.forEach(item=>{
totalItems += item.quantity;
});

const cartCount = document.getElementById("cart-count");

if(cartCount){
cartCount.innerText = totalItems;
}

}


/* =========================
PLACE ORDER
========================= */

const placeOrderBtn = document.getElementById("placeOrderBtn");

if(placeOrderBtn){

placeOrderBtn.addEventListener("click",function(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length === 0){

alert("Cart is empty");

return;

}

alert("Order placed successfully!");

localStorage.removeItem("cart");

loadCart();

});

}


/* =========================
INITIAL LOAD
========================= */

loadCart();

updateCartCount();