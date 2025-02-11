import { Request, Response } from 'express';
import { dbInsert, dbFind, dbFindOne, dbUpdate, dbRemove } from '../db';
import { Resource } from '../models/Resource';

export const createResource = async (req: Request, res: Response) => {
  try {
    const resource: Resource = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newResource = await dbInsert(resource);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllResources = async (req: Request, res: Response) => {
  try {
    const query = req.query || {};
    const resources = await dbFind(query);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getResourceById = async (req: Request, res: Response) => {
  try {
    const resource = await dbFindOne({ _id: req.params.id });
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const numAffected = await dbUpdate(
      { _id: req.params.id },
      { ...req.body, updatedAt: new Date() },
    );
    if (numAffected > 0) {
      res.json({ message: 'Resource updated successfully' });
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const numRemoved = await dbRemove({ _id: req.params.id });
    if (numRemoved > 0) {
      res.json({ message: 'Resource deleted successfully' });
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
