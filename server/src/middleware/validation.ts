import { Request, Response, NextFunction } from 'express';

// Validate item creation/update data
export const validateItemData = (req: Request, res: Response, next: NextFunction): void => {
  const { name, description } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    // For POST requests, both name and description are required
    if (!name) {
      errors.push('Item name is required');
    }
    
    if (!description) {
      errors.push('Item description is required');
    }
  } else if (req.method === 'PUT') {
    // For PUT requests, at least one field should be provided
    if (!name && !description) {
      errors.push('Please provide at least one field to update');
    }
  }
  
  // If name is provided, validate it
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      errors.push('Item name must be a non-empty string');
    }
  }
  
  // If description is provided, validate it
  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim() === '') {
      errors.push('Item description must be a non-empty string');
    }
  }

  // If there are validation errors, return a 400 response
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      errors
    });
    return;
  }

  // If validation passes, continue to the next middleware or controller
  next();
};

// Validate item ID parameter
export const validateItemId = (req: Request, res: Response, next: NextFunction): void => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: 'Invalid ID parameter. Must be a positive integer.'
    });
    return;
  }
  
  next();
};

// Validate signup data
export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password } = req.body;
  const errors = [];

  // Validate username
  if (!username) {
    errors.push('Username is required');
  } else if (typeof username !== 'string' || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (username.trim().length > 30) {
    errors.push('Username cannot exceed 30 characters');
  } else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string' || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
    errors.push('Please provide a valid email address');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one lowercase letter, one uppercase letter, and one number');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  next();
};

// Validate login data
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string' || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
    errors.push('Please provide a valid email address');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (typeof password !== 'string' || password.trim() === '') {
    errors.push('Password cannot be empty');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  next();
};

export default {
  validateItemData,
  validateItemId,
  validateSignup,
  validateLogin
};
