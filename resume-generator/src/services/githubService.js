// GitHub Service Layer
// This service abstracts GitHub API calls, making it easy to switch between mock data and real API

import mockReposResponse from '../data/mockReposResponse.json';
import mockLanguagesResponse from '../data/mockLanguagesResponse.json';
import mockReadmeResponse from '../data/mockReadmeResponse.json';
import mockGeneratedTags from '../data/mockGeneratedTags.json';

/**
 * Configuration for the GitHub service
 * Toggle USE_MOCK_DATA to switch between mock and real API
 */
const CONFIG = {
  USE_MOCK_DATA: true, // Set to false when ready to use real GitHub API / FastAPI
  FASTAPI_BASE_URL: 'http://localhost:8000/api', // FastAPI backend URL
  GITHUB_API_BASE_URL: 'https://api.github.com', // Direct GitHub API (if not using FastAPI)
};

/**
 * Decode base64 content from GitHub API
 * @param {string} base64Content - Base64 encoded content
 * @returns {string} Decoded content
 */
const decodeBase64 = (base64Content) => {
  try {
    return atob(base64Content.replace(/\n/g, ''));
  } catch (error) {
    console.error('Error decoding base64:', error);
    return '';
  }
};

/**
 * Fetch all repositories for the authenticated user
 * @returns {Promise<Array>} Array of repository objects
 */
export const fetchUserRepositories = async () => {
  if (CONFIG.USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockReposResponse;
  }

  // Real API call to FastAPI backend (which calls GitHub API)
  try {
    const response = await fetch(`${CONFIG.FASTAPI_BASE_URL}/repos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
};

/**
 * Fetch languages for a specific repository
 * @param {string} repoName - Repository name
 * @returns {Promise<Object>} Languages object with language names as keys and bytes as values
 */
export const fetchRepositoryLanguages = async (repoName) => {
  if (CONFIG.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLanguagesResponse[repoName] || {};
  }

  try {
    const response = await fetch(
      `${CONFIG.FASTAPI_BASE_URL}/repos/${repoName}/languages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Languages fetch error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};

/**
 * Fetch README content for a specific repository
 * @param {string} repoName - Repository name
 * @returns {Promise<string>} README content (decoded from base64)
 */
export const fetchRepositoryReadme = async (repoName) => {
  if (CONFIG.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const readmeData = mockReadmeResponse[repoName];
    if (!readmeData) return '';
    return decodeBase64(readmeData.content);
  }

  try {
    const response = await fetch(
      `${CONFIG.FASTAPI_BASE_URL}/repos/${repoName}/readme`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`README fetch error: ${response.status}`);
    }

    const data = await response.json();
    // Decode base64 content from GitHub API
    return decodeBase64(data.content);
  } catch (error) {
    console.error('Error fetching README:', error);
    return ''; // Return empty string if README doesn't exist
  }
};

/**
 * Generate skill tags from README using LLM
 * This will call the FastAPI backend which uses LLM to analyze README
 * @param {string} repoName - Repository name
 * @param {string} readmeContent - README markdown content
 * @returns {Promise<Array<string>>} Generated skill tags
 */
export const generateSkillTagsFromReadme = async (repoName, readmeContent) => {
  if (CONFIG.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockGeneratedTags[repoName] || [];
  }

  try {
    const response = await fetch(`${CONFIG.FASTAPI_BASE_URL}/generate-tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        repo_name: repoName,
        readme_content: readmeContent
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM tag generation error: ${response.status}`);
    }

    const data = await response.json();
    return data.tags || [];
  } catch (error) {
    console.error('Error generating tags:', error);
    return []; // Return empty array on error
  }
};

/**
 * Authenticate with GitHub OAuth via FastAPI
 * @returns {void} Redirects to GitHub OAuth
 */
export const initiateGitHubAuth = () => {
  if (CONFIG.USE_MOCK_DATA) {
    console.log('Mock mode: Skipping GitHub authentication');
    return;
  }

  // Redirect to FastAPI backend which handles GitHub OAuth
  window.location.href = `${CONFIG.FASTAPI_BASE_URL}/auth/github/login`;
};

/**
 * Process repository data to include languages and generated tags
 * @param {Object} repo - Repository object from GitHub API
 * @returns {Promise<Object>} Enhanced repository object
 */
export const processRepositoryData = async (repo) => {
  try {
    // Fetch languages
    const languagesObj = await fetchRepositoryLanguages(repo.name);
    const languages = Object.keys(languagesObj);

    // Fetch README
    const readmeContent = await fetchRepositoryReadme(repo.content);

    // Generate tags from README
    const generatedTags = await generateSkillTagsFromReadme(repo.name, readmeContent);

    return {
      ...repo,
      languages,
      readmeContent,
      generatedTags,
    };
  } catch (error) {
    console.error(`Error processing repo ${repo.name}:`, error);
    return {
      ...repo,
      languages: repo.language ? [repo.language] : [],
      readmeContent: '',
      generatedTags: [],
    };
  }
};

/**
 * Get all unique tags from a repository with their types (no duplicates)
 * @param {Object} repo - Enhanced repository object
 * @returns {Array<{name: string, type: 'topic' | 'language' | 'generated'}>}
 */
export const getRepositoryTags = (repo) => {
  const tags = [];
  const seen = new Set();

  // Helper to add unique tags (case-insensitive)
  const addTag = (name, type) => {
    const normalized = name.toLowerCase().trim();
    if (!seen.has(normalized) && name) {
      seen.add(normalized);
      tags.push({ name, type });
    }
  };

  // Add topics first (from GitHub repo topics)
  repo.topics?.forEach(topic => addTag(topic, 'topic'));

  // Add languages (from languages API)
  repo.languages?.forEach(lang => addTag(lang, 'language'));

  // Add generated tags (from LLM analysis)
  repo.generatedTags?.forEach(tag => addTag(tag, 'generated'));

  return tags;
};

export default {
  fetchUserRepositories,
  fetchRepositoryLanguages,
  fetchRepositoryReadme,
  generateSkillTagsFromReadme,
  initiateGitHubAuth,
  processRepositoryData,
  getRepositoryTags,
};