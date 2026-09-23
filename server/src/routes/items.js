import { Router } from 'express';
import { Item } from '../models/Item.js';
import {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';

const router = Router();

router.get('/', getAllItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;