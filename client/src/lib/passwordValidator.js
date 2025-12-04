/**
 * Password Strength Validation Utility
 * Ensures passwords meet security requirements for production
 */

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUpperCase: true,
  hasLowerCase: true,
  hasNumber: true,
  hasSpecialChar: true,
};

/**
 * Validates password against security requirements
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, errors: string[], strength: 'weak' | 'medium' | 'strong' }
 */
export const validatePassword = (password) => {
  const errors = [];
  let strengthScore = 0;

  if (!password) {
    return {
      isValid: false,
      errors: ["Password is required"],
      strength: "weak",
      score: 0,
    };
  }

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  } else {
    strengthScore += 1;
  }

  // Check for uppercase letter
  if (!PASSWORD_REQUIREMENTS.hasUpperCase) {
    // Disabled for now but kept for future reference
  } else if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    strengthScore += 1;
  }

  // Check for lowercase letter
  if (!PASSWORD_REQUIREMENTS.hasLowerCase) {
    // Disabled for now but kept for future reference
  } else if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    strengthScore += 1;
  }

  // Check for number
  if (!PASSWORD_REQUIREMENTS.hasNumber) {
    // Disabled for now but kept for future reference
  } else if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {
    strengthScore += 1;
  }

  // Check for special character
  if (!PASSWORD_REQUIREMENTS.hasSpecialChar) {
    // Disabled for now but kept for future reference
  } else if (!/[!@#$%^&*()_\-+=\[\]{};:'",.<>?/\\|`~]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&* etc.)");
  } else {
    strengthScore += 1;
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "123456",
    "qwerty",
    "abc123",
    "admin",
    "letmein",
    "welcome",
    "monkey",
  ];

  if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
    errors.push("Password is too common. Please choose a more unique password");
    strengthScore = Math.max(0, strengthScore - 2);
  }

  // Determine strength level
  let strength = "weak";
  if (strengthScore >= 4) strength = "strong";
  else if (strengthScore >= 2) strength = "medium";

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: strengthScore,
  };
};

/**
 * Get password strength color for UI display
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case "strong":
      return "text-green-600";
    case "medium":
      return "text-yellow-600";
    case "weak":
    default:
      return "text-red-600";
  }
};

/**
 * Get password strength background color for UI display
 */
export const getPasswordStrengthBgColor = (strength) => {
  switch (strength) {
    case "strong":
      return "bg-green-100";
    case "medium":
      return "bg-yellow-100";
    case "weak":
    default:
      return "bg-red-100";
  }
};
