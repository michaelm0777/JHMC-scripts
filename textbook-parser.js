const fs = require('fs');
const path = require('path');

// Define all available chapters
const chapters = [
  {
    id: 'algebra',
    title: 'Algebra',
    description: 'Learn the fundamentals of algebra including linear equations, systems, and more.',
    status: 'available',
    sections: [
      { id: 'intro-to-algebra', title: 'Introduction to Algebra' },
      { id: 'linear-equations', title: 'Linear Equations' },
      { id: 'one-variable', title: 'One Variable Linear Equations' },
      { id: 'graphing', title: 'Graphing & Two Variable Equations' },
      { id: 'multivariable', title: 'Multivariable Systems' },
      { id: 'substitution', title: 'Substitution Method' },
      { id: 'elimination', title: 'Elimination Method' }
    ]
  },
  {
    id: 'geometry',
    title: 'Geometry',
    description: 'Explore geometric concepts, shapes, proofs, and spatial reasoning.',
    status: 'available',
    sections: [
      { id: 'intro', title: 'Introduction' },
      { id: 'angles', title: 'Chapter 1: Angles' },
      { id: 'triangles', title: 'Chapter 2: Triangles' },
      { id: 'perimeter-area', title: 'Chapter 3: Perimeter & Area' },
      { id: 'special-parts', title: 'Chapter 4: Special Parts of a Triangle' },
      { id: 'circle-parts', title: 'Chapter 5: Parts of a Circle' },
      { id: '3d-geometry', title: 'Chapter 6: 3D Geometry' },
      { id: 'analytic-geometry', title: 'Chapter 7: Analytic Geometry' },
      { id: 'trigonometry', title: 'Chapter 8: Trigonometry' },
      { id: 'cool-theorems', title: 'Chapter 9: Cool Theorems' }
    ]
  },
  {
    id: 'number-theory',
    title: 'Number Theory',
    description: 'Dive into the properties of numbers, divisibility, primes, and modular arithmetic.',
    status: 'available',
    sections: [
      { id: 'intro-to-number-theory', title: 'Introduction to Number Theory' },
      { id: 'divisibility', title: 'Divisibility Rules' },
      { id: 'primes', title: 'Prime Numbers' },
      { id: 'gcd-lcm', title: 'GCD and LCM' },
      { id: 'modular-arithmetic', title: 'Modular Arithmetic' }
    ]
  },
  {
    id: 'combo',
    title: 'Combinatorics',
    description: 'Master counting techniques, permutations, combinations, and probability.',
    status: 'available',
    sections: [
      { id: 'intro-to-combinatorics', title: 'Introduction to Combinatorics' },
      { id: 'counting-principles', title: 'Counting Principles' },
      { id: 'permutations', title: 'Permutations' },
      { id: 'combinations', title: 'Combinations' },
      { id: 'probability', title: 'Probability Basics' }
    ]
  }
];

/**
 * Get all available chapters
 * @returns {Array} Array of chapter objects
 */
function getAllChapters() {
  return chapters;
}

/**
 * Load a specific chapter by ID
 * @param {string} chapterId - The ID of the chapter to load
 * @returns {Object|null} The chapter object or null if not found
 */
function loadChapter(chapterId) {
  console.log(`textbook-parser: Looking for chapter '${chapterId}'`);
  
  // Handle alternative naming conventions
  const chapterMap = {
    'numtheory': 'number-theory',
    'numbertheory': 'number-theory',
    'combinatorics': 'combo'
  };
  
  // Normalize the chapter ID
  const normalizedId = chapterMap[chapterId] || chapterId;
  
  // Find the chapter
  const chapter = chapters.find(ch => ch.id === normalizedId);
  
  if (chapter) {
    console.log(`textbook-parser: Found chapter '${chapter.title}'`);

    // Check if the EJS file exists
    const ejsPath = path.join(__dirname, 'views', 'pages', 'textbook', 'html', `${chapter.id}.ejs`);
    if (fs.existsSync(ejsPath)) {
      console.log(`textbook-parser: EJS file exists at ${ejsPath}`);
    } else {
      console.warn(`textbook-parser: WARNING - EJS file not found at ${ejsPath}`);
    }
    
    return chapter;
  }
  
  console.warn(`textbook-parser: Chapter '${chapterId}' not found`);
  return null;
}

/**
 * Check if a chapter HTML file exists
 * @param {string} chapterId - The ID of the chapter
 * @returns {boolean} True if the file exists
 */
function chapterHtmlExists(chapterId) {
  const htmlPath = path.join(__dirname, 'views', 'pages', 'textbook', 'html', `${chapterId}.html`);
  return fs.existsSync(htmlPath);
}

module.exports = {
  getAllChapters,
  loadChapter,
  chapterHtmlExists
};
