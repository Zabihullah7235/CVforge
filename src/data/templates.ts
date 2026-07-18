import { Template } from '../types';

export const RESUME_TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: 'Modern Slate',
    description: 'Elegant dual-column layout with a stylish slate blue accent. Ideal for tech, marketing, and creative professionals.',
    thumbnail: 'slate'
  },
  {
    id: 'classic',
    name: 'Executive Classic',
    description: 'Traditional centered single-column layout with elegant horizontal dividers. Perfect for finance, legal, and academic roles.',
    thumbnail: 'classic'
  },
  {
    id: 'creative',
    name: 'Creative Emerald',
    description: 'Vibrant sidebar-accented layout using emerald green hues. Stands out for design, UX, startups, and agencies.',
    thumbnail: 'emerald'
  },
  {
    id: 'ats',
    name: 'ATS Clean',
    description: 'A strictly formatted, highly optimized, parser-friendly single-column layout. Guaranteed to score high with screening software.',
    thumbnail: 'ats'
  },
  {
    id: 'minimal',
    name: 'Chic Minimalist',
    description: 'Ultra-clean layout with micro-typography and generous white space. Excellent for architects, artists, and executives.',
    thumbnail: 'minimal'
  }
];

export const AUTO_SUGGEST_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Google Cloud Platform', 
  'HTML5', 'CSS3', 'Tailwind CSS', 'GraphQL', 'RESTful APIs', 'Git', 'CI/CD', 'Agile Methodologies',
  'Project Management', 'Product Strategy', 'UI/UX Design', 'Figma', 'SEO', 'Data Analysis', 
  'Machine Learning', 'TensorFlow', 'SQL', 'C++', 'Java', 'Spring Boot', 'Next.js', 'Vue.js',
  'Svelte', 'DevOps', 'Microservices', 'System Design', 'Technical Writing', 'Public Speaking'
];

export const INITIAL_RESUME_DATA = (id: string, title: string = 'My Professional Resume'): any => ({
  id,
  title,
  templateId: 'modern',
  isAtsFriendly: false,
  updatedAt: new Date().toISOString(),
  personalInfo: {
    fullName: 'Alex Carter',
    professionalTitle: 'Senior Full-Stack Engineer',
    email: 'alex.carter@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    website: 'https://alexcarter.dev',
    github: 'https://github.com/alexcarter',
    linkedin: 'https://linkedin.com/in/alexcarter',
    summary: 'Innovative and results-driven Software Engineer with 6+ years of experience designing, building, and deploying highly scalable cloud applications. Expert in React, TypeScript, and Node.js, with a proven track record of optimizing application performance by 40% and leading cross-functional agile teams.',
    photoUrl: ''
  },
  experience: [
    {
      id: 'exp1',
      company: 'TechNova Solutions',
      position: 'Senior Full-Stack Engineer',
      startDate: '2023-03',
      endDate: '',
      current: true,
      location: 'San Francisco, CA',
      description: '• Architected and developed key microservices using Node.js and TypeScript, handling over 10M daily API requests.\n• Led a team of 4 front-end engineers to rebuild the customer portal using React and Tailwind CSS, reducing page load time by 35%.\n• Designed and implemented real-time monitoring dashboards that reduced incident response times by 20%.'
    },
    {
      id: 'exp2',
      company: 'Quantum Innovations',
      position: 'Software Engineer II',
      startDate: '2020-08',
      endDate: '2023-02',
      current: false,
      location: 'Boston, MA',
      description: '• Designed and deployed scalable database structures on PostgreSQL, which increased query efficiency by 50%.\n• Built and integrated 15+ RESTful endpoints connecting external payment processors and communication APIs.\n• Coached junior developers on clean code practices, Git workflows, and unit testing using Jest.'
    }
  ],
  education: [
    {
      id: 'edu1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      current: false,
      location: 'Berkeley, CA',
      description: 'Graduated with Honors. Specialized in Software Engineering and Distributed Systems.'
    }
  ],
  skills: ['TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'AWS'],
  projects: [
    {
      id: 'proj1',
      name: 'EcoSphere Platform',
      description: 'Developed an open-source environmental data visualization platform using D3.js and React, enabling researchers to track local carbon footprints.',
      url: 'https://github.com/alexcarter/ecosphere',
      technologies: ['React', 'D3.js', 'Tailwind CSS']
    }
  ],
  certifications: [
    {
      id: 'cert1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: '2024-05',
      url: 'https://aws.amazon.com'
    }
  ],
  languages: [
    { id: 'lang1', name: 'English', level: 'Native' },
    { id: 'lang2', name: 'Spanish', level: 'Intermediate' }
  ],
  customSections: [
    {
      id: 'cust1',
      title: 'Interests & Volunteering',
      items: [
        {
          id: 'custitem1',
          title: 'Volunteer Instructor',
          subtitle: 'CoderDojo San Francisco',
          date: '2021 - Present',
          description: 'Teaching visual programming and web development to children aged 7-17 on weekends.'
        }
      ]
    }
  ]
});
