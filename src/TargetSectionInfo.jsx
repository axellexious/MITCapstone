import React from "react";

const TargetSectionInfo = ({ contentType }) => {
  let targetSection = null;
  let description = "";

  if (contentType.includes("syllabus")) {
    targetSection = "Learning Objectives";
    description = "Analyzing learning objectives, goals, and outcomes sections";
  } else if (contentType.includes("specs")) {
    targetSection = "Assessment";
    description = "Focusing on evaluation, grading, and test specifications";
  } else if (contentType.includes("lecture")) {
    targetSection = "Main Content";
    description = "Examining the core lecture material and content";
  } else {
    return null; // No targeting active
  }

  return (
    <div className="target-section-info">
      <div className="target-badge">
        <span className="target-icon">🎯</span>
        <span className="target-text">Targeted Analysis: {targetSection}</span>
      </div>
      <div className="target-description">{description}</div>
    </div>
  );
};

export default TargetSectionInfo;
