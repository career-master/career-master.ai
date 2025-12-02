/**
 * Question Types Configuration
 * Defines all supported question types and their properties
 */

const QUESTION_TYPES = {
  // Basic Types
  MULTIPLE_CHOICE_SINGLE: 'multiple_choice_single', // MCQ (Single Correct)
  MULTIPLE_CHOICE_MULTIPLE: 'multiple_choice_multiple', // MCQ (Multiple Correct)
  TRUE_FALSE: 'true_false', // True/False
  FILL_IN_BLANK: 'fill_in_blank',
  PASSAGE: 'passage',
  MULTIPLE_CHOICE: 'multiple_choice', // Legacy - maps to single
  
  // Interactive Types (with lightning bolt icon)
  MATCH: 'match', // Match the Following
  DRAG_DROP: 'drag_drop',
  HOTSPOT: 'hotspot',
  CATEGORIZE: 'categorize',
  REORDER: 'reorder', // Arrange/Reorder
  DROPDOWN: 'dropdown',
  LABELING: 'labeling',
  IMAGE_BASED: 'image_based', // Image based patterns
  
  // Open Ended Types
  OPEN_ENDED: 'open_ended',
  DRAW: 'draw',
  VIDEO_RESPONSE: 'video_response',
  AUDIO_RESPONSE: 'audio_response',
  POLL: 'poll',
  WORD_CLOUD: 'word_cloud',
  
  // Mathematics Types
  MATH_RESPONSE: 'math_response',
  GRAPHING: 'graphing',
  
  // Other
  SLIDE: 'slide'
};

const QUESTION_TYPE_CONFIG = {
  [QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE]: {
    name: 'MCQ (Single Correct)',
    icon: 'radio',
    category: 'basic',
    requiresOptions: true,
    requiresCorrectIndex: true,
    autoGradable: true,
    canImportFromExcel: true
  },
  [QUESTION_TYPES.MULTIPLE_CHOICE_MULTIPLE]: {
    name: 'MCQ (Multiple Correct)',
    icon: 'checkbox',
    category: 'basic',
    requiresOptions: true,
    requiresCorrectIndices: true, // Array of correct indices
    autoGradable: true,
    canImportFromExcel: true
  },
  [QUESTION_TYPES.TRUE_FALSE]: {
    name: 'True / False',
    icon: 'true-false',
    category: 'basic',
    requiresOptions: false, // Always True/False
    requiresCorrectIndex: true,
    autoGradable: true,
    canImportFromExcel: true
  },
  [QUESTION_TYPES.MULTIPLE_CHOICE]: {
    name: 'Multiple Choice',
    icon: 'radio',
    category: 'basic',
    requiresOptions: true,
    requiresCorrectIndex: true,
    autoGradable: true,
    canImportFromExcel: true,
    isLegacy: true // Maps to MULTIPLE_CHOICE_SINGLE
  },
  [QUESTION_TYPES.FILL_IN_BLANK]: {
    name: 'Fill in the Blanks',
    icon: 'blank',
    category: 'basic',
    requiresOptions: false,
    requiresCorrectAnswers: true,
    autoGradable: true,
    canImportFromExcel: false
  },
  [QUESTION_TYPES.PASSAGE]: {
    name: 'Passage',
    icon: 'passage',
    category: 'basic',
    requiresPassage: true,
    requiresOptions: true,
    requiresCorrectIndex: true,
    autoGradable: true
  },
  [QUESTION_TYPES.MATCH]: {
    name: 'Match the Following',
    icon: 'match',
    category: 'interactive',
    requiresMatchPairs: true,
    autoGradable: true,
    isInteractive: true,
    canImportFromExcel: false
  },
  [QUESTION_TYPES.DRAG_DROP]: {
    name: 'Drag and Drop',
    icon: 'drag',
    category: 'interactive',
    requiresCorrectOrder: true,
    autoGradable: true,
    isInteractive: true
  },
  [QUESTION_TYPES.HOTSPOT]: {
    name: 'Hotspot',
    icon: 'hotspot',
    category: 'interactive',
    requiresImage: true,
    requiresHotspotRegions: true,
    autoGradable: true,
    isInteractive: true
  },
  [QUESTION_TYPES.CATEGORIZE]: {
    name: 'Categorize',
    icon: 'categorize',
    category: 'interactive',
    requiresCategories: true,
    autoGradable: true,
    isInteractive: true
  },
  [QUESTION_TYPES.REORDER]: {
    name: 'Arrange / Reorder',
    icon: 'reorder',
    category: 'interactive',
    requiresCorrectOrder: true,
    autoGradable: true,
    isInteractive: true,
    canImportFromExcel: false
  },
  [QUESTION_TYPES.IMAGE_BASED]: {
    name: 'Image Based',
    icon: 'image',
    category: 'interactive',
    requiresImage: true,
    autoGradable: true,
    isInteractive: true,
    canImportFromExcel: false
  },
  [QUESTION_TYPES.DROPDOWN]: {
    name: 'Drop Down',
    icon: 'dropdown',
    category: 'interactive',
    requiresOptions: true,
    requiresCorrectIndex: true,
    autoGradable: true,
    isInteractive: true
  },
  [QUESTION_TYPES.LABELING]: {
    name: 'Labeling',
    icon: 'labeling',
    category: 'interactive',
    requiresImage: true,
    autoGradable: false,
    isInteractive: true
  },
  [QUESTION_TYPES.OPEN_ENDED]: {
    name: 'Open Ended',
    icon: 'open-ended',
    category: 'open-ended',
    autoGradable: false
  },
  [QUESTION_TYPES.DRAW]: {
    name: 'Draw',
    icon: 'draw',
    category: 'open-ended',
    autoGradable: false
  },
  [QUESTION_TYPES.VIDEO_RESPONSE]: {
    name: 'Video Response',
    icon: 'video',
    category: 'open-ended',
    autoGradable: false
  },
  [QUESTION_TYPES.AUDIO_RESPONSE]: {
    name: 'Audio Response',
    icon: 'audio',
    category: 'open-ended',
    autoGradable: false
  },
  [QUESTION_TYPES.POLL]: {
    name: 'Poll',
    icon: 'poll',
    category: 'open-ended',
    requiresOptions: true,
    autoGradable: false
  },
  [QUESTION_TYPES.WORD_CLOUD]: {
    name: 'Word Cloud',
    icon: 'word-cloud',
    category: 'open-ended',
    autoGradable: false
  },
  [QUESTION_TYPES.MATH_RESPONSE]: {
    name: 'Math Response',
    icon: 'math',
    category: 'mathematics',
    requiresMathExpression: true,
    autoGradable: true
  },
  [QUESTION_TYPES.GRAPHING]: {
    name: 'Graphing',
    icon: 'graphing',
    category: 'mathematics',
    autoGradable: false,
    isInteractive: true
  },
  [QUESTION_TYPES.SLIDE]: {
    name: 'Slide',
    icon: 'slide',
    category: 'other',
    autoGradable: false
  }
};

