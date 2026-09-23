import mongoose from 'mongoose';
import Joi from 'joi';
import { Item } from '../models/Item.js';

const categories = ['electronics', 'clothing', 'documents', 'accessories', 'other'];
const statuses = ['lost', 'found', 'claimed'];

const createSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().allow('').optional(),
  category: Joi.string().valid(...categories).optional(),
  status: Joi.string().valid(...statuses).optional(),
  location: Joi.string().trim().allow('').optional(),
  reportedBy: Joi.string().hex().length(24).optional(),
});

const updateSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim().allow(''),
  category: Joi.string().valid(...categories),
  status: Joi.string().valid(...statuses),
  location: Joi.string().trim().allow(''),
  reportedBy: Joi.string().hex().length(24),
}).min(1);

// GET /api/items
export const getAllItems = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

        const items = await Item.find(filter).populate('reportedBy', 'name email');
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/items/:id
export const getItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

        const item = await Item.findById(id).populate('reportedBy', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/items
export const createItem = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const item = await Item.create(value);
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An item with this title and location already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/items/:id
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const item = await Item.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An item with this title and location already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/items/:id
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};