/**
 * Resume Data Structure
 * This structure will be sent to FastAPI backend for LLM processing and PDF generation
 */

/**
 * @typedef {Object} PersonalInfo
 * @property {string} fullName
 * @property {string} email
 * @property {string} phone
 * @property {string} location - City, Country
 * @property {string} linkedin - LinkedIn URL (optional)
 * @property {string} github - GitHub username (optional)
 * @property {string} website - Personal website (optional)
 * @property {string} profileImage - Base64 encoded image or URL (optional)
 * @property {boolean} showContactIcons - Whether to display icons for contact info
 */

/**
 * @typedef {Object} Education
 * @property {string} id - Unique identifier
 * @property {string} institution
 * @property {string} degree
 * @property {string} field - Field of study
 * @property {string} startDate - YYYY-MM format
 * @property {string} endDate - YYYY-MM format or 'Present'
 * @property {string} gpa - Optional
 * @property {string[]} achievements - Optional list
 */

/**
 * @typedef {Object} Experience
 * @property {string} id - Unique identifier
 * @property {string} type - 'work' | 'volunteer' | 'project' | 'honor' | 'award'
 * @property {string} title - Position/Role/Project name
 * @property {string} organization - Company/Organization
 * @property {string} location - City, Country (optional)
 * @property {string} startDate - YYYY-MM format
 * @property {string} endDate - YYYY-MM format or 'Present'
 * @property {string} description - Manual description (optional)
 * @property {string[]} technologies - Tech stack/tools used (optional)
 * @property {string} repoId - GitHub repo ID if linked (optional)
 * @property {Object} repoData - Full GitHub repo data if linked (optional)
 */

/**
 * @typedef {Object} ResumeData
 * @property {PersonalInfo} personalInfo
 * @property {Education[]} education
 * @property {Experience[]} experiences - All experiences (work, volunteer, projects, etc.)
 * @property {string[]} selectedRepoIds - GitHub repo IDs to include
 * @property {Object[]} githubRepos - Full GitHub repo data for selected repos
 */

// Validation functions

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (basic)
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phone.length >= 10 && phoneRegex.test(phone);
};

/**
 * Validate URL format
 * @param {string} url
 * @returns {boolean}
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize string input (remove script tags, trim)
 * @param {string} input
 * @returns {string}
 */
export const sanitizeString = (input) => {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Sanitize HTML for descriptions (allow basic formatting)
 * @param {string} input
 * @returns {string}
 */
export const sanitizeDescription = (input) => {
  if (!input) return '';
  // Allow basic formatting tags, remove scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};

/**
 * Validate image file
 * @param {File} file
 * @returns {{valid: boolean, error?: string}}
 */
export const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  return { valid: true };
};

/**
 * Convert image file to base64
 * @param {File} file
 * @returns {Promise<string>}
 */
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate date format (YYYY-MM)
 * @param {string} date
 * @returns {boolean}
 */
export const validateDate = (date) => {
  if (date === 'Present') return true;
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  return dateRegex.test(date);
};

export default {
  validateEmail,
  validatePhone,
  validateUrl,
  sanitizeString,
  sanitizeDescription,
  validateImageFile,
  imageToBase64,
  validateDate,
};