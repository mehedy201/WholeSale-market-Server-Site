const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// Middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cj4eh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const wholeSaleShopCollectionProducts = client.db('wholeSale_Shop').collection('products');
        const wholeSaleShopCollectionUser = client.db('wholeSale_Shop').collection('user');
        const wholeSaleShopCollectionUserOrderData = client.db('wholeSale_Shop').collection('user-orderd-data');


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

// ********-----------------------------  Product Data Server End  -----------------------------******** //

// #######-----------------------------  Get User Orderd Data Start  -----------------------------####### //
    app.post('/user-orderd-data', async(req, res) => {
        const orderData = req.body;
        const query = {name: orderData.name, email: orderData.email};
        const exist = await wholeSaleShopCollectionUserOrderData.findOne(query);
        if(exist){
            return res.send({success: false, orderData: exist})
        }
        const result = await wholeSaleShopCollectionUserOrderData.insertOne(orderData);
        res.send({success: true, result});
    })

    app.get('/user-orderd-data', async (req, res) =>{
        const email = req.query.email;
        const query = {userEmail: email};
        const userOrderd = await wholeSaleShopCollectionUserOrderData.find(query).toArray();
        res.send(userOrderd);
    })

// ********-----------------------------  Get User Orderd Data End  -----------------------------******** //




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