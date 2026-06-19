const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Database Connection With MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://mahesh7744:Mahesh7744@cluster001.u6yhdrt.mongodb.net/e-commerce?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log("MongoDB Error:", err));
// You can set MONGODB_URI in .env instead of hardcoding the connection string.


// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'upload', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//Image Storage Engine 
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage: storage })
app.post("/upload", upload.single('product'), (req, res) => {
  console.log("Image upload requested");
  if (!req.file) {
    console.error("Upload error: No file uploaded");
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }
  try {
    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath);
    const base64Image = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;
    
    // Delete local file to avoid clutter on ephemeral storage
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Failed to delete temp file:", err);
      } else {
        console.log("Temp file deleted successfully");
      }
    });

    console.log("Image successfully uploaded and converted to Base64");
    res.json({
      success: 1,
      image_url: base64Image
    })
  } catch (error) {
    console.error("Upload process error checkpoint:", error);
    res.status(500).json({ success: 0, message: "Error converting image to Base64", error: error.message });
  }
})


// Route for Images folder
app.use('/images', express.static(uploadDir));


// MiddleWare to fetch user from token
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};


// Schema for creating user model
const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  date: { type: Date, default: Date.now() },
});


// Schema for creating Product
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});


// ROOT API Route For Testing
app.get("/", (req, res) => {
  res.send("Root");
});

// PING endpoint for keep-alive and health checks
app.get("/ping", (req, res) => {
  res.send("pong");
});


// Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  console.log("Login");
  let success = false;
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id
        }
      }
      success = true;
      console.log(user.id);
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success, token });
    }
    else {
      return res.status(400).json({ success: success, errors: "please try with correct email/password" })
    }
  }
  else {
    return res.status(400).json({ success: success, errors: "please try with correct email/password" })
  }
})


//Create an endpoint at ip/auth for regestring the user & sending auth-token
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
  let success = false;
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: success, errors: "existing user found with this email" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user.id
    }
  }

  const token = jwt.sign(data, 'secret_ecom');
  success = true;
  res.json({ success, token })
})


// endpoint for getting all products data
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products");
  res.send(products);
});


// endpoint for getting latest products data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let arr = products.slice(0).slice(-8);
  console.log("New Collections");
  res.send(arr);
});


// endpoint for getting womens products data
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let arr = products.splice(0, 4);
  console.log("Popular In Women");
  res.send(arr);
});

// endpoint for getting womens products data
app.post("/relatedproducts", async (req, res) => {
  console.log("Related Products");
  const {category} = req.body;
  const products = await Product.find({ category });
  const arr = products.slice(0, 4);
  res.send(arr);
});


// Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
  console.log("Add Cart requested for item:", req.body.itemId);
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData) {
      console.error("[ADD TO CART ERROR] User not found:", req.user.id);
      return res.status(404).json({ success: false, errors: "User not found" });
    }
    
    if (!userData.cartData) {
      userData.cartData = {};
    }
    
    const itemId = req.body.itemId;
    if (itemId === undefined || itemId === null) {
      console.error("[ADD TO CART ERROR] Missing itemId in request body");
      return res.status(400).json({ success: false, errors: "Item ID is required" });
    }
    
    if (userData.cartData[itemId] === undefined) {
      userData.cartData[itemId] = 0;
    }
    
    userData.cartData[itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Added");
  } catch (error) {
    console.error("Error in addtocart endpoint checkpoint:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
})


// Create an endpoint for removing the product in cart
app.post('/removefromcart', fetchuser, async (req, res) => {
  console.log("Remove Cart requested for item:", req.body.itemId);
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData) {
      console.error("[REMOVE FROM CART ERROR] User not found:", req.user.id);
      return res.status(404).json({ success: false, errors: "User not found" });
    }
    
    if (!userData.cartData) {
      userData.cartData = {};
    }
    
    const itemId = req.body.itemId;
    if (itemId === undefined || itemId === null) {
      console.error("[REMOVE FROM CART ERROR] Missing itemId in request body");
      return res.status(400).json({ success: false, errors: "Item ID is required" });
    }
    
    if (userData.cartData[itemId] === undefined) {
      userData.cartData[itemId] = 0;
    }
    
    if (userData.cartData[itemId] > 0) {
      userData.cartData[itemId] -= 1;
    }
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Removed");
  } catch (error) {
    console.error("Error in removefromcart endpoint checkpoint:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
})


// Create an endpoint for getting cartdata of user
app.post('/getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  if (!userData) {
    return res.status(404).json({ success: false, errors: "User not found" });
  }
  res.json(userData.cartData);
})

app.post('/checkout-payment', async (req, res) => {
  try {
    const amount = Number(req.body.amount || 0);
    const currency = (req.body.currency || 'INR').toLowerCase();

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ['card'],
      });
      return res.json({ success: true, clientSecret: paymentIntent.client_secret, message: 'Stripe payment intent created' });
    }

    return res.json({ success: true, message: 'Demo payment successful (no Stripe key configured)' });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment failed' });
  }
})

// Create an endpoint for adding products using admin panel
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }
  else { id = 1; }
  const product = new Product({
    id: id,
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  await product.save();
  console.log("Saved");
  res.json({ success: true, name: req.body.name })
});


// Create an endpoint for removing products using admin panel
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name })
});

// Create an endpoint for updating a product using admin panel
app.post("/updateproduct", async (req, res) => {
  try {
    const { id, name, old_price, new_price, category } = req.body;
    const updatedProduct = await Product.findOneAndUpdate(
      { id: id },
      {
        name,
        old_price: Number(old_price),
        new_price: Number(new_price),
        category
      },
      { new: true }
    );
    if (!updatedProduct) {
      console.error("[UPDATE PRODUCT ERROR] Product not found for ID:", id);
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    console.log("Updated Product:", name);
    res.json({ success: true, name });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});