const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create new book
router.post('/', async (req, res) => {
  try {
    const { title, author, publishYear, description } = req.body;
    
    // Validation
    if (!title || !author || !publishYear || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newBook = new Book({
      title,
      author,
      publishYear,
      description
    });

    const book = await newBook.save();
    res.status(201).json(book);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update book
router.put('/:id', async (req, res) => {
  try {
    const { title, author, publishYear, description } = req.body;
    
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Update fields
    book.title = title || book.title;
    book.author = author || book.author;
    book.publishYear = publishYear || book.publishYear;
    book.description = description || book.description;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Book not found' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await book.remove();
    res.json({ message: 'Book removed' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// SEARCH books
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;