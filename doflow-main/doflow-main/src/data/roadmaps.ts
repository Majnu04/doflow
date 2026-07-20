export type RoadmapBadge = 'NEW' | 'TRENDING' | 'POPULAR' | 'UPDATED' | 'HOT';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface RoadmapItem {
  id: string;
  name: string;
  icon: string;
  badge?: RoadmapBadge;
  difficulty: Difficulty;
  duration: string;
  lessons: number;
  projects: number;
  progress?: number;
}

export interface RoadmapCategory {
  id: string;
  title: string;
  icon: string;
  badge?: RoadmapBadge;
  items: RoadmapItem[];
}

export interface FeaturedRoadmap {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: Difficulty;
  duration: string;
  lessons: number;
  projects: number;
  stats: { label: string; value: string }[];
  buttonText: string;
}

export const featuredRoadmaps: FeaturedRoadmap[] = [
  {
    id: 'featured-fullstack',
    title: 'Full Stack Developer',
    subtitle: 'Become interview-ready in 6 months with a comprehensive curriculum.',
    icon: 'Layers',
    difficulty: 'Intermediate',
    duration: '24 Weeks',
    lessons: 180,
    projects: 42,
    stats: [
      { label: 'Lessons', value: '180' },
      { label: 'Projects', value: '42' },
      { label: 'AI Mentor', value: 'Included' },
      { label: 'Certificate', value: 'Yes' },
    ],
    buttonText: 'Start Learning',
  },
  {
    id: 'featured-ai',
    title: 'AI Engineer',
    subtitle: 'Master AI from fundamentals to production-ready systems.',
    icon: 'Brain',
    difficulty: 'Advanced',
    duration: '20 Weeks',
    lessons: 140,
    projects: 28,
    stats: [
      { label: 'Lessons', value: '140' },
      { label: 'Projects', value: '28' },
      { label: 'GPU Lab', value: 'Included' },
      { label: 'Certificate', value: 'Yes' },
    ],
    buttonText: 'Start Learning',
  },
  {
    id: 'featured-devops',
    title: 'DevOps Engineer',
    subtitle: 'Learn CI/CD, cloud infrastructure, and deployment at scale.',
    icon: 'GitBranch',
    difficulty: 'Intermediate',
    duration: '16 Weeks',
    lessons: 120,
    projects: 24,
    stats: [
      { label: 'Lessons', value: '120' },
      { label: 'Projects', value: '24' },
      { label: 'Cloud Labs', value: 'Included' },
      { label: 'Certificate', value: 'Yes' },
    ],
    buttonText: 'Start Learning',
  },
];

