// Single source of truth for all application constants
export const constants = {
  // Application Info
  APP: {
    NAME: "Gradify",
    VERSION: "1.0.0",
    DESCRIPTION: "Exam Management System",
  },

  LOCAL_IP_ADDRESS: "192.168.0.107",

  // Environment Names (derived from env vars, not duplicated)
  ENVIRONMENT: {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
    TEST: "test",
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },

  // User Roles
  USER_ROLES: {
    ADMIN: "admin",
    STUDENT: "student",
    TEACHER: "teacher",
  },

  // Academic Status
  ACADEMIC_STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    GRADUATED: "graduated",
    SUSPENDED: "suspended",
  },

  // Course Types
  COURSE_TYPES: {
    CORE: "core",
    ELECTIVE: "elective",
    LAB: "lab",
    SEMINAR: "seminar",
  },

  // JWT Configuration (constants that don't change per environment)
  JWT: {
    EXPIRES_IN: {
      PASS_RESET: "5m",
      LOGIN: "6h",
    },
    ALGORITHM: "HS256",
  },

  // Mail Configuration (constants that don't change)
  MAIL: {
    HOST: "smtp.gmail.com",
    PORT: 465,
    SECURE: true,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "application/pdf", "application/msword"],
  },

  // Validation Rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 100,
  },
};
