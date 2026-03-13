/* =========================
GET USER + PRODUCT
========================= */

const user = JSON.parse(localStorage.getItem("user"));

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if(!user){
window.location.href = "login.html";
}

if(!productId){
alert("Product not found");
window.location.href="index.html";
}

let selectedRating = 0;

const stars = document.querySelectorAll(".star");
const ratingText = document.getElementById("rating-value");


/* =========================
STAR EVENTS
========================= */

stars.forEach((star,index)=>{

star.addEventListener("mouseover",()=>{
highlightStars(index+1);
});

star.addEventListener("mouseout",()=>{
highlightStars(selectedRating);
});

star.addEventListener("click",()=>{

selectedRating = index+1;

highlightStars(selectedRating);

if(ratingText){
ratingText.innerHTML = "Your Rating: " + selectedRating + " ⭐";
}

});

});


/* =========================
STAR HIGHLIGHT FUNCTION
========================= */

function highlightStars(count){

stars.forEach((star,i)=>{

if(i < count){

star.innerHTML="&#9733;";
star.style.color="gold";

}
else{

star.innerHTML="&#9734;";
star.style.color="#ccc";

}

});

}


/* =========================
SUBMIT REVIEW
========================= */

const submitBtn = document.getElementById("submit-review-btn");

if(submitBtn){
submitBtn.addEventListener("click",submitReview);
}

async function submitReview(){

let reviewText = document.getElementById("review-text").value.trim();

if(reviewText === "" || selectedRating === 0){

alert("Please add rating and review");

return;

}

try{

const response = await fetch("http://localhost:5000/add-review",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({

user_id: user.id,
product_id: productId,
review_text: reviewText,
rating: selectedRating

})

});

const data = await response.json();

if(data.success){

alert("Review submitted successfully");

document.getElementById("review-text").value="";

selectedRating = 0;

highlightStars(0);

if(ratingText){
ratingText.innerHTML="";
}

loadReviews();

}else{

alert(data.message || "Review submission failed");

}

}catch(err){

console.log("Error submitting review",err);

alert("Server error");

}

}


/* =========================
LOAD REVIEWS FROM DATABASE
========================= */

async function loadReviews(){

try{

const response = await fetch(`http://localhost:5000/reviews/${productId}`);

const data = await response.json();

if(data.success){

displayReviews(data.reviews);

}

}catch(err){

console.log("Error loading reviews",err);

}

}


/* =========================
DISPLAY REVIEWS
========================= */

function displayReviews(reviews){

const reviewContainer = document.getElementById("reviews-list");
const avgContainer = document.getElementById("average-rating");

if(!reviewContainer) return;

reviewContainer.innerHTML = "";

if(reviews.length === 0){

reviewContainer.innerHTML = `
<div class="alert alert-info">
No reviews yet
</div>
`;

if(avgContainer) avgContainer.innerHTML = "";

return;

}


/* =========================
CALCULATE AVERAGE RATING
========================= */

let totalRating = 0;

reviews.forEach(r=>{
totalRating += r.rating;
});

let avgRating = (totalRating / reviews.length).toFixed(1);

if(avgContainer){

avgContainer.innerHTML = `
<h5>Average Rating: ${avgRating} ⭐</h5>
<p>${reviews.length} Reviews</p>
`;

}


/* =========================
SHOW REVIEWS
========================= */

reviews.forEach(review =>{

let starHTML = "";

for(let i=1;i<=5;i++){
starHTML += i <= review.rating ? "⭐" : "☆";
}

reviewContainer.innerHTML += `

<div class="review-card">

<div class="review-header">

<span class="review-stars">${starHTML}</span>

<b>${review.username}</b>

<span class="review-badge">
✔ Verified Purchase
</span>

</div>

<p class="review-text">
${review.review_text}
</p>

</div>

`;

});

}


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
INITIAL LOAD
========================= */

loadReviews();