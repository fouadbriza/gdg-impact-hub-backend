import { sendSuccess, sendCreated, sendPaginated, sendError } from '../src/utils/response.js';

describe('Response Utilities', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('sendSuccess', () => {
    it('should send success response with data', () => {
      const data = { id: 1, name: 'Test' };
      sendSuccess(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should include count for arrays', () => {
      const data = [{ id: 1 }, { id: 2 }];
      sendSuccess(res, data);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        count: 2,
      });
    });

    it('should include optional message', () => {
      const data = { id: 1 };
      sendSuccess(res, data, 'Operation successful');

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation successful',
        data,
      });
    });
  });

  describe('sendCreated', () => {
    it('should send 201 status with created resource', () => {
      const data = { id: 1, name: 'New Resource' };
      sendCreated(res, data);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Resource created successfully',
        data,
      });
    });
  });

  describe('sendPaginated', () => {
    it('should send paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { page: 1, limit: 10, total: 25 };

      sendPaginated(res, data, pagination);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      });
    });
  });

  describe('sendError', () => {
    it('should send error response', () => {
      sendError(res, 'Something went wrong', 500);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Something went wrong',
        },
      });
    });

    it('should include detailed errors if provided', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      sendError(res, 'Validation failed', 400, errors);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Validation failed',
          errors,
        },
      });
    });
  });
});
