const fs = require('fs');
const path = require('path');

/**
 * Validates that files follow the expected structure and naming conventions
 * @param {string} filePath - Path to the file being validated
 * @returns {string|null} Error message or null if valid
 */
function validateFileStructure(filePath) {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return `File ${filePath} not found`;
  }
  
  // Check if file is in the correct directory structure
  if (!filePath.startsWith('servers/')) {
    return `File ${filePath} is not in the servers directory`;
  }
  
  // Parse the path components
  const pathParts = filePath.split('/');
  
  // servers/server-name/mcp-server.md
  if (pathParts.length !== 3) {
    return `Invalid path structure: ${filePath}. Expected format: servers/server-name/mcp-server.md`;
  }
  
  // Check if the filename is correct
  const filename = path.basename(filePath);
  if (filename !== 'mcp-server.md') {
    return `Invalid filename: ${filename}. Expected 'mcp-server.md'`;
  }
  
  return null; // No errors
}

module.exports = { validateFileStructure };
