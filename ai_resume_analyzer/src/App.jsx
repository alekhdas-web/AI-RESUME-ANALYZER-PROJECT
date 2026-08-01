import { useState,useEffect } from "react";

function App() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
 // const [error, setError] = useState("");

 /*const loadHistory = async () => {
  try {
    const response = await fetch("http://localhost:5000/history");
    const data = await response.json();
    setHistory(data);
  } catch (err) {
    console.log(err);
  }
}; */

  const handleUpload = async () => {

    if (!file) {
    alert("Please select a file");
    return;
  }

    try{
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch(
  "https://ai-resume-analyzer-project-ji10.onrender.com/analyze",
  
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
    console.log(data);

    setResult(data.analysis);
   // await loadHistory();
    } catch(error) {

    console.log(error);

    alert("Failed to analyze resume");

  }
  };
  
  /*useEffect(() => {
  loadHistory();
}, []); */

const improvement =
  history.length > 1
    ? history[0].score - history[history.length - 1].score
    : 0;

  return (
    <div
    style={{
      minHeight: "100vh",
      background: "#f4f5f8",
      textAlign: "center",
      padding: "40px",
      fontFamily: "Arial"
    }}
  >
    <h1 style={{ color: "#2563eb" }}>
      AI Resume Analyzer 🚀
    </h1>

    <p>
      Upload your resume and get ATS score & AI feedback
      <br></br>Supported files: Convert it to PDF!
    </p>

    <div
      style={{
        background: "white",
        width: "60%",
        margin: "30px auto",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 0 10px lightgray"
      }}
    >
      <input
        type="file"
  accept=".pdf,.docx"
  onChange={(e) => {
  const selectedFile = e.target.files[0];

  if (!selectedFile) return;

  const fileName = selectedFile.name.toLowerCase();

  if (
    !fileName.endsWith(".pdf") &&
    !fileName.endsWith(".docx")
  ) {
    alert("Only PDF and DOCX files are supported!");
    e.target.value = "";
    return;
  }

  setFile(selectedFile);
}}
      />

      <br /><br />

      <button
        onClick={handleUpload}
        style={{
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Analyze Resume
      </button>
    </div>

    {result && (
      <div
        style={{
          background: "white",
          width: "70%",
          margin: "20px auto",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px lightgray",
          textAlign: "left"
        }}
      >
        <h2 style={{ color: "#2563eb" }}>
          Analysis Result
        </h2>

        <pre
          style={{
            whiteSpace: "pre-wrap"
          }}
        >
          {result}
        </pre>
      </div>
    )}
    
     {/* Dashboard */}
    {history.length > 0 && (
      <div
        style={{
          background: "white",
          width: "70%",
          margin: "20px auto",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px lightgray",
          textAlign: "left",
        }}
      >
        <h2 style={{ color: "#2563eb" }}>📊 Resume Dashboard</h2>

        <p><b>🏆 Highest Score:</b> {history[0].highestScore}</p>

        <p><b>📈 Latest Score:</b> {history[0].score}</p>

        <p><b>📄 Total Uploads:</b> {history[0].totalUploads}</p>

        <p><b>🚀 Improvement:</b> +{improvement}</p>

        <hr />

        <h3>Resume History</h3>

        {history.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <b>{item.resume_name}</b>

            <p>Score: {item.score}</p>

            <p>
              Uploaded: {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
  );
}

export default App;

