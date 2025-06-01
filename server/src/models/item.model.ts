// Sample model representing an item
export interface Item {
  id: number;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mock database for items
export const items: Item[] = [
  { 
    id: 1, 
    name: 'Item 1', 
    description: 'First item',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 2, 
    name: 'Item 2', 
    description: 'Second item',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 3, 
    name: 'Item 3', 
    description: 'Third item',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Don't try to export Item as a value since it's a type
export default {
  items
};
