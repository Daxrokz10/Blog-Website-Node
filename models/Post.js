const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  body:     { type: String, required: true, trim: true },
  createdAt:{ type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  body:    { type: String, required: true },
  coverUrl:String,
  coverPublicId:String,
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  comments:[commentSchema],
}, { timestamps: true });

module.exports = mongoose.model('post', postSchema);
