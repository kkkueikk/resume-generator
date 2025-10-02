import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const AVAILABLE_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'Git',
  'CI/CD',
  'REST API',
  'GraphQL',
  'HTML/CSS',
  'Tailwind CSS',
  'Redux',
  'Express.js',
  'Next.js',
  'Vue.js',
  'Angular',
  'Machine Learning',
  'Data Analysis',
  'Agile/Scrum',
  'Testing (Jest/Cypress)',
  'Linux',
  'Azure'
];

export default function SkillSelector({ selectedSkills, onSkillsChange }) {
  const { colors, isDark } = useTheme();

  const handleToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter(s => s !== skill));
    } else {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  return (
    <div className="space-y-6">
      <p className={`${colors.text} text-xs md:text-sm leading-loose`}>
        SELECT THE SKILLS YOU WANT TO HIGHLIGHT:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {AVAILABLE_SKILLS.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          return (
            <label
              key={skill}
              className={`
                flex items-center space-x-3 p-3 border-2 cursor-pointer transition-all
                ${isSelected
                  ? `${colors.borderAccent} ${colors.bgSelected} ${colors.shadowSmall}`
                  : `${colors.borderSecondary} ${colors.bgBox} ${colors.bgHover}`
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(skill)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected ? `${colors.borderAccent} ${colors.textAccent.replace('text-', 'bg-')}` : `${colors.border} ${colors.bg}`
              }`}>
                {isSelected && (
                  <div className="w-2 h-2 bg-white"></div>
                )}
              </div>
              <span className={`text-xs leading-loose ${
                isSelected ? colors.textHighlight : colors.text
              }`}>
                {skill}
              </span>
            </label>
          );
        })}
      </div>

      <div className={`mt-6 pt-4 border-t-2 ${colors.borderSecondary}`}>
        <p className={`text-xs ${colors.textSecondary} leading-loose`}>
          &gt; SELECTED: <span className={colors.textAccent}>{selectedSkills.length}</span> SKILLS
        </p>
      </div>
    </div>
  );
}