const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7cdmalj.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		const coffeesCollection = client
			.db("coffee-shop")
			.collection("coffees");

		app.get("/coffees", async (req, res) => {
			// const cursor = coffeesCollection.find();
			// const coffees = await cursor.toArray();
			const coffees = await coffeesCollection.find().toArray();
			res.send(coffees);
		});

		app.get("/coffees/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const coffee = await coffeesCollection.findOne(query);
			res.send(coffee);
		});

		app.post("/coffees", async (req, res) => {
			const newCoffee = req.body;
			console.log(newCoffee);
			const result = await coffeesCollection.insertOne(newCoffee);
			console.log(result);
			res.send(result);
		});

		app.put("/coffees/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const options = { upsert: true };
			const updateCoffee = req.body;
			const updateDoc = {
				$set: {
					...updateCoffee
				},
			};
			const result = await coffeesCollection.updateOne(query, updateDoc, options);
			res.send(result);
		});
		
		app.delete("/coffees/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await coffeesCollection.deleteOne(query);
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
