import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  fetchUserRepositories,
  processRepositoryData,
  getRepositoryTags
} from '../services/githubService';

export default function RepoSelector({ selectedRepos, onReposChange }) {
  const { colors, isDark } = useTheme();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch repositories
      const reposData = await fetchUserRepositories();

      // Process each repository to get languages and generated tags
      const processedRepos = await Promise.all(
        reposData.map(repo => processRepositoryData(repo))
      );

      setRepos(processedRepos);
    } catch (err) {
      setError(err.message);
      console.error('Error loading repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRepo = (repoId) => {
    if (selectedRepos.includes(repoId)) {
      onReposChange(selectedRepos.filter(id => id !== repoId));
    } else {
      onReposChange([...selectedRepos, repoId]);
    }
  };

  const getTagColor = (type) => {
    switch (type) {
      case 'topic':
        return isDark
          ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300'
          : 'border-cyan-600 bg-cyan-100 text-cyan-700';
      case 'language':
        return isDark
          ? 'border-green-500 bg-green-900/30 text-green-300'
          : 'border-green-600 bg-green-100 text-green-700';
      case 'generated':
        return isDark
          ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300'
          : 'border-yellow-600 bg-yellow-100 text-yellow-700';
      default:
        return colors.borderSecondary;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-pulse mb-4">
          <div className={`w-16 h-16 border-4 ${colors.border}`}></div>
        </div>
        <p className={`text-xs ${colors.text} leading-loose`}>
          LOADING REPOSITORIES...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 border-2 ${colors.borderAccent} ${colors.bgBox} p-4`}>
        <p className={`text-xs ${colors.textAccent} leading-loose`}>
          ERROR: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className={`${colors.text} text-xs md:text-sm leading-loose`}>
          SELECT REPOSITORIES TO INCLUDE:
        </p>
        <div className="flex gap-4 text-xs leading-loose">
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 border ${isDark ? 'border-cyan-500 bg-cyan-900/30' : 'border-cyan-600 bg-cyan-100'}`}></div>
            <span className={colors.textSecondary}>Topic</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 border ${isDark ? 'border-green-500 bg-green-900/30' : 'border-green-600 bg-green-100'}`}></div>
            <span className={colors.textSecondary}>Language</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 border ${isDark ? 'border-yellow-500 bg-yellow-900/30' : 'border-yellow-600 bg-yellow-100'}`}></div>
            <span className={colors.textSecondary}>AI-Generated</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {repos.map((repo) => {
          const isSelected = selectedRepos.includes(repo.id);
          const tags = getRepositoryTags(repo);

          return (
            <div
              key={repo.id}
              className={`
                border-2 cursor-pointer transition-all p-4
                ${isSelected
                  ? `${colors.borderAccent} ${colors.bgSelected} ${colors.shadowSmall}`
                  : `${colors.borderSecondary} ${colors.bgBox} ${colors.bgHover}`
                }
              `}
              onClick={() => handleToggleRepo(repo.id)}
            >
              {/* Repository Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleRepo(repo.id)}
                      className="sr-only"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? `${colors.borderAccent} ${colors.textAccent.replace('text-', 'bg-')}` : `${colors.border} ${colors.bg}`
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white"></div>
                      )}
                    </div>
                    <h3 className={`text-sm font-bold ${isSelected ? colors.textHighlight : colors.text} leading-relaxed`}>
                      {repo.name}
                    </h3>
                    {repo.private && (
                      <span className={`text-xs px-2 py-1 border ${colors.borderSecondary} ${colors.textSecondary}`}>
                        PRIVATE
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className={`text-xs ${colors.textSecondary} leading-relaxed ml-6`}>
                      {repo.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-6">
                  {tags.map((tag, index) => (
                    <span
                      key={`${tag.name}-${index}`}
                      className={`text-xs px-2 py-1 border leading-relaxed ${getTagColor(tag.type)}`}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={`mt-6 pt-4 border-t-2 ${colors.borderSecondary}`}>
        <p className={`text-xs ${colors.textSecondary} leading-loose`}>
          &gt; SELECTED: <span className={colors.textAccent}>{selectedRepos.length}</span> REPOSITORIES
        </p>
      </div>
    </div>
  );
}