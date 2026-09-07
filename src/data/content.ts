export interface AboutData {
  title: string;
  name: string;
  role: string;
  bio: string;
  highlights: string[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface SkillPageData {
  title: string;
  description: string;
  skills: string[];
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
}

export interface ContactLink {
  platform: string;
  label: string;
  url: string;
}

export const aboutData: AboutData = {
  title: "ABOUT ME",
  name: "Dhruv",
  role: "Full-Stack & Game Developer",
  bio: "Passionate software developer building modern web applications, interactive 2D games, and creative pixel-art experiences. Loves solving algorithmic problems and crafting clean, robust code.",
  highlights: [
    "🕹️ Phaser 3 & 2D Game Architecture",
    "⚡ React, TypeScript & Vite ecosystem",
    "🚀 Full-Stack Web Development",
    "🏆 Competitive Programmer (Codeforces)"
  ]
};

export const skillsData: SkillCategory[] = [
  {
    category: "Languages",
    skills: ["TypeScript", "JavaScript", "C++", "Python", "HTML5", "CSS3", "SQL"]
  },
  {
    category: "Frameworks & Libraries",
    skills: ["React", "Phaser 3", "Node.js", "Express", "Vite", "Tailwind CSS"]
  },
  {
    category: "Tools & Infrastructure",
    skills: ["Git", "GitHub", "VS Code", "Vercel", "Docker", "Linux"]
  }
];

export const skillsPages: SkillPageData[] = [
  {
    title: "Frontend Engineering",
    description: "Building responsive, modern, and interactive user interfaces with cutting-edge web technologies.",
    skills: ["React 19 & Hooks", "TypeScript", "HTML5 & Semantic Markup", "CSS3 & Retro Layouts", "Vite Ecosystem"]
  },
  {
    title: "Backend & Cloud",
    description: "Designing robust server-side architectures, RESTful APIs, and cloud infrastructure.",
    skills: ["Node.js & Express", "Python Automation", "SQL & Database Systems", "RESTful API Design", "Docker Containers"]
  },
  {
    title: "Game Dev & 2D Graphics",
    description: "Crafting real-time side-scrolling mechanics, pixel-art renderers, and interactive web experiences.",
    skills: ["Phaser 3 Engine", "Sprite Animations", "Arcade Physics World", "Tilemap Integration", "HTML5 Canvas API"]
  },
  {
    title: "Tools & Problem Solving",
    description: "Developer tooling, version control, workflow automation, and algorithmic mastery.",
    skills: ["Git & GitHub Workflows", "Linux Shell & Scripting", "Competitive Programming (C++)", "VS Code Development", "Vercel Deployments"]
  }
];

export const projectsData: ProjectData[] = [
  {
    id: "pixel-portfolio",
    title: "Pixel Portfolio",
    description: "An interactive 2D horizontal side-scrolling portfolio game built with Phaser 3, React, and TypeScript.",
    tags: ["React", "TypeScript", "Phaser 3", "Vite"],
    githubUrl: "https://github.com/Dhruv-2903/Portfolio-",
    demoUrl: "https://github.com/Dhruv-2903/Portfolio-"
  },
  {
    id: "algo-visualizer",
    title: "Algorithm Visualizer",
    description: "Interactive web app for visualizing pathfinding and sorting algorithms with step-by-step speed control.",
    tags: ["TypeScript", "React", "Data Structures"],
    githubUrl: "https://github.com/Dhruv-2903",
    demoUrl: "https://github.com/Dhruv-2903"
  },
  {
    id: "tilemap-editor",
    title: "2D Sprite & Tilemap Editor",
    description: "Lightweight browser-based tool for creating tilemaps and pixel sprites exported directly to Phaser 3 format.",
    tags: ["JavaScript", "HTML5 Canvas", "Phaser 3"],
    githubUrl: "https://github.com/Dhruv-2903",
    demoUrl: "https://github.com/Dhruv-2903"
  }
];

export const contactLinks: ContactLink[] = [
  {
    platform: "Email",
    label: "dhruv@example.com",
    url: "mailto:dhruv@example.com"
  },
  {
    platform: "GitHub",
    label: "github.com/Dhruv-2903",
    url: "https://github.com/Dhruv-2903"
  },
  {
    platform: "LinkedIn",
    label: "linkedin.com/in/dhruv",
    url: "https://linkedin.com"
  },
  {
    platform: "Codeforces",
    label: "codeforces.com/profile/dhruv",
    url: "https://codeforces.com"
  }
];
