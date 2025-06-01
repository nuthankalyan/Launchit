import { Request, Response } from 'express';
import { itemService } from '../services/item.service';

// Controller for API endpoints
export const apiController = {
  // Get welcome message
  getWelcome: (req: Request, res: Response): void => {
    res.status(200).json({
      message: 'Welcome to the Launchit API',
      version: '1.0.0'
    });
  },
  
  // Get all items
  getAllItems: (req: Request, res: Response): void => {
    const items = itemService.getAll();
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  },

  // Get a single item
  getItem: (req: Request, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
      return;
    }
    
    const item = itemService.getById(id);
    
    if (!item) {
      res.status(404).json({
        success: false,
        message: `Item with ID ${id} not found`
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  },

  // Create a new item
  createItem: (req: Request, res: Response): void => {
    const { name, description } = req.body;
    
    if (!name || !description) {
      res.status(400).json({
        success: false,
        message: 'Please provide name and description'
      });
      return;
    }
    
    const newItem = itemService.create({ name, description });
    
    res.status(201).json({
      success: true,
      data: newItem
    });
  },

  // Update an item
  updateItem: (req: Request, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
      return;
    }
    
    const updatedItem = itemService.update(id, req.body);
    
    if (!updatedItem) {
      res.status(404).json({
        success: false,
        message: `Item with ID ${id} not found`
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: updatedItem
    });
  },

  // Delete an item
  deleteItem: (req: Request, res: Response): void => {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
      return;
    }
    
    const deleted = itemService.delete(id);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: `Item with ID ${id} not found`
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: `Item with ID ${id} deleted successfully`
    });
  }
};

export default apiController;
