import request from 'supertest';
import app from '../index';
import { dbInsert, dbFind, dbFindOne, dbUpdate, dbRemove } from '../db';

// Mock the NeDB database for testing
jest.mock('../db', () => {
  const mockDb = {
    insert: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  return {
    db: mockDb,
    dbInsert: jest.fn(),
    dbFind: jest.fn(),
    dbFindOne: jest.fn(),
    dbUpdate: jest.fn(),
    dbRemove: jest.fn(),
  };
});

describe('Resource API Routes', () => {
  beforeEach(() => {
    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  it('should create a new resource', async () => {
    const newResource = {
      name: 'Test Resource',
      description: 'Test Description',
    };
    (dbInsert as jest.Mock).mockResolvedValue({ ...newResource, _id: '123' });

    const res = await request(app).post('/api/resources').send(newResource);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toEqual(newResource.name);
  });

  it('should get all resources', async () => {
    const mockResources = [
      { _id: '1', name: 'Resource 1', description: 'Description 1' },
      { _id: '2', name: 'Resource 2', description: 'Description 2' },
    ];
    (dbFind as jest.Mock).mockResolvedValue(mockResources);

    const res = await request(app).get('/api/resources');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockResources);
  });

  it('should get a specific resource by ID', async () => {
    const mockResource = {
      _id: '1',
      name: 'Resource 1',
      description: 'Description 1',
    };
    (dbFindOne as jest.Mock).mockResolvedValue(mockResource);

    const res = await request(app).get('/api/resources/1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockResource);
  });

  it('should return 404 if resource not found', async () => {
    (dbFindOne as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/resources/999');

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Resource not found');
  });

  it('should update a resource by ID', async () => {
    (dbUpdate as jest.Mock).mockResolvedValue(1); // 1 resource updated

    const res = await request(app)
      .put('/api/resources/1')
      .send({ name: 'Updated Resource Name' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Resource updated successfully');
  });

  it('should return 404 if updating a non-existent resource', async () => {
    (dbUpdate as jest.Mock).mockResolvedValue(0); // 0 resources updated

    const res = await request(app)
      .put('/api/resources/999')
      .send({ name: 'Updated Resource Name' });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Resource not found');
  });

  it('should delete a resource by ID', async () => {
    (dbRemove as jest.Mock).mockResolvedValue(1); // 1 resource removed

    const res = await request(app).delete('/api/resources/1');

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Resource deleted successfully');
  });

  it('should return 404 if deleting a non-existent resource', async () => {
    (dbRemove as jest.Mock).mockResolvedValue(0); // 0 resources removed

    const res = await request(app).delete('/api/resources/999');

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Resource not found');
  });
});
