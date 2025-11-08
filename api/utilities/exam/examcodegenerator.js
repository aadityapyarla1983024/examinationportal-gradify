/**
 * Utility: Generate a unique exam code based on timestamp and user ID.
 *
 * Example Output: "110812304005" → (MMDDHHmm + UserID)
 * Ensures each exam code is unique per user and creation time.
 *
 * @param {number} userId - The ID of the user creating the exam.
 * @returns {string} - A unique alphanumeric exam code.
 */
function generateExamCode(userId) {
  const now = new Date();

  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const userPart = String(userId).padStart(4, "0");

  return `${month}${day}${hours}${minutes}${userPart}`;
}

export default generateExamCode;
