import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { validateEmail, validatePhone, validateUrl, validateImageFile, imageToBase64, sanitizeString } from '../../types/resumeTypes';

export default function PersonalInfoForm({ data, onChange, errors }) {
  const { colors } = useTheme();
  const [imagePreview, setImagePreview] = useState(data.profileImage || null);
  const [imageError, setImageError] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error);
      return;
    }

    try {
      const base64 = await imageToBase64(file);
      setImagePreview(base64);
      onChange('profileImage', base64);
      setImageError('');
    } catch (error) {
      setImageError('Failed to process image');
    }
  };

  const handleChange = (field, value) => {
    onChange(field, sanitizeString(value));
  };

  return (
    <div className="space-y-6">
      {/* Profile Image Upload - Enlarged & Centered */}
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Profile"
              className={`w-48 h-48 object-cover border-4 ${colors.border}`}
            />
            <button
              onClick={() => {
                setImagePreview(null);
                onChange('profileImage', '');
              }}
              className={`absolute -top-2 -right-2 w-8 h-8 ${colors.bgSelected} ${colors.borderAccent} border-2 ${colors.textAccent} text-sm flex items-center justify-center hover:scale-110 transition-transform`}
            >
              ×
            </button>
          </div>
        ) : (
          <label className={`w-48 h-48 border-4 border-dashed ${colors.border} flex flex-col items-center justify-center gap-3 cursor-pointer ${colors.bgHover} transition-all hover:border-solid hover:scale-105`}>
            <span className="text-6xl">📷</span>
            <span className={`text-sm ${colors.textSecondary} leading-relaxed text-center px-2 font-bold`}>
              UPLOAD<br/>PHOTO
            </span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
        {imageError && (
          <p className={`text-xs ${colors.textAccent} leading-relaxed text-center`}>{imageError}</p>
        )}
        <p className={`text-xs ${colors.textSecondary} leading-relaxed text-center max-w-xs`}>
          Optional • JPG, PNG, WebP • Max 5MB
        </p>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={`block text-xs ${colors.text} mb-2 leading-relaxed`}>
            FULL NAME *
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
            placeholder="Jane Doe"
          />
          {errors.fullName && (
            <p className={`text-xs ${colors.textAccent} mt-1 leading-relaxed`}>{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className={`block text-xs ${colors.text} mb-2 leading-relaxed`}>
            EMAIL *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
            placeholder="jane@example.com"
          />
          {errors.email && (
            <p className={`text-xs ${colors.textAccent} mt-1 leading-relaxed`}>{errors.email}</p>
          )}
        </div>

        <div>
          <label className={`block text-xs ${colors.text} mb-2 leading-relaxed`}>
            PHONE
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-xs ${colors.text} mb-2 leading-relaxed`}>
            LOCATION
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
            placeholder="San Francisco, CA"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className={`text-sm ${colors.text} font-bold leading-relaxed`}>SOCIAL LINKS</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs ${colors.text} mb-2 leading-relaxed`}>
              LINKEDIN
            </label>
            <input
              type="url"
              value={data.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className={`block text-xs ${colors.text} mb-2 leading-relaxed`}>
              GITHUB
            </label>
            <input
              type="text"
              value={data.github}
              onChange={(e) => handleChange('github', e.target.value)}
              className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
              placeholder="username"
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-xs ${colors.text} mb-2 leading-relaxed`}>
              WEBSITE
            </label>
            <input
              type="url"
              value={data.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className={`w-full px-3 py-2 border-2 ${colors.border} ${colors.bg} ${colors.text} text-xs leading-relaxed focus:outline-none focus:${colors.borderAccent}`}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      {/* Contact Icons Toggle - Improved Visual */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="showContactIcons"
          checked={data.showContactIcons}
          onChange={(e) => onChange('showContactIcons', e.target.checked)}
          className="sr-only"
        />
        <label
          htmlFor="showContactIcons"
          className="cursor-pointer"
        >
          <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${
            data.showContactIcons
              ? `${colors.borderAccent} ${colors.textAccent.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`
              : `${colors.border} ${colors.bg}`
          }`}>
            {data.showContactIcons && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </label>
        <label
          htmlFor="showContactIcons"
          className={`text-xs ${data.showContactIcons ? colors.text : colors.textSecondary} leading-relaxed cursor-pointer transition-colors`}
        >
          SHOW ICONS FOR CONTACT INFO
        </label>
      </div>
    </div>
  );
}