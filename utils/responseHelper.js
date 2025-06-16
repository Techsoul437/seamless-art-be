export const sendSuccess = (res, message = 'Success', data = {}) => {
  return res.status(200).json({
    status: 200,
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    status: statusCode,
    success: false,
    message,
    error: error ? (error.message || error) : null,
  });
};
