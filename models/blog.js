const mongoose = require('mongoose');

// Schema cho phản hồi (replies)
const replySchema = new mongoose.Schema({
  author: String,
  content: String,
  date: {
      type: Date,
      default: Date.now
  },
  avatarUrl: String
});

// Schema cho bình luận
const commentSchema = new mongoose.Schema({
  author: String,
  content: String,
  date: {
      type: Date,
      default: Date.now
  },
  avatarUrl: String,
  likes: {
      type: Number,
      default: 0
  },
  replies: [replySchema]
});

const sectionSchema = new mongoose.Schema({
  title: String,
  content: String
});

const blogSchema = new mongoose.Schema({
  title: String,
  type: String,
  imageUrl: String,
  author: String,
  authorId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User'}, // Liên kết blog với user có role là 'blog'
  viewCount: {
    type: Number,
    default: 0
  }, 
  sections: [sectionSchema],
  comments: [commentSchema], // Thêm trường bình luận vào đây
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

blogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
  
const Blog = mongoose.model('Blog', blogSchema);
module.exports = { Blog };