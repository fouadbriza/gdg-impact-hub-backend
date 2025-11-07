/**
 * Standard success response format
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Optional success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
    ...(message && { message }),
    ...(data !== null && data !== undefined && { data }),
  };

  // Add count for arrays
  if (Array.isArray(data)) {
    response.count = data.length;
  }

  return res.status(statusCode).json(response);
};

/**
 * Success response for created resources
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {String} message - Optional success message
 */
export const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Success response with no content
 * @param {Object} res - Express response object
 */
export const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Paginated response format
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination metadata
 * @param {Number} pagination.page - Current page
 * @param {Number} pagination.limit - Items per page
 * @param {Number} pagination.total - Total items
 */
export const sendPaginated = (res, data, pagination) => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};

/**
 * Error response format (usually handled by error middleware)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {Array} errors - Optional detailed errors
 */
export const sendError = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(errors && { errors }),
    },
  });
};

export default {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,
  sendError,
};
