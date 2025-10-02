import { useState, useEffect } from 'react';
import Modal from './components/Modal';
import ResumeForm from './components/ResumeForm';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './contexts/ThemeContext';
import { fetchUserRepositories, processRepositoryData } from './services/githubService';
import { prepareResumeData, generateResume, downloadResumePDF } from './services/resumeService';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allRepos, setAllRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [hasShownInitialModal, setHasShownInitialModal] = useState(false);
  const { colors } = useTheme();

  // Load repos on mount
  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      const repos = await fetchUserRepositories();
      const processedRepos = await Promise.all(
        repos.map(repo => processRepositoryData(repo))
      );
      setAllRepos(processedRepos);
    } catch (error) {
      console.error('Error loading repos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show modal on first load
  useEffect(() => {
    if (!hasShownInitialModal && !loading) {
      setIsModalOpen(true);
      setHasShownInitialModal(true);
    }
  }, [hasShownInitialModal, loading]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleGenerateResume = async (formData) => {
    try {
      setGenerating(true);

      // Prepare data for API
      const resumeData = prepareResumeData(formData, allRepos);

      // Generate resume (calls FastAPI → LLM → PDF)
      const result = await generateResume(resumeData);

      setGeneratedResume(result);
      setIsModalOpen(false);

      // Show success message
      alert('Resume generated successfully! Click "Download Resume" to save it.');
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!generatedResume || !generatedResume.pdfUrl) return;

    try {
      await downloadResumePDF(generatedResume.pdfUrl, 'resume.pdf');
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen ${colors.bg} flex flex-col items-center justify-center p-4`}>
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Pixel Art Banner Title */}
      <div className="mb-8 text-center">
        <div className="relative inline-block">
          {/* Decorative top border */}
          <div className="flex justify-center mb-2 space-x-1">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`w-2 h-2 ${colors.pixel}`}></div>
            ))}
          </div>

          <h1 className={`text-2xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 ${colors.glow} px-6 py-4 border-4 ${colors.border} ${colors.bg} leading-relaxed`}>
            RESUME GENERATOR
          </h1>

          {/* Decorative bottom border */}
          <div className="flex justify-center mt-2 space-x-1">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`w-2 h-2 ${colors.pixelAlt}`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <main className="w-full max-w-4xl">
        <div className={`border-4 ${colors.border} ${colors.bgCard} p-6 md:p-8 ${colors.shadow}`}>
          <h2 className={`text-lg md:text-xl ${colors.text} mb-6 leading-relaxed`}>
            &gt; RESUME STATUS
          </h2>

          {!generatedResume ? (
            <div className={`text-center py-12 border-2 ${colors.borderSecondary} ${colors.bgBox}`}>
              <div className="text-6xl mb-4">📝</div>
              <p className={`text-xs md:text-sm ${colors.textSecondary} leading-loose`}>
                NO RESUME GENERATED YET
              </p>
              <p className={`mt-4 text-xs ${colors.pixelAlt === 'bg-cyan-500' ? 'text-cyan-600' : 'text-cyan-500'} leading-loose`}>
                FILL OUT YOUR PROFILE TO GET STARTED
              </p>
            </div>
          ) : (
            <div className={`border-2 ${colors.borderSecondary} ${colors.bgBox} p-6 space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="text-4xl">✅</div>
                <div>
                  <h3 className={`text-sm font-bold ${colors.text} leading-relaxed`}>
                    RESUME GENERATED
                  </h3>
                  <p className={`text-xs ${colors.textSecondary} leading-relaxed`}>
                    Generated at: {new Date().toLocaleString()}
                  </p>
                </div>
              </div>

              {generatedResume.generatedContent?.summary && (
                <div className={`border-t-2 ${colors.borderSecondary} pt-4`}>
                  <p className={`text-xs ${colors.text} leading-relaxed`}>
                    {generatedResume.generatedContent.summary}
                  </p>
                </div>
              )}

              <button
                onClick={handleDownloadResume}
                className={`w-full retro-button px-6 py-3 ${colors.buttonGradient} text-white border-2 ${colors.border} text-xs ${colors.buttonHover} transition-all leading-relaxed ${colors.shadowButton}`}
              >
                ⬇ DOWNLOAD RESUME PDF
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleOpenModal}
          disabled={generating}
          className={`retro-button px-8 py-4 ${colors.buttonGradient} text-white border-4 ${colors.border} text-sm md:text-base ${colors.buttonHover} transition-all leading-relaxed ${colors.shadowButton} ${
            generating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {generating ? '⏳ GENERATING...' : generatedResume ? '✏ EDIT RESUME' : '▶ CREATE RESUME'}
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="&gt; RESUME BUILDER_"
      >
        {generating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className={`text-6xl mb-4 animate-pulse`}>🤖</div>
            <p className={`text-xs ${colors.text} leading-loose`}>
              GENERATING YOUR RESUME...
            </p>
            <p className={`text-xs ${colors.textSecondary} leading-loose mt-2`}>
              LLM is analyzing your profile and creating descriptions
            </p>
          </div>
        ) : (
          <ResumeForm onSubmit={handleGenerateResume} />
        )}
      </Modal>
    </div>
  );
}

export default App;