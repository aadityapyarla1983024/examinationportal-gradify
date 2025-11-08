function generateExamCode(userId) {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const userPart = userId.toString().padStart(4, "0");

  return `${month}${day}${hours}${minutes}${userPart}`;
}

export default generateExamCode;
