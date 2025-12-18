/**
 * Test Account Credentials for Classes E2E Tests
 */

// Instructor Account - can create and manage classes
export const INSTRUCTOR_ACCOUNT = {
  email: "e2e-instructor@stepperslife.com",
  password: "TestPassword123!",
  name: "E2E Test Instructor",
};

// Student Account - can browse and enroll in classes
export const STUDENT_ACCOUNT = {
  email: "e2e-student@stepperslife.com",
  password: "TestPassword123!",
  name: "E2E Test Student",
};

// Admin Account - full access
export const ADMIN_ACCOUNT = {
  email: "ira@irawatkins.com",
  password: "Bobby321!",
  name: "Admin User",
};

// Alternative instructor for multi-instructor tests
export const INSTRUCTOR_ACCOUNT_2 = {
  email: "e2e-instructor2@stepperslife.com",
  password: "TestPassword123!",
  name: "E2E Test Instructor 2",
};

// Alternative student for enrollment tests
export const STUDENT_ACCOUNT_2 = {
  email: "e2e-student2@stepperslife.com",
  password: "TestPassword123!",
  name: "E2E Test Student 2",
};

export type TestAccount = {
  email: string;
  password: string;
  name: string;
};
