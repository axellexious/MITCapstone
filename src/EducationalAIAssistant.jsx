import React, { useState, useRef } from "react";
import axios from "axios";

import "./EducationalAIAssistant.css";

function EducationalAIAssistant() {
  // Options for each category that users can select
  const promptOptions = { 
    contentType: [
      {
        id: "syllabus",
        label: "Course Syllabus",
        value: "Extract key learning objectives from the syllabus",
      },
      {
        id: "lecture",
        label: "Lecture Contents",
        value: "Identify main concepts from lecture materials",
      },
      {
        id: "specs",
        label: "Table of Specifications",
        value: "Use the specifications table to guide question creation",
      },
    ],
    taxonomyLevel: [
      {
        id: "remember",
        label: "Remember",
        value: "Create recall and memory questions",
      },
      {
        id: "understand",
        label: "Understand",
        value: "Create comprehension questions",
      },
      { id: "apply", label: "Apply", value: "Create application questions" },
      { id: "analyze", label: "Analyze", value: "Create analysis questions" },
      {
        id: "evaluate",
        label: "Evaluate",
        value: "Create evaluation questions",
      },
      { id: "create", label: "Create", value: "Create synthesis questions" },
    ],
    questionType: [
      {
        id: "mc",
        label: "Multiple Choice",
        value: "Format as multiple choice questions",
      },
      {
        id: "tf",
        label: "True/False",
        value: "Format as true/false questions",
      },
      { id: "essay", label: "Essay", value: "Format as essay questions" },
    ],
    questionCount: [
      { id: "10", label: "10 Questions", value: "10" },
      { id: "20", label: "20 Questions", value: "20" },
      { id: "30", label: "30 Questions", value: "30" },
    ],
    includeAnswer: [
      {
        id: "includeAnswer",
        label: "Include Answers",
        value: "Include answers in the output",
      },
    ],
  };

  // State to track selected options
  const [selectedOptions, setSelectedOptions] = useState({
    contentType: [],
    taxonomyLevel: [],
    questionType: [],
    questionCount: [],
    includeAnswer: [],
  });

  // State for document upload
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [isFileLoading, setIsFileLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle checkbox changes
  const handleCheckboxChange = (category, optionId) => {
    setSelectedOptions((prev) => {
      const updatedCategory = prev[category].includes(optionId)
        ? prev[category].filter((id) => id !== optionId)
        : [...prev[category], optionId];

      return {
        ...prev,
        [category]: updatedCategory,
      };
    });
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsFileLoading(true);

    try {
      const content = await extractTextFromFile(file);
      setFileContent(content);
    } catch (error) {
      console.error("Error extracting text:", error);
      alert("Failed to extract text from the file. Please try another file.");
      setUploadedFile(null);
    } finally {
      setIsFileLoading(false);
    }
  };

  // Extract text based on file type
  const extractTextFromFile = async (file) => {
    const fileType = file.type;
    const fileText = await readFileAsText(file);

    // For basic text files
    if (fileType === "text/plain") {
      return fileText;
    }

    // For PDF files
    if (fileType === "application/pdf") {
      alert(
        "PDF processing requires a server-side component or PDF.js. Using file name for demo purposes."
      );
      return `[Content extracted from PDF: ${file.name}]`;
    }

    // For Word documents
    if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      alert(
        "Word document processing requires a server-side component. Using file name for demo purposes."
      );
      return `[Content extracted from Word doc: ${file.name}]`;
    }

    // For other file types
    return `[Content from file: ${file.name}]`;
  };

  // Read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  // Build prompt from selected options
  const buildPrompt = () => {
    let prompt = "I have educational content that I need to process. ";

    // Add content type instructions
    if (selectedOptions.contentType.length > 0) {
      prompt += "The content includes: ";
      selectedOptions.contentType.forEach((optionId, index) => {
        const option = promptOptions.contentType.find(
          (opt) => opt.id === optionId
        );
        prompt += option.value;
        if (index < selectedOptions.contentType.length - 1) prompt += ", and ";
        else prompt += ". ";
      });
    }

    // Add taxonomy level instructions
    if (selectedOptions.taxonomyLevel.length > 0) {
      prompt += "Please create questions at these Bloom's Taxonomy levels: ";
      selectedOptions.taxonomyLevel.forEach((optionId, index) => {
        const option = promptOptions.taxonomyLevel.find(
          (opt) => opt.id === optionId
        );
        prompt += option.value;
        if (index < selectedOptions.taxonomyLevel.length - 1)
          prompt += ", and ";
        else prompt += ". ";
      });
    }

    // Add question type formatting instructions
    if (selectedOptions.questionType.length > 0) {
      prompt += "Format the questions as: ";
      selectedOptions.questionType.forEach((optionId, index) => {
        const option = promptOptions.questionType.find(
          (opt) => opt.id === optionId
        );
        prompt += option.value;
        if (index < selectedOptions.questionType.length - 1) prompt += ", and ";
        else prompt += ".";
      });
    }
    // Add after the logic for `questionType` in `buildPrompt`
    if (selectedOptions.questionCount.length > 0) {
      const countOption = promptOptions.questionCount.find(
        (opt) => opt.id === selectedOptions.questionCount[0]
      );
      prompt += ` Generate ${countOption.value} questions.`;
    }

    if (selectedOptions.includeAnswer.includes("includeAnswer")) {
      prompt += " Include answers in the output.";
    }

    // Add the file content if available
    if (fileContent) {
      prompt += "\n\nHere is the content to process:\n\n" + fileContent;
    }

    return prompt;
  };

  // Generate and send prompt to AI
  const generateQuestions = async () => {
    const prompt = buildPrompt();

    // Add the generated prompt to the chat as a user message
    const newMessages = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);

    setIsLoading(true);

    try {
      // Using RapidAPI's ChatGPT endpoint
      const options = {
        method: "POST",
        url: "https://chatgpt-ai-chat-bot.p.rapidapi.com/ask",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key":
            "640fd76fa9msh3f8ce7e13c5d29cp1b0d14jsn04aba0c013cb",
          "X-RapidAPI-Host": "chatgpt-ai-chat-bot.p.rapidapi.com",
        },
        data: JSON.stringify({
          query: prompt,
        }),
      };

      const response = await axios.request(options);
      const aiMessage =
        response.data.response || response.data.answer || response.data.text;

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: aiMessage },
      ]);

      /* Uncomment this section if you want to use Claude API instead
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YOUR_ANTHROPIC_API_KEY", // Replace with actual API key
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1000,
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });
  
      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: data.content[0].text },
      ]);
      */
    } catch (error) {
      console.error("Error calling AI API:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: `Error: ${
            error.response?.data?.error?.message || error.message
          }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render checkbox groups for prompt builder
  const renderCheckboxGroup = (category, title) => (
    <div className="checkbox-group">
      <h3>{title}</h3>
      <div className="checkbox-items">
        {promptOptions[category].map((option) => (
          <div key={option.id} className="checkbox-item">
            <input
              type="checkbox"
              id={option.id}
              checked={selectedOptions[category].includes(option.id)}
              onChange={() => handleCheckboxChange(category, option.id)}
            />
            <label htmlFor={option.id}>{option.label}</label>
          </div>
        ))}
      </div>
    </div>
  );

  // Clear all selections and messages
  const handleReset = () => {
    setSelectedOptions({
      contentType: [],
      taxonomyLevel: [],
      questionType: [],
    });
    setUploadedFile(null);
    setFileContent("");
    setMessages([]);
  };

  return (
    <div className="educational-ai-assistant">
      <div className="app-header">
        <h1>Exam Generator name subject to change</h1>
      </div>

      <div className="main-container">
        <div className="prompt-builder">
          <div className="file-upload-section">
            <h3>Upload Document</h3>
            <div className="file-upload-container">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.pdf,.doc,.docx"
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="upload-button"
              >
                Select Document
              </button>
              <span className="file-name">
                {isFileLoading
                  ? "Processing file..."
                  : uploadedFile
                  ? uploadedFile.name
                  : "No file selected"}
              </span>
            </div>
          </div>

          <div className="options-container">
            {renderCheckboxGroup("contentType", "Content Type")}
            {renderCheckboxGroup("taxonomyLevel", "Bloom's Taxonomy Level")}
            {renderCheckboxGroup("questionType", "Question Format")}
            {renderCheckboxGroup("questionCount", "Number of Questions")}
            {renderCheckboxGroup("includeAnswer", "Include Answers")}
          </div>

          <div className="action-buttons">
            <button
              onClick={generateQuestions}
              className="generate-button"
              disabled={
                isLoading ||
                (!fileContent &&
                  selectedOptions.contentType.length === 0 &&
                  selectedOptions.taxonomyLevel.length === 0 &&
                  selectedOptions.questionType.length === 0)
              }
            >
              {isLoading ? "Generating..." : "Generate Questions"}
            </button>

            <button
              onClick={handleReset}
              className="reset-button"
              disabled={isLoading}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="results-panel">
          <h2>Generated Questions</h2>
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === "user" ? "user" : "ai"}`}
              >
                {msg.role === "user" ? (
                  <details>
                    <summary>Prompt Details</summary>
                    <div className="prompt-content">{msg.content}</div>
                  </details>
                ) : (
                  <div className="ai-response">{msg.content}</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <div>Generating questions...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EducationalAIAssistant;
