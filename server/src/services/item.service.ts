// Import item model
import { items } from '../models/item.model';
import type { Item } from '../models/item.model';

// Service class for item operations
export class ItemService {
  // Get all items
  getAll(): Item[] {
    return items;
  }

  // Get a single item by ID
  getById(id: number): Item | undefined {
    return items.find(item => item.id === id);
  }

  // Create a new item
  create(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Item {
    const newItem: Item = {
      id: items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1,
      name: item.name,
      description: item.description,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    items.push(newItem);
    return newItem;
  }

  // Update an existing item
  update(id: number, item: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>): Item | undefined {
    const index = items.findIndex(i => i.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const updatedItem: Item = {
      ...items[index],
      ...item,
      updatedAt: new Date()
    };
    
    items[index] = updatedItem;
    return updatedItem;
  }

  // Delete an item
  delete(id: number): boolean {
    const index = items.findIndex(i => i.id === id);
    
    if (index === -1) {
      return false;
    }
    
    items.splice(index, 1);
    return true;
  }
}

export const itemService = new ItemService();

export default itemService;
