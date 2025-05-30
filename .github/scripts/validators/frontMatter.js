const yaml = require('js-yaml');
const axios = require('axios');

/**
 * Validates the front matter of a markdown file
 * @param {string} fileContent - Content of the file to validate
 * @param {string} filePath - Path to the file (for error messages)
 * @returns {Promise<string|null>} Error message or null if valid
 */
async function validateFrontMatter(fileContent, filePath) {
  // Extract front matter
  const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
  const frontMatterMatch = fileContent.match(frontMatterRegex);
  
  if (!frontMatterMatch) {
    return `No front matter found in ${filePath}`;
  }
  
  try {
    // Parse front matter as YAML
    const frontMatter = yaml.load(frontMatterMatch[1]);
    
    // Check required fields
    const requiredFields = [
      'repo',
      'category', 
      'language',
      'start_command',
      'build_command'
    ];
    
    for (const field of requiredFields) {
      if (!frontMatter[field]) {
        return `Missing required field '${field}' in ${filePath}`;
      }
      
      // Check if field is not just whitespace
      if (typeof frontMatter[field] === 'string' && frontMatter[field].trim() === '') {
        return `Required field '${field}' cannot be empty in ${filePath}`;
      }
    }
    
    // Validate repository URL format
    const repoUrlRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
    if (!repoUrlRegex.test(frontMatter.repo)) {
      return `Invalid repository URL format in ${filePath}. Should be in format https://github.com/username/repo-name`;
    }
    
    // Validate category length (from existing category validator logic)
    if (typeof frontMatter.category === 'string' && frontMatter.category.trim().length < 2) {
      return `Field 'category' must be at least 2 characters long in ${filePath}. Found: "${frontMatter.category.trim()}"`;
    }
    
    // Check if GitHub repository exists
    try {
      const repoUrl = frontMatter.repo;
      const apiUrl = repoUrl.replace('https://github.com/', 'https://api.github.com/repos/');
      const response = await axios.get(apiUrl);
      
      if (response.status !== 200) {
        return `GitHub repository ${repoUrl} does not exist or is not accessible`;
      }
    } catch (error) {
      return `Error checking GitHub repository: ${error.message}`;
    }
    
    // Optional: Check if logo URL is valid if present
    if (frontMatter.logo) {
      const logoUrlRegex = /^https?:\/\/.+\..+$/;
      if (!logoUrlRegex.test(frontMatter.logo)) {
        return `Invalid logo URL format in ${filePath}`;
      }
    }
    
    return null; // No errors
  } catch (error) {
    return `Error parsing front matter in ${filePath}: ${error.message}`;
  }
}

module.exports = { validateFrontMatter };