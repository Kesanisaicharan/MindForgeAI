const testData = {
  userId: "9e196242-64b6-46e0-87df-9e563a184254",
  userName: "Jahnavi",
  email: "jahnavi2645@gmail.com",
  courseId: "69c3fa182e098811daf51ad4", // UI/UX Fundamentals
  courseTitle: "UI/UX Design Fundamentals",
  score: 95
};

async function test() {
  try {
    console.log("SENDING POST TO GENERATE...");
    const response = await fetch('http://localhost:5000/api/certificates/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    const data = await response.json();
    console.log("RESPONSE:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
