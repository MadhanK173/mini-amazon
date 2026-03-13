/* =========================
LOGIN PROTECTION
========================= */

const user = JSON.parse(localStorage.getItem("user"));

if(!user){
window.location.href = "login.html";
}


/* =========================
GET PRODUCT ID FROM URL
========================= */

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let currentProduct = null;


/* =========================
LOAD PRODUCT FROM DATABASE
========================= */

async function loadProduct(){

try{

const response = await fetch(`http://localhost:5000/product/${productId}`);

const data = await response.json();

if(data.success){

currentProduct = data.product;

/* SET IMAGE */

document.getElementById("product-image").src = currentProduct.image;

/* SET NAME */

document.getElementById("product-name").innerText = currentProduct.name;

/* SET PRICE */

document.getElementById("product-price").innerText = "₹" + currentProduct.price;


/* PRODUCT DETAILS TABLE */

let detailsHTML = `
<h5 class="mt-3">Product Specifications</h5>

<table class="table table-bordered">

<tbody>

<tr>
<td><b>Brand</b></td>
<td>${currentProduct.brand || "-"}</td>
</tr>

<tr>
<td><b>Model</b></td>
<td>${currentProduct.model || "-"}</td>
</tr>

<tr>
<td><b>Primary Use</b></td>
<td>${currentProduct.primary_use || "-"}</td>
</tr>

<tr>
<td><b>Size</b></td>
<td>${currentProduct.size || "-"}</td>
</tr>

<tr>
<td><b>Color</b></td>
<td>${currentProduct.color || "-"}</td>
</tr>

<tr>
<td><b>Net Quantity</b></td>
<td>${currentProduct.net_quantity || "-"}</td>
</tr>

<tr>
<td><b>Exchangeable</b></td>
<td>${currentProduct.exchangeable || "-"}</td>
</tr>

<tr>
<td><b>Exchange Duration</b></td>
<td>${currentProduct.exchange_duration || "-"}</td>
</tr>

<tr>
<td><b>Expected Delivery</b></td>
<td>${currentProduct.expected_delivery || "-"}</td>
</tr>

</tbody>

</table>
`;

document.getElementById("product-details").innerHTML = detailsHTML;

}

}catch(err){

console.log("Error loading product:",err);

}

}

loadProduct();



/* =========================
ADD TO CART
========================= */

document.getElementById("add-cart-btn").addEventListener("click",function(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let existingProduct = cart.find(item => item.id === currentProduct.id);

if(existingProduct){

existingProduct.quantity++;

}else{

cart.push({
id: currentProduct.id,
name: currentProduct.name,
price: currentProduct.price,
image: currentProduct.image,
quantity: 1
});

}

localStorage.setItem("cart",JSON.stringify(cart));

updateCartCount();

alert("Product added to cart");

});


/* =========================
UPDATE CART BADGE
========================= */

function updateCartCount(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = 0;

cart.forEach(item=>{
total += item.quantity;
});

const cartCount = document.getElementById("cart-count");

if(cartCount){
cartCount.innerText = total;
}

}

updateCartCount();



/* =========================
PLACE ORDER
========================= */

document.getElementById("place-order-btn").addEventListener("click",function(){

let address = document.getElementById("address").value;
let flat = document.getElementById("flat").value;
let city = document.getElementById("city").value;
let pincode = document.getElementById("pincode").value;

/* VALIDATE ADDRESS */

if(address === "" || flat === "" || city === "" || pincode === ""){

alert("Please fill all address details");

return;

}


/* SAVE ORDER DATA */

let orderData = {

userId: user.id,
productId: currentProduct.id,
productName: currentProduct.name,
price: currentProduct.price,
address: address,
flat: flat,
city: city,
pincode: pincode,
orderDate: new Date().toLocaleDateString()

};

localStorage.setItem("lastOrder", JSON.stringify(orderData));

/* MARK VERIFIED PURCHASE */

localStorage.setItem("verifiedPurchase","true");

alert("Your order is confirmed");

});


/* =========================
WRITE REVIEW (VERIFIED)
========================= */

document.getElementById("review-btn").addEventListener("click",function(){

localStorage.setItem("verifiedPurchase","false");

window.location.href = "review.html?id=" + productId;

});