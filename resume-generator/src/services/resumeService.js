// Resume Generation Service
// Handles sending data to FastAPI backend for LLM processing and PDF generation

const CONFIG = {
  USE_MOCK_DATA: true, // Toggle for mock vs real API
  FASTAPI_BASE_URL: 'http://localhost:8000/api',
};

/**
 * Prepare resume data for submission
 * Combines all form data with GitHub repo information
 * @param {Object} formData - Complete form data from ResumeForm
 * @param {Array} allRepos - All processed GitHub repositories
 * @returns {Object} Prepared data for API submission
 */
export const prepareResumeData = (formData, allRepos) => {
  // Get full repo data for selected repos
  const selectedRepos = allRepos.filter(repo =>
    formData.selectedRepoIds.includes(repo.id)
  );

  // Format the data structure for backend
  return {
    personalInfo: {
      fullName: formData.personalInfo.fullName,
      email: formData.personalInfo.email,
      phone: formData.personalInfo.phone,
      location: formData.personalInfo.location,
      linkedin: formData.personalInfo.linkedin,
      github: formData.personalInfo.github,
      website: formData.personalInfo.website,
      profileImage: formData.personalInfo.profileImage,
      showContactIcons: formData.personalInfo.showContactIcons,
    },
    education: formData.education.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate,
      gpa: edu.gpa,
      achievements: edu.achievements.filter(a => a.trim() !== ''),
    })),
    experiences: formData.experiences.map(exp => ({
      type: exp.type,
      title: exp.title,
      organization: exp.organization,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.description,
      technologies: exp.technologies,
      repoId: exp.repoId,
    })),
    githubRepos: selectedRepos.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      private: repo.private,
      topics: repo.topics || [],
      languages: repo.languages || [],
      readmeContent: repo.readmeContent || '',
      generatedTags: repo.generatedTags || [],
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    })),
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
    },
  };
};

/**
 * Generate resume using LLM and create PDF
 * Sends data to FastAPI backend which:
 * 1. Uses LLM to generate descriptions and categorize repos
 * 2. Generates PDF resume
 * 3. Returns PDF download URL
 *
 * @param {Object} resumeData - Prepared resume data
 * @returns {Promise<Object>} Result with PDF URL and generated content
 */
export const generateResume = async (resumeData) => {
  if (CONFIG.USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock response
    return {
      success: true,
      pdfUrl: '/mock-resume.pdf',
      generatedContent: {
        summary: 'Experienced software engineer with expertise in full-stack development...',
        categorizedRepos: resumeData.githubRepos.map(repo => ({
          ...repo,
          category: 'project', // In real implementation, LLM categorizes
          generatedDescription: `${repo.description} - Advanced implementation showcasing strong technical skills.`,
        })),
      },
      message: 'Resume generated successfully!',
    };
  }

  // Real API call to FastAPI backend
  try {
    const response = await fetch(`${CONFIG.FASTAPI_BASE_URL}/generate-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate resume');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating resume:', error);
    throw error;
  }
};

/**
 * Download the generated PDF resume
 * @param {string} pdfUrl - URL to the generated PDF
 * @param {string} filename - Desired filename for download
 */
export const downloadResumePDF = async (pdfUrl, filename = 'resume.pdf') => {
  if (CONFIG.USE_MOCK_DATA) {
    console.log('Mock: Would download PDF from:', pdfUrl);
    alert('Mock mode: Resume would be downloaded as ' + filename);
    return;
  }

  try {
    const response = await fetch(pdfUrl, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

/**
 * Save resume data as draft (optional feature)
 * @param {Object} resumeData - Resume data to save
 * @returns {Promise<Object>} Save confirmation
 */
export const saveDraft = async (resumeData) => {
  if (CONFIG.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('resumeDraft', JSON.stringify(resumeData));
    return { success: true, message: 'Draft saved locally' };
  }

  try {
    const response = await fetch(`${CONFIG.FASTAPI_BASE_URL}/save-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      throw new Error('Failed to save draft');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

/**
 * Load saved draft (optional feature)
 * @returns {Promise<Object|null>} Saved draft data or null
 */
export const loadDraft = async () => {
  if (CONFIG.USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const draft = localStorage.getItem('resumeDraft');
    return draft ? JSON.parse(draft) : null;
  }

  try {
    const response = await fetch(`${CONFIG.FASTAPI_BASE_URL}/load-draft`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.draft || null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export default {
  prepareResumeData,
  generateResume,
  downloadResumePDF,
  saveDraft,
  loadDraft,
};