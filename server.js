const express = require('express')
const app = express()
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {port, DATABASE_URL} = require('./config')
const {Blog} = require('./models')

const { PORT, DATABASE_URL } = require("./models")

const app = express()
app.use(express.json())

app.get("/posts", (req,res) => {
	Post.find()
	.limit(10)
	.then(posts => {
		res.json({
			posts: posts.map(post => posts.serialize())
		});
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({message: "Internal server error"})
	});
});

app.get("/posts/:id", (req, res) => {
	Post
	.findByID(req.params.id)
	.then(post => res.json(post.serialize()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: "Internal server error"})
	});
});

app.post("/posts", (req, res) => {
	const requiredFields = ["title", "content", "author"];
	for (let i = 0, i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	post.create({
		title: req.body.title,
		content: req.body.content,
		date: req.body.date,
		author: req.body.author
	})
	.then(post => res.status(201).json(post.serialize()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: "Internal server error"});
	})
})

app.put("/posts/:id", (req, res) => {
	if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = 
		`Request path id (${req.params.id}) and request body id` +
		`(${req.body.id}) must match`;
		console.error(message);
		return res.status(400).json({messgae: message});
	}
	const toUpdate = {};
	const updateableFields = ["title", "content", "author"];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] =  req.body[field];
		}
	});

	Post
	.findByIdAndUpdate(req.params.id, { $set: toUpdate})
	.then(post => res.status(204).end())
	.catch(err => res.status(500).json({message: "Internal server error"}));
});

app.delete("/posts/:id", (res, req) => {
	Post.findByIdAndRemove(req.params.id)
	.then(post => res.status(204).end())
	.catch(err => res.status(500).json({message: "Internal server error"}));
})

app.use ("*", function(req, res){
	res.status(404).json({message: "Not Found"});
});

let server;

function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(
			databaseUrl,
			err => {
				if (err) {
					return reject(err);
				}
				server = app
				.listen(port, () => {
					console.log(`Your app is listening on port ${port}`);
					resolve()
				})
				.on("error", err => {
					mongoose.disconnect();
					reject(err)
				})
			}
		)
	})
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promsie((resolve, reject) => {
			console.log("Closing Server");
			server.close(err => {
				if (err) {
					return reject(err);
				}
			})
		})
	})
}

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.log(err))
}

module.exports = { app, runServer, closeServer }