import Datastore from 'nedb';
import { Resource } from './models/Resource';

export const db = new Datastore<Resource>({
  filename: 'database.db',
  autoload: true,
});

// Promisify NeDB functions for easier use with async/await
export function dbInsert<T>(doc: T): Promise<T> {
  return new Promise((resolve, reject) => {
    db.insert(doc, (err: Error | null, newDoc: T) => {
      if (err) reject(err);
      resolve(newDoc);
    });
  });
}

export function dbFind<T>(query: any): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.find(query, (err: Error | null, docs: T[]) => {
      if (err) reject(err);
      resolve(docs);
    });
  });
}
export function dbFindOne<T>(query: any): Promise<T | null> {
  return new Promise((resolve, reject) => {
    db.findOne(query, (err: Error | null, doc: T) => {
      if (err) reject(err);
      resolve(doc);
    });
  });
}

export function dbUpdate<T>(
  query: any,
  update: any,
  options: Datastore.UpdateOptions = {},
): Promise<number> {
  return new Promise((resolve, reject) => {
    db.update(
      query,
      update,
      options,
      (err: Error | null, numAffected: number) => {
        if (err) reject(err);
        resolve(numAffected);
      },
    );
  });
}

export function dbRemove(
  query: any,
  options: Datastore.RemoveOptions = {},
): Promise<number> {
  return new Promise((resolve, reject) => {
    db.remove(query, options, (err: Error | null, numRemoved: number) => {
      if (err) reject(err);
      resolve(numRemoved);
    });
  });
}
