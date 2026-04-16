// LaTeX Generator - Converts JSON data to LaTeX resume source
// Handles proper escaping and template generation

function escapeLatex(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

// Light escape - preserves intentional LaTeX formatting
function lightEscape(text) {
  if (!text) return '';
  return text
    .replace(/&(?!\\)/g, '\\&')
    .replace(/#(?!\\)/g, '\\#')
    .replace(/%(?!\\)/g, '\\%');
}

function generatePreamble() {
  return `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[pdftex]{hyperref}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-8pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-4pt}]

\\newcommand{\\resumeItem}[2]{\\item\\small{\\textbf{#1}{: #2 \\vspace{-2pt}}}}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeProjectSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} $|$ \\textit{\\small#3} & \\href{#2}{Source Code} $|$ \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeActivitySubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} $|$ \\textit{\\small#3} & \\textit{\\small#2} $|$ \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}
\\renewcommand{\\labelitemii}{$\\circ$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}
`;
}

function generateHeading(info) {
  return `\\begin{center}
    \\textbf{\\Huge \\scshape ${lightEscape(info.name)}} \\\\ \\vspace{1pt}
    \\small ${lightEscape(info.title)} \\\\
    \\href{mailto:${info.email}}{\\underline{${info.email}}} $|$
    ${lightEscape(info.phone)} $|$
    \\href{${info.linkedin}}{\\underline{LinkedIn}} $|$
    \\href{${info.github}}{\\underline{GitHub}} $|$
    \\href{${info.portfolio}}{\\underline{Portfolio}} $|$
    ${lightEscape(info.address)}
\\end{center}
`;
}

function generateEducation(edu) {
  return `\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {${lightEscape(edu.university)}}{${lightEscape(edu.location)}}
      {${lightEscape(edu.degree)};  GPA: ${edu.gpa}}{${edu.startYear}}
  \\resumeSubHeadingListEnd
`;
}

function generateExperience(exp) {
  if (!exp) return '';
  let items = exp.items.map(i =>
    `        \\resumeItem{${lightEscape(i.title)}}\n          {${lightEscape(i.description)}}`
  ).join('\n');

  return `\\section{Experience}
  \\resumeSubHeadingListStart
    \\resumeActivitySubheading
      {${lightEscape(exp.company)}}{${lightEscape(exp.location)}}{${lightEscape(exp.role)}}{${lightEscape(exp.dates)}}
      \\resumeItemListStart
${items}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd
`;
}

function generateProjects(projects, sectionTitle = 'Projects') {
  if (!projects || projects.length === 0) return '';

  let entries = projects.map(p => {
    let items = p.items.map(i =>
      `        \\resumeItem{${lightEscape(i.title)}}\n          {${lightEscape(i.description)}}`
    ).join('\n');

    return `    \\resumeProjectSubheading
      {${lightEscape(p.name)}}{${p.url}}{${lightEscape(p.technologies)}}{${p.year}}
      \\resumeItemListStart
${items}
      \\resumeItemListEnd`;
  }).join('\n    \\vspace{4pt}\n');

  return `\\section{${lightEscape(sectionTitle)}}
  \\resumeSubHeadingListStart
${entries}
  \\resumeSubHeadingListEnd
`;
}

function generateActivities(activities) {
  if (!activities || activities.length === 0) return '';

  let entries = activities.map(a => {
    let items = a.items.map(i =>
      `        \\resumeItem{${lightEscape(i.title)}}\n          {${lightEscape(i.description)}}`
    ).join('\n');

    return `    \\resumeActivitySubheading
      {${lightEscape(a.organization)}}{${lightEscape(a.location)}}{${lightEscape(a.role)}}{${lightEscape(a.dates)}}
      \\resumeItemListStart
${items}
      \\resumeItemListEnd`;
  }).join('\n    \\vspace{4pt}\n');

  return `\\section{Student Activities}
  \\resumeSubHeadingListStart
${entries}
  \\resumeSubHeadingListEnd
`;
}

function generateSkills(skills) {
  if (!skills) return '';

  let items = skills.categories.map(c =>
    `    \\item{\\textbf{${lightEscape(c.label)}}{: ${lightEscape(c.items)}}}`
  ).join('\n');

  return `\\section{Technical Skills}
 \\resumeSubHeadingListStart
${items}
 \\resumeSubHeadingListEnd
`;
}

export function generateLatex(data, selection) {
  const { personalInfo, education } = data;

  // Find selected experience
  const selectedExp = selection.experienceId
    ? data.experiences.find(e => e.id === selection.experienceId)
    : null;

  // Find selected projects
  const selectedProjects = (selection.projectIds || [])
    .map(id => data.projects.find(p => p.id === id))
    .filter(Boolean);

  // Find selected activities
  const selectedActivities = (selection.activityIds || [])
    .map(id => data.activities.find(a => a.id === id))
    .filter(Boolean);

  // Find selected skills
  const selectedSkills = selection.skillsId
    ? data.skills.find(s => s.id === selection.skillsId)
    : null;

  // Use custom personal info if provided
  const info = { ...personalInfo, ...(selection.personalInfo || {}) };

  // Build sections in order
  const sectionOrder = selection.sectionOrder || ['education', 'experience', 'activities', 'projects', 'skills'];

  let sections = '';
  for (const sec of sectionOrder) {
    switch (sec) {
      case 'education':
        sections += generateEducation(education);
        break;
      case 'experience':
        sections += generateExperience(selectedExp);
        break;
      case 'projects':
        sections += generateProjects(selectedProjects, selection.projectsSectionTitle || 'Projects');
        break;
      case 'activities':
        sections += generateActivities(selectedActivities);
        break;
      case 'skills':
        sections += generateSkills(selectedSkills);
        break;
    }
  }

  return `${generatePreamble()}
\\begin{document}

${generateHeading(info)}

${sections}
\\end{document}
`;
}
