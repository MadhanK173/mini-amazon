const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

/* ================================
   MIDDLEWARE
================================ */

app.use(cors());
app.use(express.json());

/* ================================
   DATABASE CONNECTION
================================ */

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log("✅ MySQL Pool Connected");

/* ================================
   TEST ROUTE
================================ */

app.get("/", (req,res)=>{
res.send("Mini Amazon Backend Running");
});

/* ================================
   REGISTER
================================ */

app.post("/register",(req,res)=>{

const {username,email,password} = req.body;

if(!username || !email || !password){
return res.json({
success:false,
message:"All fields required"
});
}

/* ================================
   STRONG PASSWORD CHECK
================================ */

const strongPassword =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

if(!strongPassword.test(password)){
return res.json({
success:false,
message:"Password must contain uppercase, lowercase, number, special character and minimum 8 characters"
});
}

/* ================================
   CHECK EMAIL EXISTS
================================ */

const checkUser =
"SELECT * FROM users WHERE email=?";

db.query(checkUser,[email],(err,result)=>{

if(err){
console.log(err);
return res.json({
success:false,
message:"Database error"
});
}

if(result.length>0){
return res.json({
success:false,
message:"Email already registered"
});
}

/* ================================
   INSERT USER
================================ */

const sql =
"INSERT INTO users (username,email,password) VALUES (?,?,?)";

db.query(sql,[username,email,password],(err)=>{

if(err){
console.log(err);
return res.json({
success:false,
message:"Registration failed"
});
}

res.json({
success:true,
message:"User registered successfully"
});

});

});

});


/* ================================
   LOGIN
================================ */

app.post("/login",(req,res)=>{

const {email,password} = req.body;

if(!email || !password){
return res.json({
success:false,
message:"Missing login data"
});
}

const sql =
"SELECT * FROM users WHERE email=?";

db.query(sql,[email],(err,result)=>{

if(err){
console.log(err);
return res.json({
success:false,
message:"Database error"
});
}

if(result.length===0){
return res.json({
success:false,
message:"User not found"
});
}

const user = result[0];

if(user.password !== password){
return res.json({
success:false,
message:"Incorrect password"
});
}

res.json({
success:true,
user:{
id:user.id,
username:user.username,
email:user.email
}
});

});

});


/* ===============================
   PRODUCTS API
================================ */

app.get("/api/products", (req, res) => {

  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {

    if (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error" });
    } 
    else {
      res.json(result);
    }

  });

});


/* ================================
   GET SINGLE PRODUCT
================================ */

app.get("/product/:id",(req,res)=>{

const productId = req.params.id;

const sql =
"SELECT * FROM products WHERE product_id=?";

db.query(sql,[productId],(err,result)=>{

if(err){
console.log(err);
return res.json({success:false});
}

if(result.length===0){
return res.json({
success:false,
message:"Product not found"
});
}

res.json({
success:true,
product:result[0]
});

});

});


/* ================================
   ADD REVIEW
================================ */

app.post("/add-review",(req,res)=>{

const {user_id,product_id,review_text,rating,verified_purchase} = req.body;

if(!user_id || !product_id || !review_text || !rating){
return res.json({
success:false,
message:"Missing review data"
});
}

/* get username and product name */

const infoQuery = `
SELECT users.username, products.name AS product_name
FROM users, products
WHERE users.id=? AND products.product_id=?`;

db.query(infoQuery,[user_id,product_id],(err,result)=>{

if(err || result.length===0){
console.log(err);
return res.json({
success:false,
message:"User or product not found"
});
}

const username = result[0].username;
const productName = result[0].product_name;

/* insert review */

const insertQuery = `
INSERT INTO reviews
(user_id,product_id,rating,review_text,verified_purchase,review_date,username,product_name)
VALUES (?,?,?,?,?,NOW(),?,?)`;

db.query(
insertQuery,
[user_id,product_id,rating,review_text,verified_purchase,username,productName],
(err)=>{

if(err){
console.log(err);
return res.json({
success:false,
message:"Database error"
});
}

res.json({
success:true,
message:"Review added successfully"
});

});

});

});


/* ================================
   GET REVIEWS
================================ */

app.get("/reviews/:product_id",(req,res)=>{

const productId = req.params.product_id;

const sql = `
SELECT *
FROM reviews
WHERE product_id=?
ORDER BY review_id DESC`;

db.query(sql,[productId],(err,result)=>{

if(err){
console.log(err);
return res.json({success:false});
}

res.json({
success:true,
reviews:result
});

});

});


/* ================================
   ADD TO CART
================================ */

app.post("/add-to-cart",(req,res)=>{

const {user_id,product_id,quantity} = req.body;

const check =
"SELECT * FROM cart WHERE user_id=? AND product_id=?";

db.query(check,[user_id,product_id],(err,result)=>{

if(err){
console.log(err);
return res.json({success:false});
}

if(result.length>0){

const update =
"UPDATE cart SET quantity = quantity + ? WHERE user_id=? AND product_id=?";

db.query(update,[quantity,user_id,product_id]);

return res.json({
success:true,
message:"Cart updated"
});

}

const insert =
"INSERT INTO cart (user_id,product_id,quantity) VALUES (?,?,?)";

db.query(insert,[user_id,product_id,quantity]);

res.json({
success:true,
message:"Product added to cart"
});

});

});


/* ================================
   GET USER CART
================================ */

app.get("/cart/:user_id",(req,res)=>{

const userId = req.params.user_id;

const sql = `
SELECT cart.*,products.name,products.price,products.image
FROM cart
JOIN products ON cart.product_id = products.product_id
WHERE cart.user_id=?`;

db.query(sql,[userId],(err,result)=>{

if(err){
console.log(err);
return res.json({success:false});
}

res.json({
success:true,
cart:result
});

});

});


/* ================================
   START SERVER
================================ */

const PORT = 5000;

app.listen(PORT,()=>{
console.log("🚀 Server running on port " + PORT);
});