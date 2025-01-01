var express = require('express');
var router = express.Router();
const {getBlogs, getBlog, getRelated, getBlogByRole, getBlogWithPage, getAllBlogComments,createBlogComment, createRelyComment, createBlog, updateBlog, deleteBlog} = require('../controllers/blog')
const {checkRole} = require('../middleware/isAuthenticated');
// GET: Lấy hết các bài Blog
router.get('/', getBlogs);
// GET: Lấy hết các bài Blog
router.get('/query', getBlogWithPage);
// GET: Lấy một bài Blog cụ thể
router.get('/:id', getBlog);
// GET: Lấy tất cả comment của blog
router.get('/:id/comments', getAllBlogComments);
// GET: Lấy các bài Blog liên quan
router.get('/related-posts/:id', getRelated);
// POST: Tạo bài Blog mới
router.post('/', createBlog);
// POST: Tạo comment mới
router.post('/:id/comments', createBlogComment);
// POST: Tạo rely mới
router.post('/:id/comments/:commentId/replies', createRelyComment);
// PUT: Cập nhật bài Blog mới
router.put('/:id', updateBlog);
// DELETE: xóa bài Blog
router.delete('/:id', deleteBlog);
// GET: Lấy hết các bài Blog theo role
router.get('/role', checkRole, getBlogByRole);

module.exports = router;