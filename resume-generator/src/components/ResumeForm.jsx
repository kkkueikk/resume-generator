import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import PersonalInfoForm from './form-sections/PersonalInfoForm';
import EducationForm from './form-sections/EducationForm';
import ExperienceForm from './form-sections/ExperienceForm';
import mockResumeData from '../data/mockResumeData.json';

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'experience', label: 'Experience & Projects', icon: '💼' },
];

const STORAGE_KEY = 'resumeFormData';

// Load saved form data from sessionStorage or localStorage
const loadSavedFormData = () => {
  try {
    // Try sessionStorage first (only for current session)
    const sessionData = sessionStorage.getItem(STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }

    // Fall back to localStorage (persists across sessions)
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (error) {
    console.error('Error loading saved form data:', error);
  }

  return mockResumeData;
};

export default function ResumeForm({ onSubmit }) {
  const { colors } = useTheme();
  const [currentSection, setCurrentSection] = useState('personal');
  const [formData, setFormData] = useState(loadSavedFormData);
  const [errors, setErrors] = useState({});

  // Auto-save form data to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [formData]);

  const updatePersonalInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateEducation = (updatedEducation) => {
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const updateExperiences = (updatedExperiences) => {
    setFormData(prev => ({
      ...prev,
      experiences: updatedExperiences
    }));
  };

  const updateSelectedRepos = (repoIds) => {
    setFormData(prev => ({
      ...prev,
      selectedRepoIds: repoIds
    }));
  };

  const handleSubmit = () => {
    // Validate form data
    const validationErrors = validateFormData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear errors and submit
    setErrors({});
    onSubmit(formData);
  };

  const validateFormData = (data) => {
    const errors = {};

    // Personal info validation
    if (!data.personalInfo.fullName || !data.personalInfo.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!data.personalInfo.email || !data.personalInfo.email.trim()) {
      errors.email = 'Email is required';
    }

    // Education validation - check if any education entries have empty required fields
    const incompleteEducation = data.education.some(edu =>
      !edu.institution || !edu.degree || !edu.field || !edu.startDate || !edu.endDate
    );
    if (data.education.length > 0 && incompleteEducation) {
      errors.education = 'Please complete all education entries or remove incomplete ones';
    }

    // Experience validation - check if manual experiences have required fields
    const incompleteExperiences = data.experiences.filter(exp => !exp.repoId).some(exp =>
      !exp.title || !exp.organization || !exp.startDate || !exp.endDate
    );
    if (incompleteExperiences) {
      errors.experiences = 'Please complete all experience entries (title, organization, dates) or remove incomplete ones';
    }

    // Check if at least one repo or manual experience exists
    if (data.selectedRepoIds.length === 0 && data.experiences.filter(exp => !exp.repoId).length === 0) {
      errors.content = 'Please select at least one GitHub repository or add a manual experience entry';
    }

    return errors;
  };

  const getCurrentSectionIndex = () => {
    return SECTIONS.findIndex(s => s.id === currentSection);
  };

  const goToNextSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex < SECTIONS.length - 1) {
      setCurrentSection(SECTIONS[currentIndex + 1].id);
    }
  };

  const goToPrevSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex > 0) {
      setCurrentSection(SECTIONS[currentIndex - 1].id);
    }
  };

  const isLastSection = getCurrentSectionIndex() === SECTIONS.length - 1;
  const isFirstSection = getCurrentSectionIndex() === 0;

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SECTIONS.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setCurrentSection(section.id)}
            className={`
              flex items-center gap-2 px-4 py-2 border-2 text-xs whitespace-nowrap transition-all
              ${currentSection === section.id
                ? `${colors.borderAccent} ${colors.bgSelected} ${colors.textAccent}`
                : `${colors.borderSecondary} ${colors.bgBox} ${colors.text} ${colors.bgHover}`
              }
            `}
          >
            <span>{section.icon}</span>
            <span className="leading-relaxed">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="flex gap-1">
        {SECTIONS.map((section, index) => (
          <div
            key={section.id}
            className={`h-1 flex-1 ${
              index <= getCurrentSectionIndex() ? colors.textAccent.replace('text-', 'bg-') : colors.bgBox
            }`}
          />
        ))}
      </div>

      {/* Validation Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className={`border-2 ${colors.borderAccent} ${colors.bgSelected} p-4`}>
          <h3 className={`text-xs ${colors.textAccent} font-bold mb-2 leading-relaxed`}>
            ⚠ VALIDATION ERRORS
          </h3>
          <ul className="space-y-1">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key} className={`text-xs ${colors.textAccent} leading-relaxed`}>
                • {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Content */}
      <div className="min-h-[400px]">
        {currentSection === 'personal' && (
          <PersonalInfoForm
            data={formData.personalInfo}
            onChange={updatePersonalInfo}
            errors={errors}
          />
        )}

        {currentSection === 'education' && (
          <>
            <EducationForm
              data={formData.education}
              onChange={updateEducation}
              errors={errors}
            />
            {errors.education && (
              <p className={`text-xs ${colors.textAccent} mt-4 leading-relaxed`}>
                {errors.education}
              </p>
            )}
          </>
        )}

        {currentSection === 'experience' && (
          <>
            <ExperienceForm
              experiences={formData.experiences}
              selectedRepoIds={formData.selectedRepoIds}
              onExperiencesChange={updateExperiences}
              onReposChange={updateSelectedRepos}
              errors={errors}
            />
            {(errors.experiences || errors.content) && (
              <div className="mt-4 space-y-2">
                {errors.experiences && (
                  <p className={`text-xs ${colors.textAccent} leading-relaxed`}>
                    {errors.experiences}
                  </p>
                )}
                {errors.content && (
                  <p className={`text-xs ${colors.textAccent} leading-relaxed`}>
                    {errors.content}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className={`flex justify-between items-center pt-4 border-t-2 ${colors.borderSecondary}`}>
        <button
          onClick={goToPrevSection}
          disabled={isFirstSection}
          className={`
            px-6 py-3 border-2 text-xs leading-relaxed transition-all
            ${isFirstSection
              ? `${colors.borderSecondary} ${colors.textSecondary} opacity-50 cursor-not-allowed`
              : `${colors.border} ${colors.text} ${colors.bgHover}`
            }
          `}
        >
          ← BACK
        </button>

        <div className={`text-xs ${colors.textSecondary} leading-relaxed`}>
          STEP {getCurrentSectionIndex() + 1} OF {SECTIONS.length}
        </div>

        {!isLastSection ? (
          <button
            onClick={goToNextSection}
            className={`
              retro-button px-6 py-3 ${colors.buttonGradient} text-white
              border-2 ${colors.border} text-xs ${colors.buttonHover}
              transition-all leading-relaxed
            `}
          >
            NEXT →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className={`
              retro-button px-6 py-3 ${colors.buttonGradient} text-white
              border-2 ${colors.border} text-xs ${colors.buttonHover}
              transition-all leading-relaxed ${colors.shadowButton}
            `}
          >
            ▶ GENERATE RESUME
          </button>
        )}
      </div>
    </div>
  );
}