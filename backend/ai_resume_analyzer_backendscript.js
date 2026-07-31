const express = require('express');

const cors = require('cors');

const multer = require('multer');

const pdfParse = require('pdf-parse');

const fs = require('fs');

const mammoth = require('mammoth');

require('dotenv').config();

const db = require("./database");

const { GoogleGenAI } = require("@google/genai");

console.log(
"Gemini Key:",
process.env.GEMINI_API_KEY ? "Loaded" : "Missing"
);

const ai = new GoogleGenAI({
apiKey: process.env.GEMINI_API_KEY,
});

const app = express();

app.use(cors());

const upload = multer({
dest: "uploads/",
});

app.post(
"/analyze",
upload.single("resume"),

async (req, res) => {
try {


  console.log("Request received");
  console.log(req.file);

  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  const fileBuffer = fs.readFileSync(req.file.path);

  let resumeText = "";

  const fileName =
    req.file.originalname.toLowerCase();

  // PDF
  if (fileName.endsWith(".pdf")) {

    const pdfData =
      await pdfParse(fileBuffer);

    resumeText = pdfData.text;

  }

  // DOCX
  else if (fileName.endsWith(".docx")) {

    const result =
      await mammoth.extractRawText({
        path: req.file.path,
      });

    resumeText = result.value;

  }

  // Invalid File
  else {

    return res.status(400).json({
      message:
        "Upload only PDF or DOCX",
    });

  }

  console.log(
    "Resume length:",
    resumeText.length
  );

  const prompt = `


Analyze this resume.

Give:

1. ATS Score (out of 100)

2. Missing Skills

3. Improvements

4. Strengths

Resume:

${resumeText}
`;


  const result =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

  const response = result.text;
  console.log(response);
  //
  const scoreMatch = response.match(/\d+/);

const score = scoreMatch ? parseInt(scoreMatch[0]) : 0;

db.query(
  "INSERT INTO resume_history(resume_name,score,feedback) VALUES(?,?,?)",
  [
    req.file.originalname,
    score,
    response
  ],
  (err) => {
    if (err) {
      console.log("Database Error:", err);
    } else {
      console.log("✅ Saved to MySQL");
    }
  }
);

  console.log("AI Response:");
  console.log(response);
  fs.unlinkSync(req.file.path);
  
  res.json({
    analysis: response,
    score: score
  });

} catch (error) {

  console.log(error);

  res.status(500).json({
    message: "Error analyzing resume",
  });

}


}
);

app.get("/history", (req, res) => {

    db.query(
         `SELECT *,
            (SELECT MAX(score) FROM resume_history) AS highestScore,
            (SELECT COUNT(*) FROM resume_history) AS totalUploads
        FROM resume_history
        ORDER BY created_at DESC`,
       
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }


            res.json(result);

        }
    );

});

app.listen(5000, () => {
console.log("Server running on port 5000");
});


