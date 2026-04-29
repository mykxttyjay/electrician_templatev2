export async function parseFaqMarkdown(filename) {
  // Import the markdown file dynamically
  const modules = import.meta.glob('/src/content/faqs/*.md', { query: '?raw', import: 'default' });
  const path = `/src/content/faqs/${filename}`;
  
  if (!modules[path]) {
    throw new Error(`FAQ file not found: ${filename}`);
  }
  
  const content = await modules[path]();
  
  // Normalize line endings to \n
  const normalizedContent = content.replace(/\r\n/g, '\n');
  
  // Extract frontmatter - handle both --- and --- with optional whitespace
  const frontmatterMatch = normalizedContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!frontmatterMatch) {
    throw new Error('Invalid FAQ markdown file: missing frontmatter');
  }
  
  const frontmatter = frontmatterMatch[1];
  const body = normalizedContent.slice(frontmatterMatch[0].length).trim();
  
  // Parse frontmatter
  const metadata = {};
  frontmatter.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*"(.*)"/);
    if (match) {
      metadata[match[1]] = match[2];
    }
  });
  
  // Parse FAQ questions and answers
  const faqs = [];
  const sections = body.split(/^## /m).filter(Boolean);
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const question = lines[0].trim();
    const answer = lines.slice(1).join('\n').trim();
    
    if (question && answer) {
      faqs.push({ question, answer });
    }
  });
  
  return {
    title: metadata.title || '',
    subtitle: metadata.subtitle || '',
    ctaHeading: metadata.ctaHeading || '',
    ctaSubtitle: metadata.ctaSubtitle || '',
    ctaButton: metadata.ctaButton || '',
    stat1Value: metadata.stat1Value || '',
    stat1Label: metadata.stat1Label || '',
    stat2Value: metadata.stat2Value || '',
    stat2Label: metadata.stat2Label || '',
    faqs
  };
}
