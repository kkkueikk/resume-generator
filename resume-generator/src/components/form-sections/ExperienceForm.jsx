import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { sanitizeString, sanitizeDescription } from '../../types/resumeTypes';
import { fetchUserRepositories, processRepositoryData, getRepositoryTags } from '../../services/githubService';

const EXPERIENCE_TYPES = [
  { value: 'work', label: 'Work Experience', icon: '💼' },
  { value: 'project', label: 'Project', icon: '🚀' },
  { value: 'volunteer', label: 'Volunteer', icon: '🤝' },
  { value: 'honor', label: 'Honor/Award', icon: '🏆' },
];

export default function ExperienceForm({ experiences, selectedRepoIds, onExperiencesChange, onReposChange, errors }) {
  const { colors, isDark } = useTheme();
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [showRepoSelector, setShowRepoSelector] = useState(false);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      setLoadingRepos(true);
      const reposData = await fetchUserRepositories();
      const processedRepos = await Promise.all(
        reposData.map(repo => processRepositoryData(repo))
      );
      setRepos(processedRepos);
    } catch (error) {
      console.error('Error loading repos:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const addExperience = (type = 'work') => {
    const newExp = {
      id: `exp${Date.now()}`,
      type,
      title: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      technologies: [],
      repoId: null,
      repoData: null
    };
    onExperiencesChange([...experiences, newExp]);
  };

  const updateExperience = (id, field, value) => {
    onExperiencesChange(experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: field === 'description' ? sanitizeDescription(value) : sanitizeString(value) } : exp
    ));
  };

  const deleteExperience = (id) => {
    onExperiencesChange(experiences.filter(exp => exp.id !== id));
  };

  const linkRepoToExperience = (expId, repoId) => {
    const repo = repos.find(r => r.id === repoId);
    onExperiencesChange(experiences.map(exp =>
      exp.id === expId ? { ...exp, repoId, repoData: repo } : exp
    ));
  };

  const unlinkRepo = (expId) => {
    onExperiencesChange(experiences.map(exp =>
      exp.id === expId ? { ...exp, repoId: null, repoData: null } : exp
    ));
  };

  const toggleRepoSelection = (repoId) => {
    if (selectedRepoIds.includes(repoId)) {
      onReposChange(selectedRepoIds.filter(id => id !== repoId));
    } else {
      onReposChange([...selectedRepoIds, repoId]);
    }
  };

  const getTagColor = (type) => {
    switch (type) {
      case 'topic':
        return isDark ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300' : 'border-cyan-600 bg-cyan-100 text-cyan-700';
      case 'language':
        return isDark ? 'border-green-500 bg-green-900/30 text-green-300' : 'border-green-600 bg-green-100 text-green-700';
      case 'generated':
        return isDark ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300' : 'border-yellow-600 bg-yellow-100 text-yellow-700';
      default:
        return '';
    }
  };

  const groupedExperiences = EXPERIENCE_TYPES.map(type => ({
    ...type,
    items: experiences.filter(exp => exp.type === type.value)
  }));

  return (
    <div className="space-y-6">
      {/* GitHub Repositories Section */}
      <div className={`border-2 ${colors.border} ${colors.bgBox} p-4 space-y-4`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-sm ${colors.text} font-bold leading-relaxed`}>
              📦 GITHUB REPOSITORIES
            </h3>
            <p className={`text-xs ${colors.textSecondary} leading-relaxed mt-1`}>
              Select repos - LLM will categorize them automatically
            </p>
          </div>
          <button
            onClick={() => setShowRepoSelector(!showRepoSelector)}
            className={`px-4 py-2 border-2 ${colors.border} ${colors.text} ${colors.bgHover} text-xs leading-relaxed`}
          >
            {showRepoSelector ? 'HIDE' : 'SHOW'} REPOS ({selectedRepoIds.length})
          </button>
        </div>

        {showRepoSelector && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loadingRepos ? (
              <div className={`text-center py-8 text-xs ${colors.textSecondary}`}>
                LOADING REPOSITORIES...
              </div>
            ) : repos.length === 0 ? (
              <div className={`text-center py-8 text-xs ${colors.textSecondary}`}>
                NO REPOSITORIES FOUND
              </div>
            ) : (
              repos.map(repo => {
                const isSelected = selectedRepoIds.includes(repo.id);
                const tags = getRepositoryTags(repo);
                return (
                  <div
                    key={repo.id}
                    onClick={() => toggleRepoSelection(repo.id)}
                    className={`
                      border-2 p-3 cursor-pointer transition-all
                      ${isSelected
                        ? `${colors.borderAccent} ${colors.bgSelected}`
                        : `${colors.borderSecondary} ${colors.bgBox} ${colors.bgHover}`
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 mt-1 border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? `${colors.borderAccent} ${colors.textAccent.replace('text-', 'bg-')}` : `${colors.border} ${colors.bg}`
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white"></div>}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-xs font-bold ${colors.text} leading-relaxed`}>
                          {repo.name}
                          {repo.private && (
                            <span className={`ml-2 text-xs px-2 py-1 border ${colors.borderSecondary} ${colors.textSecondary}`}>
                              PRIVATE
                            </span>
                          )}
                        </h4>
                        {repo.description && (
                          <p className={`text-xs ${colors.textSecondary} leading-relaxed mt-1`}>
                            {repo.description}
                          </p>
                        )}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tags.map((tag, i) => (
                              <span key={i} className={`text-xs px-2 py-1 border leading-relaxed ${getTagColor(tag.type)}`}>
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Manual Experiences by Type */}
      {groupedExperiences.map(group => (
        <div key={group.value} className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className={`text-sm ${colors.text} font-bold leading-relaxed`}>
              {group.icon} {group.label.toUpperCase()} ({group.items.length})
            </h3>
            <button
              onClick={() => addExperience(group.value)}
              className={`px-4 py-2 border-2 ${colors.border} ${colors.text} ${colors.bgHover} text-xs leading-relaxed`}
            >
              + ADD {group.label.toUpperCase()}
            </button>
          </div>

          {group.items.length > 0 && (
            <div className="space-y-3">
              {group.items.map(exp => (
                <div key={exp.id} className={`border-2 ${colors.borderSecondary} ${colors.bgBox} p-4 space-y-3`}>
                  <div className="flex justify-between items-start">
                    <h4 className={`text-xs ${colors.text} font-bold leading-relaxed`}>
                      {exp.title || `New ${group.label}`}
                    </h4>
                    <button
                      onClick={() => deleteExperience(exp.id)}
                      className={`text-xs ${colors.textAccent} ${colors.bgHover} px-2 py-1`}
                    >
                      DELETE
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className={`block text-xs ${colors.textSecondary} mb-1 leading-relaxed`}>
                        TITLE/POSITION
                      </label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                        className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none`}
                        placeholder="Software Engineer"
                      />
                    </div>

                    <div>
                      <label className={`block text-xs ${colors.textSecondary} mb-1 leading-relaxed`}>
                        ORGANIZATION
                      </label>
                      <input
                        type="text"
                        value={exp.organization}
                        onChange={(e) => updateExperience(exp.id, 'organization', e.target.value)}
                        className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none`}
                        placeholder="Company Name"
                      />
                    </div>

                    <div>
                      <label className={`block text-xs ${colors.textSecondary} mb-1 leading-relaxed`}>
                        LOCATION
                      </label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                        className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none`}
                        placeholder="San Francisco, CA"
                      />
                    </div>

                    <div>
                      <label className={`block text-xs ${colors.textSecondary} mb-1 leading-relaxed`}>
                        START DATE
                      </label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none`}
                        placeholder="2023-06"
                      />
                    </div>

                    <div>
                      <label className={`block text-xs ${colors.textSecondary} mb-1 leading-relaxed`}>
                        END DATE
                      </label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none`}
                        placeholder="Present"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-xs ${colors.textSecondary} mb-1 leading-relaxed`}>
                        DESCRIPTION
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none`}
                        placeholder="Brief description of your role and achievements..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}