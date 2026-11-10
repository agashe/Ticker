const fs = require('fs');
const path = require('path');

const tagInput = process.argv[2] || process.env.GITHUB_REF_NAME || '';
const version = tagInput.replace(/^v/, '').trim();

const changelogPath = path.join(__dirname, '../CHANGELOG.md');
const outputPath = process.argv[3] || path.join(__dirname, '../RELEASE_NOTES.md');

if (!fs.existsSync(changelogPath)) {
  console.error('CHANGELOG.md not found at ' + changelogPath);
  process.exit(1);
}

const changelog = fs.readFileSync(changelogPath, 'utf8');

if (!version) {
  console.log('No version specified, creating fallback release notes');
  fs.writeFileSync(outputPath, 'Release ' + new Date().toISOString().split('T')[0] + '\n', 'utf8');
  process.exit(0);
}

const regex = new RegExp(`## \\[${version.replace(/\./g, '\\.')}\\][^\\n]*\\n\\n([\\s\\S]*?)(?=\\n## \\[|$)`, 'g');
const match = regex.exec(changelog);

if (match && match[1]) {
  const notes = match[1].trim();
  fs.writeFileSync(outputPath, notes + '\n', 'utf8');
  console.log(`Successfully extracted release notes for version ${version} to ${outputPath}`);
} else {
  console.warn(`Version [${version}] not found in CHANGELOG.md. Using fallback note.`);
  fs.writeFileSync(outputPath, `Release v${version}\n`, 'utf8');
}