export const topCategories: RoadmapCategory[] = [
  {
    id: 'programming',
    title: 'Programming Languages',
    icon: 'Code2',
    items: [
      { id: 'python', name: 'Python', icon: 'Code2', badge: 'POPULAR', difficulty: 'Beginner', duration: '8 Weeks', lessons: 64, projects: 12 },
      { id: 'java', name: 'Java', icon: 'Coffee', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 72, projects: 10 },
      { id: 'javascript', name: 'JavaScript', icon: 'FileCode2', badge: 'POPULAR', difficulty: 'Beginner', duration: '8 Weeks', lessons: 60, projects: 14 },
      { id: 'typescript', name: 'TypeScript', icon: 'FileCode2', badge: 'TRENDING', difficulty: 'Intermediate', duration: '6 Weeks', lessons: 48, projects: 8 },
      { id: 'c', name: 'C', icon: 'Terminal', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 80, projects: 8 },
      { id: 'cpp', name: 'C++', icon: 'Terminal', difficulty: 'Advanced', duration: '12 Weeks', lessons: 90, projects: 10 },
      { id: 'rust', name: 'Rust', icon: 'Wrench', badge: 'TRENDING', difficulty: 'Advanced', duration: '10 Weeks', lessons: 68, projects: 8 },
      { id: 'go', name: 'Go', icon: 'Zap', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 56, projects: 10 },
      { id: 'swift', name: 'Swift', icon: 'Smartphone', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 65, projects: 8 },
      { id: 'kotlin', name: 'Kotlin', icon: 'Smartphone', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 58, projects: 8 },
      { id: 'php', name: 'PHP', icon: 'Server', difficulty: 'Beginner', duration: '8 Weeks', lessons: 55, projects: 10 },
      { id: 'dart', name: 'Dart', icon: 'Target', difficulty: 'Beginner', duration: '6 Weeks', lessons: 42, projects: 6 },
    ],
  },
  {
    id: 'web-dev',
    title: 'Web Development',
    icon: 'Globe',
    items: [
      { id: 'html', name: 'HTML', icon: 'FileCode', difficulty: 'Beginner', duration: '3 Weeks', lessons: 24, projects: 6 },
      { id: 'css', name: 'CSS', icon: 'Palette', difficulty: 'Beginner', duration: '4 Weeks', lessons: 32, projects: 8 },
      { id: 'tailwind', name: 'Tailwind CSS', icon: 'Wind', badge: 'TRENDING', difficulty: 'Beginner', duration: '3 Weeks', lessons: 22, projects: 6 },
      { id: 'bootstrap', name: 'Bootstrap', icon: 'Layout', difficulty: 'Beginner', duration: '3 Weeks', lessons: 20, projects: 4 },
      { id: 'js-web', name: 'JavaScript', icon: 'FileCode2', difficulty: 'Beginner', duration: '8 Weeks', lessons: 60, projects: 14 },
      { id: 'react', name: 'React', icon: 'Atom', badge: 'POPULAR', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 85, projects: 16 },
      { id: 'nextjs', name: 'Next.js', icon: 'Triangle', badge: 'HOT', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 68, projects: 12 },
      { id: 'vue', name: 'Vue', icon: 'Leaf', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 60, projects: 10 },
      { id: 'angular', name: 'Angular', icon: 'Hexagon', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 75, projects: 10 },
      { id: 'svelte', name: 'Svelte', icon: 'Flame', badge: 'TRENDING', difficulty: 'Intermediate', duration: '6 Weeks', lessons: 45, projects: 8 },
      { id: 'redux', name: 'Redux', icon: 'RefreshCw', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 30, projects: 6 },
      { id: 'framer-motion', name: 'Framer Motion', icon: 'Play', difficulty: 'Intermediate', duration: '3 Weeks', lessons: 24, projects: 5 },
      { id: 'accessibility', name: 'Accessibility', icon: 'Eye', badge: 'UPDATED', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 28, projects: 4 },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    icon: 'Server',
    items: [
      { id: 'nodejs', name: 'Node.js', icon: 'Server', badge: 'POPULAR', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 62, projects: 12 },
      { id: 'express', name: 'Express', icon: 'Server', difficulty: 'Intermediate', duration: '5 Weeks', lessons: 38, projects: 8 },
      { id: 'nestjs', name: 'NestJS', icon: 'Server', difficulty: 'Advanced', duration: '8 Weeks', lessons: 60, projects: 10 },
      { id: 'fastapi', name: 'FastAPI', icon: 'Zap', badge: 'TRENDING', difficulty: 'Intermediate', duration: '6 Weeks', lessons: 44, projects: 8 },
      { id: 'django', name: 'Django', icon: 'Globe', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 70, projects: 10 },
      { id: 'flask', name: 'Flask', icon: 'FlaskConical', difficulty: 'Beginner', duration: '6 Weeks', lessons: 40, projects: 8 },
      { id: 'spring-boot', name: 'Spring Boot', icon: 'Leaf', difficulty: 'Advanced', duration: '10 Weeks', lessons: 72, projects: 8 },
      { id: 'aspnet', name: 'ASP.NET', icon: 'Code2', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 58, projects: 8 },
      { id: 'rest-apis', name: 'REST APIs', icon: 'Link', difficulty: 'Beginner', duration: '4 Weeks', lessons: 28, projects: 6 },
      { id: 'graphql', name: 'GraphQL', icon: 'GitBranch', badge: 'TRENDING', difficulty: 'Intermediate', duration: '5 Weeks', lessons: 36, projects: 6 },
      { id: 'auth', name: 'Authentication', icon: 'Lock', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 30, projects: 5 },
      { id: 'microservices', name: 'Microservices', icon: 'Boxes', difficulty: 'Advanced', duration: '8 Weeks', lessons: 56, projects: 8 },
      { id: 'socketio', name: 'Socket.io', icon: 'Radio', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 28, projects: 4 },
    ],
  },
  {
    id: 'ai-data',
    title: 'AI & Data',
    icon: 'Brain',
    badge: 'HOT',
    items: [
      { id: 'python-ai', name: 'Python for AI', icon: 'Code2', difficulty: 'Beginner', duration: '6 Weeks', lessons: 48, projects: 8 },
      { id: 'ml', name: 'Machine Learning', icon: 'Brain', badge: 'POPULAR', difficulty: 'Intermediate', duration: '12 Weeks', lessons: 90, projects: 14 },
      { id: 'dl', name: 'Deep Learning', icon: 'Network', difficulty: 'Advanced', duration: '10 Weeks', lessons: 72, projects: 10 },
      { id: 'tensorflow', name: 'TensorFlow', icon: 'Box', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 56, projects: 8 },
      { id: 'pytorch', name: 'PyTorch', icon: 'Flame', badge: 'TRENDING', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 58, projects: 10 },
      { id: 'cv', name: 'Computer Vision', icon: 'Eye', difficulty: 'Advanced', duration: '8 Weeks', lessons: 52, projects: 8 },
      { id: 'nlp', name: 'NLP', icon: 'MessageSquare', difficulty: 'Advanced', duration: '8 Weeks', lessons: 54, projects: 6 },
      { id: 'genai', name: 'Generative AI', icon: 'Sparkles', badge: 'HOT', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 60, projects: 10 },
      { id: 'prompt-eng', name: 'Prompt Engineering', icon: 'PenTool', badge: 'NEW', difficulty: 'Beginner', duration: '4 Weeks', lessons: 28, projects: 6 },
      { id: 'llms', name: 'LLMs', icon: 'Cpu', badge: 'HOT', difficulty: 'Advanced', duration: '10 Weeks', lessons: 68, projects: 8 },
      { id: 'ai-agents', name: 'AI Agents', icon: 'Bot', badge: 'NEW', difficulty: 'Advanced', duration: '8 Weeks', lessons: 52, projects: 8 },
      { id: 'langchain', name: 'LangChain', icon: 'Link', badge: 'TRENDING', difficulty: 'Intermediate', duration: '6 Weeks', lessons: 40, projects: 6 },
      { id: 'rag', name: 'RAG', icon: 'BookOpen', badge: 'NEW', difficulty: 'Intermediate', duration: '5 Weeks', lessons: 34, projects: 5 },
      { id: 'mcp', name: 'MCP', icon: 'Plug', badge: 'NEW', difficulty: 'Advanced', duration: '4 Weeks', lessons: 26, projects: 4 },
    ],
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps',
    icon: 'Cloud',
    badge: 'TRENDING',
    items: [
      { id: 'git', name: 'Git', icon: 'GitBranch', difficulty: 'Beginner', duration: '2 Weeks', lessons: 16, projects: 4 },
      { id: 'github', name: 'GitHub', icon: 'Github', difficulty: 'Beginner', duration: '2 Weeks', lessons: 14, projects: 3 },
      { id: 'linux', name: 'Linux', icon: 'Terminal', difficulty: 'Beginner', duration: '4 Weeks', lessons: 32, projects: 6 },
      { id: 'docker', name: 'Docker', icon: 'Container', badge: 'POPULAR', difficulty: 'Intermediate', duration: '6 Weeks', lessons: 44, projects: 8 },
      { id: 'kubernetes', name: 'Kubernetes', icon: 'Container', badge: 'TRENDING', difficulty: 'Advanced', duration: '8 Weeks', lessons: 56, projects: 6 },
      { id: 'aws', name: 'AWS', icon: 'Cloud', badge: 'POPULAR', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 78, projects: 12 },
      { id: 'azure', name: 'Azure', icon: 'Cloud', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 62, projects: 10 },
      { id: 'gcp', name: 'Google Cloud', icon: 'Cloud', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 60, projects: 10 },
      { id: 'terraform', name: 'Terraform', icon: 'Box', badge: 'TRENDING', difficulty: 'Intermediate', duration: '6 Weeks', lessons: 42, projects: 8 },
      { id: 'nginx', name: 'NGINX', icon: 'Server', difficulty: 'Intermediate', duration: '3 Weeks', lessons: 22, projects: 3 },
      { id: 'jenkins', name: 'Jenkins', icon: 'Settings', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 30, projects: 5 },
      { id: 'cicd', name: 'CI/CD', icon: 'RefreshCw', badge: 'POPULAR', difficulty: 'Intermediate', duration: '5 Weeks', lessons: 36, projects: 6 },
      { id: 'cloudflare', name: 'Cloudflare', icon: 'Cloud', difficulty: 'Intermediate', duration: '3 Weeks', lessons: 20, projects: 3 },
      { id: 'monitoring', name: 'Monitoring', icon: 'Activity', badge: 'UPDATED', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 28, projects: 4 },
    ],
  },
];

export const secondRowCategories: RoadmapCategory[] = [
  {
    id: 'data-eng',
    title: 'Data Engineering',
    icon: 'Database',
    items: [
      { id: 'sql', name: 'SQL', icon: 'Database', badge: 'POPULAR', difficulty: 'Beginner', duration: '4 Weeks', lessons: 32, projects: 6 },
      { id: 'mysql', name: 'MySQL', icon: 'Database', difficulty: 'Beginner', duration: '3 Weeks', lessons: 24, projects: 4 },
      { id: 'postgresql', name: 'PostgreSQL', icon: 'Database', badge: 'TRENDING', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 30, projects: 5 },
      { id: 'mongodb', name: 'MongoDB', icon: 'Database', difficulty: 'Beginner', duration: '4 Weeks', lessons: 28, projects: 5 },
      { id: 'redis', name: 'Redis', icon: 'Database', difficulty: 'Intermediate', duration: '3 Weeks', lessons: 22, projects: 4 },
      { id: 'kafka', name: 'Kafka', icon: 'Radio', badge: 'TRENDING', difficulty: 'Advanced', duration: '6 Weeks', lessons: 42, projects: 6 },
      { id: 'spark', name: 'Spark', icon: 'Zap', difficulty: 'Advanced', duration: '8 Weeks', lessons: 56, projects: 8 },
      { id: 'airflow', name: 'Airflow', icon: 'Wind', difficulty: 'Intermediate', duration: '5 Weeks', lessons: 36, projects: 5 },
      { id: 'snowflake', name: 'Snowflake', icon: 'Snowflake', difficulty: 'Intermediate', duration: '5 Weeks', lessons: 34, projects: 4 },
      { id: 'bigquery', name: 'BigQuery', icon: 'Search', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 28, projects: 4 },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cyber Security',
    icon: 'Shield',
    badge: 'UPDATED',
    items: [
      { id: 'networking', name: 'Networking', icon: 'Wifi', difficulty: 'Beginner', duration: '6 Weeks', lessons: 44, projects: 6 },
      { id: 'owasp', name: 'OWASP', icon: 'Shield', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 30, projects: 4 },
      { id: 'ethical-hacking', name: 'Ethical Hacking', icon: 'Bug', badge: 'POPULAR', difficulty: 'Advanced', duration: '12 Weeks', lessons: 88, projects: 14 },
      { id: 'bug-bounty', name: 'Bug Bounty', icon: 'Bug', badge: 'TRENDING', difficulty: 'Advanced', duration: '8 Weeks', lessons: 56, projects: 10 },
      { id: 'soc-analyst', name: 'SOC Analyst', icon: 'Monitor', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 58, projects: 8 },
      { id: 'pen-testing', name: 'Pen Testing', icon: 'KeyRound', difficulty: 'Advanced', duration: '10 Weeks', lessons: 72, projects: 12 },
      { id: 'kali-linux', name: 'Kali Linux', icon: 'Terminal', difficulty: 'Advanced', duration: '6 Weeks', lessons: 42, projects: 8 },
      { id: 'burp-suite', name: 'Burp Suite', icon: 'ShieldCheck', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 28, projects: 4 },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile Development',
    icon: 'Smartphone',
    items: [
      { id: 'flutter', name: 'Flutter', icon: 'Smartphone', badge: 'POPULAR', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 72, projects: 12 },
      { id: 'react-native', name: 'React Native', icon: 'Smartphone', badge: 'TRENDING', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 70, projects: 10 },
      { id: 'android', name: 'Android', icon: 'Smartphone', difficulty: 'Intermediate', duration: '12 Weeks', lessons: 85, projects: 12 },
      { id: 'ios', name: 'iOS', icon: 'Smartphone', difficulty: 'Intermediate', duration: '12 Weeks', lessons: 80, projects: 10 },
      { id: 'swift-mobile', name: 'Swift', icon: 'Smartphone', difficulty: 'Intermediate', duration: '10 Weeks', lessons: 65, projects: 8 },
      { id: 'kotlin-mobile', name: 'Kotlin', icon: 'Smartphone', difficulty: 'Intermediate', duration: '8 Weeks', lessons: 58, projects: 8 },
      { id: 'firebase', name: 'Firebase', icon: 'Flame', difficulty: 'Beginner', duration: '5 Weeks', lessons: 36, projects: 6 },
      { id: 'play-store', name: 'Play Store Deployment', icon: 'Rocket', difficulty: 'Beginner', duration: '2 Weeks', lessons: 14, projects: 2 },
    ],
  },
  {
    id: 'placement',
    title: 'Placement Preparation',
    icon: 'Target',
    badge: 'POPULAR',
    items: [
      { id: 'dsa', name: 'DSA', icon: 'Binary', badge: 'POPULAR', difficulty: 'Intermediate', duration: '16 Weeks', lessons: 120, projects: 20 },
      { id: 'cp', name: 'Competitive Programming', icon: 'Trophy', badge: 'TRENDING', difficulty: 'Advanced', duration: '12 Weeks', lessons: 88, projects: 15 },
      { id: 'sql-interview', name: 'SQL Interview', icon: 'Database', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 30, projects: 5 },
      { id: 'system-design', name: 'System Design', icon: 'LayoutGrid', badge: 'HOT', difficulty: 'Advanced', duration: '10 Weeks', lessons: 72, projects: 8 },
      { id: 'resume', name: 'Resume Building', icon: 'FileText', difficulty: 'Beginner', duration: '2 Weeks', lessons: 12, projects: 2 },
      { id: 'hr-interview', name: 'HR Interview', icon: 'Users', difficulty: 'Beginner', duration: '2 Weeks', lessons: 14, projects: 1 },
      { id: 'behavioral', name: 'Behavioral Interview', icon: 'MessageCircle', difficulty: 'Beginner', duration: '2 Weeks', lessons: 12, projects: 1 },
      { id: 'mock-interviews', name: 'Mock Interviews', icon: 'Mic', difficulty: 'Intermediate', duration: '4 Weeks', lessons: 16, projects: 4 },
      { id: 'aptitude', name: 'Aptitude', icon: 'Calculator', difficulty: 'Beginner', duration: '4 Weeks', lessons: 28, projects: 0 },
      { id: 'communication', name: 'Communication', icon: 'MessagesSquare', difficulty: 'Beginner', duration: '3 Weeks', lessons: 18, projects: 0 },
    ],
  },
  {
    id: 'career-paths',
    title: 'Career Paths',
    icon: 'Rocket',
    badge: 'NEW',
    items: [
      { id: 'frontend-dev', name: 'Frontend Developer', icon: 'Monitor', badge: 'POPULAR', difficulty: 'Intermediate', duration: '16 Weeks', lessons: 120, projects: 20 },
      { id: 'backend-dev', name: 'Backend Developer', icon: 'Server', difficulty: 'Intermediate', duration: '18 Weeks', lessons: 130, projects: 18 },
      { id: 'fullstack-dev', name: 'Full Stack Developer', icon: 'Layers', badge: 'HOT', difficulty: 'Intermediate', duration: '24 Weeks', lessons: 180, projects: 42 },
      { id: 'software-eng', name: 'Software Engineer', icon: 'Code2', difficulty: 'Intermediate', duration: '20 Weeks', lessons: 150, projects: 25 },
      { id: 'cloud-eng', name: 'Cloud Engineer', icon: 'Cloud', difficulty: 'Intermediate', duration: '16 Weeks', lessons: 110, projects: 16 },
      { id: 'devops-eng', name: 'DevOps Engineer', icon: 'GitBranch', badge: 'TRENDING', difficulty: 'Intermediate', duration: '16 Weeks', lessons: 120, projects: 24 },
      { id: 'ai-eng', name: 'AI Engineer', icon: 'Brain', badge: 'NEW', difficulty: 'Advanced', duration: '20 Weeks', lessons: 140, projects: 28 },
      { id: 'ml-eng', name: 'ML Engineer', icon: 'BrainCircuit', difficulty: 'Advanced', duration: '20 Weeks', lessons: 140, projects: 24 },
      { id: 'data-scientist', name: 'Data Scientist', icon: 'BarChart3', difficulty: 'Intermediate', duration: '18 Weeks', lessons: 130, projects: 20 },
      { id: 'data-eng', name: 'Data Engineer', icon: 'Database', difficulty: 'Intermediate', duration: '16 Weeks', lessons: 115, projects: 16 },
      { id: 'cyber-eng', name: 'Cyber Security Engineer', icon: 'Shield', difficulty: 'Advanced', duration: '18 Weeks', lessons: 130, projects: 18 },
      { id: 'qa-eng', name: 'QA Engineer', icon: 'CheckCircle', difficulty: 'Beginner', duration: '12 Weeks', lessons: 85, projects: 14 },
      { id: 'game-dev', name: 'Game Developer', icon: 'Gamepad2', difficulty: 'Intermediate', duration: '16 Weeks', lessons: 110, projects: 12 },
      { id: 'blockchain-dev', name: 'Blockchain Developer', icon: 'Link2', difficulty: 'Advanced', duration: '14 Weeks', lessons: 95, projects: 10 },
    ],
  },
];

export const popularCompanies = [
  { name: 'Google', letter: 'G' },
  { name: 'Microsoft', letter: 'M' },
  { name: 'Amazon', letter: 'A' },
  { name: 'Meta', letter: 'M' },
  { name: 'Adobe', letter: 'A' },
  { name: 'Netflix', letter: 'N' },
  { name: 'Uber', letter: 'U' },
  { name: 'Atlassian', letter: 'A' },
  { name: 'Oracle', letter: 'O' },
  { name: 'Zoho', letter: 'Z' },
];

export const trendingSearches = [
  'React',
  'Python',
  'System Design',
  'DSA',
  'DevOps',
  'AI Agents',
  'Full Stack',
  'LLMs',
];

export const recentSearches = ['Next.js', 'Docker', 'Machine Learning'];

export const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'New' },
] as const;

export type FilterId = typeof filterOptions[number]['id'];
