const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

// middleware
app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const enrolledClassCollection = client.db("tuneUpDb").collection("enrolledClass");
        const paymentInfoCollection = client.db("tuneUpDb").collection("paymentInfo");

        // payment related apis

        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body
            const amount = parseFloat(price) * 100
            if (!price) return
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card'],
            })

            res.send({
                clientSecret: paymentIntent.client_secret,
            })
        })

        app.post('/booking-data', async (req, res) => {
            const {paymentInfo, enrolledClass} = req.body;

            const setPaymentInfo = await paymentInfoCollection.insertOne(paymentInfo);

            const setEnrolledClass = await enrolledClassCollection.insertOne(enrolledClass);

            const query = {_id: new ObjectId(enrolledClass.classId)}

            const deleteSelectedClass = await selectedClassesCollection.deleteOne(query);

            const filter = {_id: new ObjectId(enrolledClass.mainClassId)}

            const updateDoc = {
                $set: {
                    seats: enrolledClass.seats - 1,
                    students: enrolledClass.students + 1
                }
            }

            const updateClass = await classesCollection.updateOne(filter, updateDoc);


            res.send({
                setPaymentInfo,
                setEnrolledClass,
                deleteSelectedClass,
                updateClass
            })
        })

        // users related apis
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query);
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exist' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // instructor related apis
        app.get('/instructors', async (req, res) => {
            const query = { role: 'instructor' };
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })

        // update user role
        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id
            const updateRole = req.body;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: updateRole.role
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.post('/add-class', async (req, res) => {
            const newClass = req.body;
            const result = await classesCollection.insertOne(newClass);
            res.send(result);
        })

        app.get('/popular-instructors', async (req, res) => {
            const query = { role: 'instructor' };
            const cursor = usersCollection.find(query);
            const result = (await cursor.toArray()).slice(0, 6);
            res.send(result);
        })

        // classes related apis
        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        })

        app.get('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await selectedClassesCollection.findOne(query);
            res.send(result);
        })

        app.get('/my-added-classes/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await classesCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/popular-classes', async (req, res) => {
            const sortOrder = -1;
            const result = await classesCollection.find().sort({ students: sortOrder }).toArray();
            res.send(result);
        })

        app.get('/enrolled-classes/:email', async (req, res) => {
            const email = req.params.email;
            const query = { studentEmail: email };
            const result = await enrolledClassCollection.find(query).toArray();
            res.send(result);
        })

        // admin related apis

        app.get('/added-classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        })

        // Selected Classes related apis
        // Student related apis

        app.post('/select-class', async (req, res) => {
            const selectedClass = req.body;
            const doc = {
                mainClassId: selectedClass.mainClassId,
                className: selectedClass.className,
                name: selectedClass.name,
                email: selectedClass.email,
                studentEmail: selectedClass.studentEmail,
                price: selectedClass.price,
                seats: selectedClass.seats,
                students: selectedClass.students,
                img: selectedClass.img

            };
            const result = await selectedClassesCollection.insertOne(doc);
            res.send(result);
        })

        app.get('/select-class/:email', async (req, res) => {
            const email = req.params.email;
            const query = { studentEmail: email };
            const result = await selectedClassesCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/payment-history/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const sortOrder = -1;
            const result = await paymentInfoCollection.find(query).sort({date: sortOrder}).toArray();
            res.send(result);
        })

        app.delete('/select-class/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await selectedClassesCollection.deleteOne(query);
            res.send(result)
        })

        // update class status
        app.patch('/classes/:id', async (req, res) => {
            const id = req.params.id
            const updateStatus = req.body;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                }
            }
            const result = await classesCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.patch('/feedback/:id', async (req, res) => {
            const id = req.params.id
            const updateFeedback = req.body;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    feedback: updateFeedback.feedback
                }
            }
            const result = await classesCollection.updateOne(filter, updateDoc);
            res.send(result)
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