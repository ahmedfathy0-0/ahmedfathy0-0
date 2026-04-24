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

function generatePreamble(compact = false) {
  const sideMarginAdjust = compact ? '-0.62in' : '-0.5in';
  const textWidthAdjust = compact ? '1.24in' : '1.0in';
  const topMarginAdjust = compact ? '-0.82in' : '-.7in';
  const textHeightAdjust = compact ? '1.75in' : '1.4in';
  const lineSpread = compact ? '\\linespread{0.95}\\selectfont' : '\\linespread{0.97}\\selectfont';
  const sectionTitleVSpace = compact ? '-12pt' : '-10pt';
  const sectionRuleVSpace = compact ? '-7pt' : '-5pt';
  const resumeItemVSpace = compact ? '-3pt' : '-2pt';
  const subheadingVSpace = compact ? '-6pt' : '-5pt';
  const listSubheadingVSpace = compact ? '-5pt' : '-13pt';
  const listEndVSpace = compact ? '-8pt' : '-3pt';
  const subsectionListGap = compact ? '0.3pt' : '0.3pt';
  const itemListItemSep = compact ? '0.7pt' : '1.2pt';
  const itemizeConfig = compact
    ? '\\setlist[itemize]{leftmargin=*,topsep=1pt,itemsep=1pt,parsep=0pt,partopsep=0pt}'
    : '\\setlist[itemize]{leftmargin=*,topsep=2pt,itemsep=2pt,parsep=0pt,partopsep=0pt}';

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

\\addtolength{\\oddsidemargin}{${sideMarginAdjust}}
\\addtolength{\\evensidemargin}{${sideMarginAdjust}}
\\addtolength{\\textwidth}{${textWidthAdjust}}
\\addtolength{\\topmargin}{${topMarginAdjust}}
\\addtolength{\\textheight}{${textHeightAdjust}}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}
${lineSpread}
${itemizeConfig}

\\titleformat{\\section}{
  \\vspace{${sectionTitleVSpace}}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{${sectionRuleVSpace}}]

\\newcommand{\\resumeItem}[2]{\\item\\small{\\textbf{#1}{: #2 \\vspace{${resumeItemVSpace}}}}}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{${subheadingVSpace}}
}

\\newcommand{\\resumeProjectSubheading}[3]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} $|$ \\textit{\\small#2} & #3 \\\\
    \\end{tabular*}\\vspace{${listSubheadingVSpace}}
}

\\newcommand{\\resumeActivitySubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} $|$ \\textit{\\small#3} & \\textit{\\small#2} $|$ \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{${listSubheadingVSpace}}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}
\\renewcommand{\\labelitemii}{$\\circ$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\vspace*{${subsectionListGap}}\\begin{itemize}[leftmargin=*,topsep=0pt,itemsep=${itemListItemSep},parsep=0pt,partopsep=0pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{${listEndVSpace}}}
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

function generateSummary(summary) {
  if (!summary) return '';
  return `\section{Professional Summary}
  \small ${lightEscape(summary.content)}
  \\vspace{2pt}
`;
}

function generateEducation(edu) {
  const educationYears = edu.endYear
    ? `${lightEscape(edu.startYear)} -- ${lightEscape(edu.endYear)}`
    : lightEscape(edu.startYear);

  return `\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {${lightEscape(edu.university)}}{${lightEscape(edu.location)}}
      {${lightEscape(edu.degree)};  GPA: ${edu.gpa}}{${educationYears}}
  \\resumeSubHeadingListEnd
  \\vspace{-2pt}
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
  \\vspace{-2pt}
`;
}

function generateProjects(projects, sectionTitle = 'Projects') {
  if (!projects || projects.length === 0) return '';

  const getPrimaryProjectUrl = (project) => {
    const sourceCodeUrl = (project?.sourceCodeUrl || '').trim();
    if (sourceCodeUrl) return sourceCodeUrl;

    const previewUrl = (project?.previewUrl || '').trim();
    if (previewUrl) return previewUrl;

    const legacyUrl = (project?.url || '').trim();
    return legacyUrl || '';
  };

  let entries = projects.map(p => {
    let items = p.items.map(i =>
      `        \\resumeItem{${lightEscape(i.title)}}\n          {${lightEscape(i.description)}}`
    ).join('\n');

    const primaryUrl = getPrimaryProjectUrl(p);
    const titlePart = primaryUrl
      ? `\\href{${primaryUrl}}{\\textbf{${lightEscape(p.name)}}}`
      : `\\textbf{${lightEscape(p.name)}}`;

    return `    \\resumeProjectSubheading
      {${titlePart}}{${lightEscape(p.technologies)}}{\\textit{\\small ${lightEscape(p.year || '')}}}
      \\resumeItemListStart
${items}
      \\resumeItemListEnd`;
  }).join('\n    \\vspace{4pt}\n');

  return `\\section{${lightEscape(sectionTitle)}}
  \\resumeSubHeadingListStart
${entries}
  \\resumeSubHeadingListEnd
  \\vspace{-2pt}
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
  \\vspace{-2pt}
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
 \\vspace{-2pt}
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

  // Find selected summary
  const selectedSummary = selection.summaryId
    ? data.summaries?.find(s => s.id === selection.summaryId)
    : null;

  // Use custom personal info if provided
  const info = { ...personalInfo, ...(selection.personalInfo || {}) };

  // Build sections in order
  const sectionOrder = selection.sectionOrder || ['summary', 'education', 'experience', 'activities', 'projects', 'skills'];

  let sections = '';
  for (const sec of sectionOrder) {
    switch (sec) {
      case 'summary':
        sections += generateSummary(selectedSummary);
        break;
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

  return `${generatePreamble(Boolean(selection.compactPdf))}
\\begin{document}

${generateHeading(info)}

${sections}
\\end{document}
`;
}
