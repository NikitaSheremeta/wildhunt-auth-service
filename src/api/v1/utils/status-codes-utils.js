class StatusCodesUtils {
  get httpStatus() {
    return {
      OK: {
        code: 200,
        message: 'OK'
      },
      CREATED: {
        code: 201,
        message: 'CREATED'
      },
      ACCEPTED: {
        code: 202,
        message: 'ACCEPTED'
      },
      BAD_REQUEST: {
        code: 400,
        message: 'BAD_REQUEST'
      },
      UNAUTHORIZED: {
        code: 401,
        message: 'UNAUTHORIZED'
      },
      FORBIDDEN: {
        code: 403,
        message: 'FORBIDDEN'
      },
      INTERNAL_SERVER_ERROR: {
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      }
    };
  }
}

module.exports = new StatusCodesUtils();
