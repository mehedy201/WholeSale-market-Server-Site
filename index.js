const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// Middleware 
app.use(cors());
app.use(express.json());

// MongoDB uri with user name and password
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cj4eh.mongodb.net/?retryWrites=true&w=majority`;
// Connect MongoDB ----------------------------------
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Veryfy JWT token
function verifyJWT (req, res, next){
    const authHeaders = req.headers.autherization;
    if(!authHeaders){
        return res.status(401).send({message: 'UnAuthorized'})
    }
    const token = authHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err,decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        await client.connect();
        const wholeSaleShopCollectionUser = client.db('wholeSale_Shop').collection('user');
        const wholeSaleShopCollectionProducts = client.db('wholeSale_Shop').collection('products');
        const wholeSaleShopCollectionUserOrderData = client.db('wholeSale_Shop').collection('user-orderd-data');
        const wholeSaleShopCollectionUserReview = client.db('wholeSale_Shop').collection('user-review');


// #######-----------------------------  Get User All User Data Start  -----------------------------####### //
app.put('/user/admin/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;
    const requester = req.decoded.email;
    const requesterAccount = await wholeSaleShopCollectionUser.findOne({email: requester});
    if(requesterAccount.role === 'admin'){
        const filter = {email: email};
        const updateDoc = {
        $set: {role: 'admin'},
    };
    const result = await wholeSaleShopCollectionUser.updateOne(filter, updateDoc);
    res.send(result);
    }
    else{
        res.status(403).send({message: 'forbidden'})
    }
});
// Admin Check
app.get('/admin/:email', async(req, res) => {
    const email = req.params.email;
    const user = await wholeSaleShopCollectionUser.findOne({email: email});
    const isAdmin = user.role === 'admin';
    res.send({admin: isAdmin});
})
// Set Admin
app.put('/user/:email', async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = {email: email};
    const options = {upsert: true};
    const updateDoc = {
        $set: user,
    };
    const result = await wholeSaleShopCollectionUser.updateOne(filter, updateDoc, options);
    const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN, {expiresIn: '12h'})
    res.send({result, token});
})
// Get user data
app.get('/user', verifyJWT, async(req, res) => {
    const query ={};
    const cursor = wholeSaleShopCollectionUser.find(query);
    const users = await cursor.toArray();
    res.send(users);
  });
// ********-----------------------------  Get User All User Data End  -----------------------------******** //

// #######-----------------------------  Product Data Server Start  -----------------------------####### //
        // Get data form Server
        app.get('/products', async(req, res) => {
          const query ={};
          const cursor = wholeSaleShopCollectionProducts.find(query);
          const products = await cursor.toArray();
          res.send(products);
        });

        //Get single product from server
        app.get('/products/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const product = await wholeSaleShopCollectionProducts.findOne(query);
        res.send(product);
      })

      // Post Data get from client site
      app.post('/products', async(req, res) => {
        const product = req.body;
        const result = await wholeSaleShopCollectionProducts.insertOne(product);
        res.send({success: true, result});
    })
    app.delete('/products/:id', verifyJWT, async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await wholeSaleShopCollectionProducts.deleteOne(query);
        res.send(result);
      })

// ********-----------------------------  Product Data Server End  -----------------------------******** //

// #######-----------------------------  Get User Orderd Data Start  -----------------------------####### //
// Get user orderd from client Site
    app.post('/user-orderd-data', verifyJWT, async(req, res) => {
        const orderData = req.body;
        const result = await wholeSaleShopCollectionUserOrderData.insertOne(orderData);
        res.send({success: true, result});
    })
    // Get user order data
        app.get('/userOrder', async (req, res) =>{
        const email = req.query.email;
        const query = {userEmail: email};
        const orders = await wholeSaleShopCollectionUserOrderData.find(query).toArray();
        res.send(orders);
      })
 
    app.get('/user-orderd-data', async(req, res) => {
        const query ={};
        const cursor = wholeSaleShopCollectionUserOrderData.find(query);
        const orderdData = await cursor.toArray();
        res.send(orderdData);
      });
// Order Delete 
    app.delete('/user-orderd-data/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await wholeSaleShopCollectionUserOrderData.deleteOne(query);
        res.send(result);
      })
    
// ********-----------------------------  Get User Orderd Data End  -----------------------------******** //


// #######-----------------------------  Get User Review Start  -----------------------------####### //
app.post('/user-review', async(req, res) => {
    const userReviewData = req.body;
    const result = await wholeSaleShopCollectionUserReview.insertOne(userReviewData);
    res.send({success: true, result});
});

app.get('/user-review', async(req, res) => {
    const query ={};
    const cursor = wholeSaleShopCollectionUserReview.find(query);
    const reviewData = await cursor.toArray();
    res.send(reviewData);
  });
// ********-----------------------------  Get User Review End  -----------------------------******** //



// #######-----------------------------  Get User Orderd Data Start  -----------------------------####### //
// ********-----------------------------  Get User Orderd Data End  -----------------------------******** //

        
}
    finally{

    }

}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('connected wholesale shop')
});

app.listen(port, () => {
    console.log('listening wholsale')
});