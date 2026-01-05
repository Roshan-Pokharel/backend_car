const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const {verifyAdmin} = require('../middleware/authMiddleware');

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
  }
});

// POST create blog
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: newBlog });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create blog' });
  }
});

// PUT update blog
router.put('/:id',verifyAdmin, async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updatedBlog });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update blog' });
  }
});

// DELETE blog
router.delete('/:id',verifyAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete blog' });
  }
});

module.exports = router;