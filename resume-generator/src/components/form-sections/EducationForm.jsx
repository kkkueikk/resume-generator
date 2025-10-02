import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { sanitizeString, validateDate } from '../../types/resumeTypes';

export default function EducationForm({ data, onChange, errors }) {
  const { colors } = useTheme();
  const [editingId, setEditingId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const addEducation = () => {
    const newEdu = {
      id: `edu${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      achievements: []
    };
    onChange([...data, newEdu]);
    setEditingId(newEdu.id);
  };

  const validateField = (id, field, value) => {
    const errors = { ...validationErrors };
    const key = `${id}-${field}`;

    if (field === 'startDate' || field === 'endDate') {
      if (value && !validateDate(value)) {
        errors[key] = 'Invalid date format (use YYYY-MM or Present)';
      } else {
        delete errors[key];
      }
    }

    if (field === 'gpa') {
      if (value) {
        const gpaMatch = value.match(/^(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)$/);
        if (!gpaMatch) {
          errors[key] = 'Format: 3.8/4.0';
        } else {
          const [_, earned, total] = gpaMatch;
          if (parseFloat(earned) > parseFloat(total)) {
            errors[key] = 'GPA cannot exceed maximum';
          } else {
            delete errors[key];
          }
        }
      } else {
        delete errors[key];
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateEducation = (id, field, value) => {
    onChange(data.map(edu =>
      edu.id === id ? { ...edu, [field]: sanitizeString(value) } : edu
    ));
    validateField(id, field, value);
  };

  const deleteEducation = (id) => {
    onChange(data.filter(edu => edu.id !== id));
  };

  const addAchievement = (id) => {
    onChange(data.map(edu =>
      edu.id === id ? { ...edu, achievements: [...edu.achievements, ''] } : edu
    ));
  };

  const updateAchievement = (eduId, index, value) => {
    onChange(data.map(edu =>
      edu.id === eduId
        ? {
            ...edu,
            achievements: edu.achievements.map((a, i) =>
              i === index ? sanitizeString(value) : a
            )
          }
        : edu
    ));
  };

  const deleteAchievement = (eduId, index) => {
    onChange(data.map(edu =>
      edu.id === eduId
        ? {
            ...edu,
            achievements: edu.achievements.filter((_, i) => i !== index)
          }
        : edu
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-sm ${colors.text} font-bold leading-relaxed`}>
          EDUCATION HISTORY
        </h3>
        <button
          onClick={addEducation}
          className={`px-4 py-2 border-2 ${colors.border} ${colors.text} ${colors.bgHover} text-xs leading-relaxed`}
        >
          + ADD EDUCATION
        </button>
      </div>

      {data.length === 0 ? (
        <div className={`text-center py-12 border-2 border-dashed ${colors.borderSecondary} ${colors.bgBox}`}>
          <p className={`text-xs ${colors.textSecondary} leading-loose`}>
            NO EDUCATION ADDED YET
          </p>
          <p className={`text-xs ${colors.textSecondary} leading-loose mt-2`}>
            CLICK "ADD EDUCATION" TO GET STARTED
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((edu) => (
            <div
              key={edu.id}
              className={`border-2 ${colors.borderSecondary} ${colors.bgBox} p-4 space-y-4`}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <h4 className={`text-xs ${colors.text} font-bold leading-relaxed`}>
                  {edu.institution || 'New Education'}
                </h4>
                <button
                  onClick={() => deleteEducation(edu.id)}
                  className={`text-xs ${colors.textAccent} ${colors.bgHover} px-2 py-1`}
                >
                  DELETE
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-xs ${colors.textSecondary} mb-2 leading-relaxed`}>
                    INSTITUTION
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
                    placeholder="Stanford University"
                  />
                </div>

                <div>
                  <label className={`block text-xs ${colors.textSecondary} mb-2 leading-relaxed`}>
                    DEGREE
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
                    placeholder="Bachelor of Science"
                  />
                </div>

                <div>
                  <label className={`block text-xs ${colors.textSecondary} mb-2 leading-relaxed`}>
                    FIELD OF STUDY
                  </label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                    className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <label className={`block text-xs ${colors.textSecondary} mb-2 leading-relaxed`}>
                    START DATE (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                    className={`w-full px-3 py-2 border-2 ${
                      validationErrors[`${edu.id}-startDate`] ? colors.borderAccent : colors.border
                    } ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
                    placeholder="2018-09"
                  />
                  {validationErrors[`${edu.id}-startDate`] && (
                    <p className={`text-xs ${colors.textAccent} mt-1 leading-relaxed`}>
                      {validationErrors[`${edu.id}-startDate`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs ${colors.textSecondary} mb-2 leading-relaxed`}>
                    END DATE (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                    className={`w-full px-3 py-2 border-2 ${
                      validationErrors[`${edu.id}-endDate`] ? colors.borderAccent : colors.border
                    } ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
                    placeholder="2022-06 or Present"
                  />
                  {validationErrors[`${edu.id}-endDate`] && (
                    <p className={`text-xs ${colors.textAccent} mt-1 leading-relaxed`}>
                      {validationErrors[`${edu.id}-endDate`]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-xs ${colors.textSecondary} mb-2 leading-relaxed`}>
                    GPA (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                    className={`w-full px-3 py-2 border-2 ${
                      validationErrors[`${edu.id}-gpa`] ? colors.borderAccent : colors.border
                    } ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
                    placeholder="3.8/4.0"
                  />
                  {validationErrors[`${edu.id}-gpa`] && (
                    <p className={`text-xs ${colors.textAccent} mt-1 leading-relaxed`}>
                      {validationErrors[`${edu.id}-gpa`]}
                    </p>
                  )}
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className={`text-xs ${colors.textSecondary} leading-relaxed`}>
                    ACHIEVEMENTS (OPTIONAL)
                  </label>
                  <button
                    onClick={() => addAchievement(edu.id)}
                    className={`text-xs ${colors.text} ${colors.bgHover} px-2 py-1`}
                  >
                    + ADD
                  </button>
                </div>

                {edu.achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={achievement}
                      onChange={(e) => updateAchievement(edu.id, index, e.target.value)}
                      className={`flex-1 px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
                      placeholder="Dean's List, Honors, Activities..."
                    />
                    <button
                      onClick={() => deleteAchievement(edu.id, index)}
                      className={`px-3 py-2 border-2 ${colors.border} ${colors.text} ${colors.bgHover} text-xs`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}