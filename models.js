"use strict"

const mongoose = require('mongoose')
const Schema = mongoose.Schema()

mongoose.Promise =  global.Promise

const newPostSchema = new mongoose.Schema({
	title: {type: String, require: true},
	content: {type: String, require: true},
	date: {type: Date},
	author: {
		firstName: String,
		lastName: String,
		require: true
	}
})

newPostSchema.virtual("authorString").get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim()
});


newPostSchema.methods.serialize = function() {
	return {
		id: this._id
		title: this.title,
		content: this.content,
		date: this.date,
		author: this.authorString
	}
}