const QUESTION_TYPE_CATEGORIES = {
  basic: {
    name: 'Basic Question Types',
    types: [QUESTION_TYPES.MULTIPLE_CHOICE, QUESTION_TYPES.PASSAGE, QUESTION_TYPES.FILL_IN_BLANK]
  },
  interactive: {
    name: 'Interactive/Higher-order thinking',
    types: [
      QUESTION_TYPES.MATCH,
      QUESTION_TYPES.DRAG_DROP,
      QUESTION_TYPES.HOTSPOT,
      QUESTION_TYPES.CATEGORIZE,
      QUESTION_TYPES.REORDER,
      QUESTION_TYPES.DROPDOWN,
      QUESTION_TYPES.LABELING,
      QUESTION_TYPES.IMAGE_BASED
    ]
  },
  'open-ended': {
    name: 'Open ended responses',
    types: [
      QUESTION_TYPES.DRAW,
      QUESTION_TYPES.VIDEO_RESPONSE,
      QUESTION_TYPES.POLL,
      QUESTION_TYPES.OPEN_ENDED,
      QUESTION_TYPES.AUDIO_RESPONSE,
      QUESTION_TYPES.WORD_CLOUD
    ]
  },
  mathematics: {
    name: 'Mathematics',
    types: [QUESTION_TYPES.MATH_RESPONSE, QUESTION_TYPES.GRAPHING]
  },
  other: {
    name: 'Other',
    types: [QUESTION_TYPES.SLIDE]
  }
};

module.exports = {
  QUESTION_TYPES,
  QUESTION_TYPE_CONFIG,
  QUESTION_TYPE_CATEGORIES
};

