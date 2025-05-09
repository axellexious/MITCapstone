# Smart AI Exam Generator

A React-based application that leverages AI to generate customized educational questions and assessments from uploaded document content.

## Features

### 1. Document Analysis and Processing
- **File Upload Support**: Process various document formats including text files (.txt) and Microsoft Word documents (.doc, .docx)
- **Targeted Document Analysis**: Intelligently focuses on specific sections of documents based on selected content type:
  - Learning Objectives (for syllabi)
  - Assessment specifications (for table of specifications)
  - Main content (for lecture materials)

### 2. Customizable Question Generation
- **Bloom's Taxonomy Integration**: Generate questions at different cognitive levels:
  - Remember
  - Understand
  - Apply
  - Analyze
  - Evaluate
  - Create
- **Multiple Question Formats**:
  - Multiple Choice
  - True/False
  - Essay
- **Customizable Question Count**: Generate 10, 20, or 30 questions
- **Answer Key Generation**: Option to include answers with generated questions

### 3. User Interface
- **Intuitive Prompt Builder**: Easy-to-use interface with checkboxes to configure question parameters
- **Real-time Preview**: See the generated prompt before submission
- **Responsive Design**: Works on desktops, tablets, and mobile devices

### 4. Results Management
- **Editable Results**: Edit generated content directly in the application
- **Export Options**: Save results as text files
- **Copy to Clipboard**: Quickly copy generated content
- **Conversation History**: Review previous generations and prompts

## Technology Stack

- **Frontend Framework**: React 18.3.1
- **HTTP Client**: Axios for API requests
- **Document Processing**: Mammoth.js for DOCX parsing
- **AI Integration**: OpenAI API (via RapidAPI)
- **Build Tool**: Vite 6

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-ai-exam-generator.git
cd smart-ai-exam-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a `.env` file in the root directory with your API keys:
```
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173/`

## Usage Guide

### 1. Document Upload
- Click "Select Document" to upload your syllabus, lecture notes, or specification document
- The system will automatically process the document content

### 2. Configure Question Parameters
- Select the appropriate content type to target relevant sections
- Choose one or more Bloom's Taxonomy levels
- Select desired question format(s)
- Specify the number of questions to generate
- Toggle "Include Answers" if you need an answer key

### 3. Generate Questions
- Click "Generate Questions" to process your request
- The system will analyze your document and create questions based on your specifications

### 4. Manage Results
- Edit generated content as needed
- Copy to clipboard or export as text file
- Reset to start over with new parameters

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Folder Structure
```
smart-ai-exam-generator/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images and other assets
│   ├── App.jsx            # Main application component
│   ├── EducationalAIAssistant.jsx # Core component
│   ├── TargetSectionInfo.jsx # Section targeting component
│   ├── main.jsx          # Application entry point
│   └── ...               # Other components and styles
├── .env                  # Environment variables (create this)
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

## API Integration

The application currently uses the ChatGPT AI Chat Bot API from RapidAPI. To use your own OpenAI API key directly:

1. Modify the `generateQuestions` function in `EducationalAIAssistant.jsx`
2. Replace the RapidAPI endpoint with a direct call to OpenAI's API

## Future Enhancements

- PDF document support
- More question formats (matching, fill-in-the-blanks)
- Question difficulty levels
- Export to more formats (DOCX, PDF)
- Batch processing for multiple documents
  
## Contributors
- James Allen M. Josue (axellexious)
  
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin featurefeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for the excellent frontend framework
- OpenAI for the powerful language model
- Mammoth.js for document processing capabilities
