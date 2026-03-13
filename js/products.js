let products = [];

/* container from index.html */
const productContainer = document.getElementById("productsContainer");


/* =========================
LOAD PRODUCTS FROM BACKEND
========================= */

async function loadProducts(){

try{

const response = await fetch("http://localhost:5000/products");
const data = await response.json();

if(data.success){

products = data.products;

/* show first 80 products in All category */

displayProducts(products.slice(0,80));

}

}catch(err){

console.log("Error loading products:",err);

}

}


/* =========================
DISPLAY PRODUCTS
========================= */

function displayProducts(productArray){

if(!productContainer) return;

productContainer.innerHTML = "";

productArray.forEach((product,index) => {

productContainer.innerHTML += `

<div class="product-card">

<img src="${product.image}"
onerror="this.src='https://via.placeholder.com/200'"
class="product-image">

<h3>${product.name}</h3>

<p class="price">₹${product.price}</p>

<button id="cart-btn-${index}"
class="add-cart-btn"
onclick="addToCart(${index}, ${product.product_id})">
Add to Cart
</button>

<a href="product.html?id=${product.product_id}">
<button class="view-btn">View</button>
</a>

</div>

`;

});

}


/* =========================
SEARCH PRODUCTS
========================= */

const searchInput = document.getElementById("search-input");

if(searchInput){

searchInput.addEventListener("keyup", function(){

let searchValue = this.value.toLowerCase();

let filteredProducts = products.filter(product =>
product.name.toLowerCase().includes(searchValue)
);

displayProducts(filteredProducts);

});

}


/* =========================
CATEGORY FILTER
========================= */

function filterProducts(category){

const suggestedTitle = document.getElementById("suggested-title");

if(category === "All"){

displayProducts(products.slice(0,80));

if(suggestedTitle){
suggestedTitle.style.display="block";
}

return;

}

let filtered = products.filter(product =>
product.category &&
product.category.toLowerCase() === category.toLowerCase()
);

displayProducts(filtered);

if(suggestedTitle){
suggestedTitle.style.display="none";
}

}


/* =========================
ADD TO CART
========================= */

function addToCart(buttonIndex, productId){

let product = products.find(p => p.product_id === productId);

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let existingProduct = cart.find(item => item.id === productId);

let quantity = 1;

if(existingProduct){

existingProduct.quantity++;
quantity = existingProduct.quantity;

}else{

cart.push({
id: product.product_id,
name: product.name,
price: product.price,
image: product.image,
quantity: 1
});

}

localStorage.setItem("cart", JSON.stringify(cart));

/* update ONLY clicked button */

let btn = document.getElementById(`cart-btn-${buttonIndex}`);

if(btn){
btn.innerText = `Add to Cart (${quantity})`;
}

updateCartCount();

}


/* =========================
UPDATE CART BADGE
========================= */

function updateCartCount(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = 0;

cart.forEach(item => {
total += item.quantity;
});

const cartCount = document.getElementById("cart-count");

if(cartCount){
cartCount.innerText = total;
}

}


/* =========================
LOAD CART PAGE
========================= */

function loadCart(){

const cartContainer = document.getElementById("cart-items");
const totalElement = document.getElementById("cart-total");

if(!cartContainer) return;

let cart = JSON.parse(localStorage.getItem("cart")) || [];

cartContainer.innerHTML = "";

let total = 0;

cart.forEach((item,index)=>{

total += item.price * item.quantity;

cartContainer.innerHTML += `

<div class="cart-item">

<img src="${item.image}" width="60">

<div class="cart-info">

<h4>${item.name}</h4>
<p>₹${item.price}</p>

</div>

<div class="qty-box">

<button class="qty-btn" onclick="decreaseQty(${index})">-</button>

<span class="qty-number">${item.quantity}</span>

<button class="qty-btn" onclick="increaseQty(${index})">+</button>

</div>

<button class="remove-btn"
onclick="removeItem(${index})">
Remove
</button>

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

let cart = JSON.parse(localStorage.getItem("cart"));

cart[index].quantity++;

localStorage.setItem("cart",JSON.stringify(cart));

loadCart();

}


/* =========================
DECREASE QUANTITY
========================= */

function decreaseQty(index){

let cart = JSON.parse(localStorage.getItem("cart"));

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

let cart = JSON.parse(localStorage.getItem("cart"));

cart.splice(index,1);

localStorage.setItem("cart",JSON.stringify(cart));

loadCart();

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
PAGE LOAD
========================= */

loadProducts();
updateCartCount();
loadCart();