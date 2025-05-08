import React, { useState, useRef } from "react";
import axios from "axios";
import mammoth from "mammoth";
import TargetSectionInfo from "./TargetSectionInfo";
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

  // Editable response states
  const [editableContent, setEditableContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(null);

  // Handle checkbox changes
  const handleCheckboxChange = (category, optionId) => {
    setSelectedOptions((prev) => {
      // For questionCount, only allow one selection
      if (category === "questionCount") {
        return {
          ...prev,
          [category]: prev[category].includes(optionId) ? [] : [optionId],
        };
      }

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

    // For plain text files
    if (fileType === "text/plain") {
      return await readFileAsText(file);
    }

    // For Word documents
    if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (error) {
        console.error("Error processing Word document:", error);
        return `[Error extracting content from ${file.name}]`;
      }
    }

    // For PDF files
    if (fileType === "application/pdf") {
      return `[PDF support requires additional setup. File name: ${file.name}]`;
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

  // Read file as ArrayBuffer (for Word docs)
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Process document content to focus on specific sections based on user selection
   * @param {string} content - The full document content
   * @param {Object} options - Processing options
   * @returns {string} Processed content focusing on relevant sections
   */
  const processTargetedContent = (content, options = {}) => {
    // Default to processing the entire document if no specific options
    if (!options.targetSection) {
      return content;
    }

    // Define section markers based on common document structures
    const sectionMarkers = {
      introduction: [/introduction/i, /overview/i, /background/i],
      mainContent: [/main\s+content/i, /body/i, /content/i],
      learningObjectives: [
        /learning\s+objectives/i,
        /objectives/i,
        /goals/i,
        /outcomes/i,
      ],
      assessment: [
        /assessment/i,
        /evaluation/i,
        /grading/i,
        /tests/i,
        /exams/i,
      ],
      conclusion: [/conclusion/i, /summary/i, /closing/i],
    };

    // Target specific section
    const targetPatterns = sectionMarkers[options.targetSection];
    if (!targetPatterns) {
      return content;
    }

    // Try to identify sections based on headings or markers
    const lines = content.split("\n");
    let inTargetSection = false;
    let targetContent = [];
    let currentSection = "";

    for (let line of lines) {
      // Check if line looks like a section heading
      const isHeading =
        /^\s*(?:[A-Z][a-z]*\s*)+[:.]\s*$/.test(line) ||
        /^\s*(?:[IVX]+\.|[0-9]+\.|[A-Z]\.)\s+/.test(line) ||
        /^#+\s+/.test(line); // Markdown style

      if (isHeading) {
        // Determine which section this heading represents
        let matchedSection = "";
        for (const [section, patterns] of Object.entries(sectionMarkers)) {
          if (patterns.some((pattern) => pattern.test(line))) {
            matchedSection = section;
            break;
          }
        }

        if (matchedSection) {
          currentSection = matchedSection;
          inTargetSection = currentSection === options.targetSection;
        }
      }

      // Collect content if we're in the target section
      if (inTargetSection) {
        targetContent.push(line);
      }
    }

    // If we didn't find the section with headers, try keyword-based approach
    if (targetContent.length === 0) {
      // Create a focused prompt instead
      return `Please focus ONLY on the ${options.targetSection
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()} 
      aspects of the following content:\n\n${content}`;
    }

    return targetContent.join("\n");
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

    // Add question count
    if (selectedOptions.questionCount.length > 0) {
      const countOption = promptOptions.questionCount.find(
        (opt) => opt.id === selectedOptions.questionCount[0]
      );
      prompt += ` Generate ${countOption.value} questions.`;
    }

    // Add answer option
    if (selectedOptions.includeAnswer.includes("includeAnswer")) {
      prompt += " Include answers in the output.";
    }

    // Add the file content if available, using targeted processing
    if (fileContent) {
      // Determine which section to target based on selected content type
      let targetSection = null;

      if (selectedOptions.contentType.includes("syllabus")) {
        targetSection = "learningObjectives";
      } else if (selectedOptions.contentType.includes("specs")) {
        targetSection = "assessment";
      } else if (selectedOptions.contentType.includes("lecture")) {
        targetSection = "mainContent";
      }

      // Process the content with targeting if applicable
      const processedContent = targetSection
        ? processTargetedContent(fileContent, { targetSection })
        : fileContent;

      prompt += "\n\nHere is the content to process:\n\n" + processedContent;
    }

    return prompt;
  };

  // Generate and send prompt to AI
  const generateQuestions = async () => {
    const prompt = buildPrompt();

    // Add the generated prompt to the chat as a user message
    const newMessages = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setIsEditing(false);

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

      // Set the content for editing
      setEditableContent(aiMessage);
    } catch (error) {
      console.error("Error calling AI API:", error);
      const errorMessage = `Error: ${
        error.response?.data?.error?.message || error.message
      }`;

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);

      setEditableContent(errorMessage);
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
      questionCount: [],
      includeAnswer: [],
    });
    setUploadedFile(null);
    setFileContent("");
    setMessages([]);
    setEditableContent("");
    setIsEditing(false);
  };

  // Handle editing toggle
  const toggleEditing = () => {
    // Make sure we're using the most recent AI message when toggling edit mode
    if (!isEditing && messages.length > 0) {
      const assistantMessages = messages.filter(
        (msg) => msg.role === "assistant"
      );
      if (assistantMessages.length > 0) {
        const lastAiMessage = assistantMessages[assistantMessages.length - 1];
        setEditableContent(lastAiMessage.content);
      }
    }
    setIsEditing(!isEditing);
  };

  // Save edited content
  const saveEditedContent = () => {
    if (messages.length > 0) {
      // Update the last AI message with the edited content
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastAiMessageIndex = updatedMessages
          .map((msg, index) => ({ role: msg.role, index }))
          .filter((item) => item.role === "assistant")
          .pop()?.index;

        if (lastAiMessageIndex !== undefined) {
          updatedMessages[lastAiMessageIndex] = {
            ...updatedMessages[lastAiMessageIndex],
            content: editableContent,
          };
        }

        return updatedMessages;
      });
    }

    setIsEditing(false);
  };

  // Handle content change in the editor
  const handleContentChange = (e) => {
    setEditableContent(e.target.value);
  };

  // Copy content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(editableContent)
      .then(() => {
        alert("Content copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy content: ", err);
      });
  };

  // Export content as text file
  const exportAsFile = () => {
    const blob = new Blob([editableContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-questions.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="educational-ai-assistant">
      <div className="app-header">
        <h1>Smart AI Exam Generator</h1>
        <div className="subtitle">With Targeted Document Analysis</div>
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

            {uploadedFile && (
              <TargetSectionInfo contentType={selectedOptions.contentType} />
            )}
          </div>

          <div className="options-container">
            {renderCheckboxGroup(
              "contentType",
              "Content Type (Controls Document Analysis)"
            )}
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
          <div className="results-header">
            <h2>Generated Questions</h2>
            {messages.length > 0 &&
              messages.some((msg) => msg.role === "assistant") && (
                <div className="editor-controls">
                  {isEditing ? (
                    <button
                      className="control-button save"
                      onClick={saveEditedContent}
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      className="control-button edit"
                      onClick={toggleEditing}
                    >
                      Edit Response
                    </button>
                  )}
                  <button
                    className="control-button copy"
                    onClick={copyToClipboard}
                  >
                    Copy
                  </button>
                  <button
                    className="control-button export"
                    onClick={exportAsFile}
                  >
                    Export
                  </button>
                </div>
              )}
          </div>

          {isEditing ? (
            <div className="editable-canvas">
              <textarea
                ref={editorRef}
                value={editableContent}
                onChange={handleContentChange}
                className="editor-textarea"
                placeholder="The AI response will appear here and be editable."
              />
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default EducationalAIAssistant;
