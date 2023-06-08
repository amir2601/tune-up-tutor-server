const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tujztw6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const usersCollection = client.db("tuneUpDb").collection("users");
        const classesCollection = client.db("tuneUpDb").collection("classes");
        const selectedClassesCollection = client.db("tuneUpDb").collection("selectedClasses");

        // users related apis
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email: email}
            const result = await usersCollection.findOne(query);

            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            console.log('existingUser', existingUser);
            if (existingUser) {
                return res.send({ message: 'user already exist' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // instructor related apis
        app.get('/instructors', async (req, res) => {
            const query = {role: 'instructor'} ;
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/popular-instructors', async (req, res) => {
            const query = {role: 'instructor'} ;
            const cursor = usersCollection.find(query);
            const result = (await cursor.toArray()).slice(0, 6);
            res.send(result);
        })

        // classes related apis
        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        })

        app.get('/popular-classes', async (req, res) => {
            const sortOrder = -1;
            const result = await classesCollection.find().sort({price: sortOrder}).toArray();
            res.send(result);
        })

        // Selected Classes related apis

        app.post('/select-class', async (req, res) => {
            const selectedClass = req.body;
            const doc = {
                className: selectedClass.className,
                name: selectedClass.name
            };
            const result = await selectedClassesCollection.insertOne(doc);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('tutor is running')
})

app.listen(port, (req, res) => {
    console.log('tune-up-tutor is running on port:', port);
})