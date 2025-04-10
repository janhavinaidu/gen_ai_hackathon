
// This file simulates API calls to a backend server
// In a real implementation, these would connect to FastAPI endpoints

import { toast } from '@/hooks/use-toast';

// Types for our data models
export type JobDescription = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  summary?: {
    skills: string[];
    experience: string[];
    responsibilities: string[];
  };
  createdAt: string;
  status: 'pending' | 'processed';
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeId: string;
  matchScore?: number;
  status: 'new' | 'shortlisted' | 'rejected' | 'contacted';
  createdAt: string;
};

export type Resume = {
  id: string;
  candidateId: string;
  fileName: string;
  fileUrl: string;
  parsed?: {
    education: string[];
    workExperience: string[];
    skills: string[];
    certifications: string[];
  };
  status: 'pending' | 'processed';
  createdAt: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
};

// Sample data
const sampleJobs: JobDescription[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Remote',
    description: `
      We are looking for a Frontend Developer with 3+ years of experience in React.js. 
      The ideal candidate will have a strong understanding of JavaScript, HTML, and CSS, 
      and experience with modern frontend frameworks.
      
      Responsibilities:
      - Develop user interface components using React.js
      - Translate designs and wireframes into high-quality code
      - Optimize components for maximum performance
      
      Requirements:
      - 3+ years of experience with React.js
      - Proficiency in JavaScript, HTML, CSS
      - Experience with Redux, TypeScript
      - Bachelor's degree in Computer Science or related field
    `,
    summary: {
      skills: ['React.js', 'JavaScript', 'HTML', 'CSS', 'Redux', 'TypeScript'],
      experience: ['3+ years of React.js', 'Bachelor\'s degree in Computer Science'],
      responsibilities: ['Develop UI components', 'Translate designs to code', 'Optimize performance']
    },
    createdAt: '2025-04-05T12:00:00Z',
    status: 'processed'
  },
  {
    id: '2',
    title: 'Data Scientist',
    company: 'DataInsights Inc.',
    location: 'New York, NY',
    description: `
      We're seeking a Data Scientist to join our growing team. The ideal candidate will
      have experience with machine learning, statistical analysis, and data visualization.
      
      Responsibilities:
      - Develop machine learning models
      - Analyze large datasets
      - Create data visualizations
      
      Requirements:
      - Master's degree in Statistics, Computer Science, or related field
      - Experience with Python, R, SQL
      - Knowledge of machine learning algorithms
    `,
    summary: {
      skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
      experience: ['Master\'s degree in Statistics or CS'],
      responsibilities: ['Develop ML models', 'Analyze large datasets', 'Create visualizations']
    },
    createdAt: '2025-04-08T09:30:00Z',
    status: 'processed'
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudSystems',
    location: 'Remote',
    description: `
      We are looking for a DevOps Engineer to help automate our deployment process and
      maintain our cloud infrastructure.
      
      Responsibilities:
      - Implement CI/CD pipelines
      - Manage cloud infrastructure
      - Monitor system performance
      
      Requirements:
      - Experience with AWS or Azure
      - Knowledge of Docker, Kubernetes
      - Experience with CI/CD tools
    `,
    createdAt: '2025-04-10T14:15:00Z',
    status: 'pending'
  }
];

const sampleCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    resumeId: '1',
    matchScore: 87,
    status: 'shortlisted',
    createdAt: '2025-04-07T10:20:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 987-6543',
    resumeId: '2',
    matchScore: 92,
    status: 'contacted',
    createdAt: '2025-04-08T14:30:00Z'
  },
  {
    id: '3',
    name: 'Miguel Hernandez',
    email: 'miguel.h@example.com',
    phone: '(555) 456-7890',
    resumeId: '3',
    matchScore: 76,
    status: 'new',
    createdAt: '2025-04-09T09:45:00Z'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.c@example.com',
    phone: '(555) 234-5678',
    resumeId: '4',
    matchScore: 65,
    status: 'rejected',
    createdAt: '2025-04-10T11:15:00Z'
  }
];

const sampleResumes: Resume[] = [
  {
    id: '1',
    candidateId: '1',
    fileName: 'john_smith_resume.pdf',
    fileUrl: '/sample_files/john_smith_resume.pdf',
    parsed: {
      education: [
        'Bachelor of Science in Computer Science, University of Technology, 2018-2022'
      ],
      workExperience: [
        'Frontend Developer at WebTech Solutions, 2022-Present',
        'Web Developer Intern at Digital Innovations, Summer 2021'
      ],
      skills: ['React.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Redux', 'Git'],
      certifications: ['React Developer Certification']
    },
    status: 'processed',
    createdAt: '2025-04-07T10:20:00Z'
  },
  {
    id: '2',
    candidateId: '2',
    fileName: 'sarah_johnson_resume.pdf',
    fileUrl: '/sample_files/sarah_johnson_resume.pdf',
    parsed: {
      education: [
        'Master of Computer Science, Tech University, 2020-2022',
        'Bachelor of Science in Software Engineering, State University, 2016-2020'
      ],
      workExperience: [
        'Senior Frontend Developer at InnovateApp, 2022-Present',
        'Frontend Developer at TechStart, 2020-2022'
      ],
      skills: ['React.js', 'JavaScript', 'TypeScript', 'Next.js', 'Redux', 'GraphQL', 'TailwindCSS'],
      certifications: ['AWS Certified Developer', 'Google Cloud Professional']
    },
    status: 'processed',
    createdAt: '2025-04-08T14:30:00Z'
  },
  {
    id: '3',
    candidateId: '3',
    fileName: 'miguel_hernandez_resume.pdf',
    fileUrl: '/sample_files/miguel_hernandez_resume.pdf',
    parsed: {
      education: [
        'Bachelor of Science in Information Technology, National University, 2019-2023'
      ],
      workExperience: [
        'Junior Developer at SoftwareSolutions, 2023-Present'
      ],
      skills: ['JavaScript', 'React.js', 'HTML', 'CSS', 'Node.js', 'Express'],
      certifications: ['JavaScript Fundamentals']
    },
    status: 'processed',
    createdAt: '2025-04-09T09:45:00Z'
  },
  {
    id: '4',
    candidateId: '4',
    fileName: 'emily_chen_resume.pdf',
    fileUrl: '/sample_files/emily_chen_resume.pdf',
    status: 'pending',
    createdAt: '2025-04-10T11:15:00Z'
  }
];

const sampleEmailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Interview Invitation',
    subject: 'Interview Invitation for {{position}} at {{company}}',
    body: `
      Dear {{candidateName}},

      We have reviewed your application for the {{position}} position at {{company}} and we're impressed with your qualifications. We would like to invite you for an interview on {{interviewDate}} at {{interviewTime}}.

      The interview will be conducted {{interviewFormat}}.

      Please confirm your availability by replying to this email.

      Best regards,
      {{recruiterName}}
      {{company}}
    `,
    createdAt: '2025-03-15T08:00:00Z'
  },
  {
    id: '2',
    name: 'Rejection Email',
    subject: 'Update on Your Application for {{position}} at {{company}}',
    body: `
      Dear {{candidateName}},

      Thank you for your interest in the {{position}} position at {{company}} and for taking the time to apply.

      After careful consideration of all applications, we regret to inform you that we have decided to pursue other candidates whose qualifications more closely match our needs at this time.

      We appreciate your interest in our company and wish you success in your job search.

      Best regards,
      {{recruiterName}}
      {{company}}
    `,
    createdAt: '2025-03-15T08:30:00Z'
  }
];

// API service functions
export const jobService = {
  getJobs: async (): Promise<JobDescription[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...sampleJobs];
  },

  getJobById: async (id: string): Promise<JobDescription | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return sampleJobs.find(job => job.id === id);
  },

  createJob: async (job: Omit<JobDescription, 'id' | 'createdAt' | 'status'>): Promise<JobDescription> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newJob: JobDescription = {
      id: `${sampleJobs.length + 1}`,
      ...job,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    sampleJobs.push(newJob);
    
    // Simulate JD processing
    setTimeout(() => {
      const index = sampleJobs.findIndex(j => j.id === newJob.id);
      if (index !== -1) {
        sampleJobs[index] = {
          ...sampleJobs[index],
          status: 'processed',
          summary: {
            skills: job.description.includes('React')
              ? ['React.js', 'JavaScript', 'HTML', 'CSS', 'Redux']
              : ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
            experience: job.description.includes('years')
              ? ['3+ years of experience', 'Bachelor\'s degree']
              : ['Entry level', 'Some experience required'],
            responsibilities: [
              'Develop user interfaces',
              'Write clean code',
              'Collaborate with team members'
            ]
          }
        };
      }
    }, 3000);
    
    toast({
      title: "Job Description Added",
      description: "The job description is being processed by our AI agents."
    });
    
    return newJob;
  },

  updateJob: async (id: string, job: Partial<JobDescription>): Promise<JobDescription> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = sampleJobs.findIndex(j => j.id === id);
    if (index === -1) {
      throw new Error('Job not found');
    }
    sampleJobs[index] = { ...sampleJobs[index], ...job };
    
    toast({
      title: "Job Description Updated",
      description: "The job description has been successfully updated."
    });
    
    return sampleJobs[index];
  },

  deleteJob: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = sampleJobs.findIndex(j => j.id === id);
    if (index !== -1) {
      sampleJobs.splice(index, 1);
      
      toast({
        title: "Job Description Deleted",
        description: "The job description has been removed from the system."
      });
    }
  }
};

export const candidateService = {
  getCandidates: async (): Promise<Candidate[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...sampleCandidates];
  },

  getCandidateById: async (id: string): Promise<Candidate | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return sampleCandidates.find(candidate => candidate.id === id);
  },

  createCandidate: async (candidate: Omit<Candidate, 'id' | 'createdAt' | 'status' | 'matchScore'>): Promise<Candidate> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newCandidate: Candidate = {
      id: `${sampleCandidates.length + 1}`,
      ...candidate,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    sampleCandidates.push(newCandidate);
    
    toast({
      title: "Candidate Added",
      description: "The candidate has been added to the system."
    });
    
    return newCandidate;
  },

  updateCandidate: async (id: string, candidate: Partial<Candidate>): Promise<Candidate> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = sampleCandidates.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Candidate not found');
    }
    sampleCandidates[index] = { ...sampleCandidates[index], ...candidate };
    
    toast({
      title: "Candidate Updated",
      description: "The candidate information has been updated."
    });
    
    return sampleCandidates[index];
  },

  deleteCandidate: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = sampleCandidates.findIndex(c => c.id === id);
    if (index !== -1) {
      sampleCandidates.splice(index, 1);
      
      toast({
        title: "Candidate Deleted",
        description: "The candidate has been removed from the system."
      });
    }
  },

  shortlistCandidate: async (id: string): Promise<Candidate> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = sampleCandidates.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Candidate not found');
    }
    sampleCandidates[index] = { ...sampleCandidates[index], status: 'shortlisted' };
    
    toast({
      title: "Candidate Shortlisted",
      description: "The candidate has been added to the shortlist."
    });
    
    return sampleCandidates[index];
  }
};

export const resumeService = {
  getResumes: async (): Promise<Resume[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...sampleResumes];
  },

  getResumeById: async (id: string): Promise<Resume | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return sampleResumes.find(resume => resume.id === id);
  },

  uploadResume: async (file: File, candidateId: string): Promise<Resume> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newResume: Resume = {
      id: `${sampleResumes.length + 1}`,
      candidateId,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    sampleResumes.push(newResume);
    
    // Simulate resume parsing
    setTimeout(() => {
      const index = sampleResumes.findIndex(r => r.id === newResume.id);
      if (index !== -1) {
        sampleResumes[index] = {
          ...sampleResumes[index],
          status: 'processed',
          parsed: {
            education: [
              'Bachelor of Science in Computer Science, University of Technology, 2018-2022'
            ],
            workExperience: [
              'Frontend Developer at WebTech Solutions, 2022-Present',
              'Web Developer Intern at Digital Innovations, Summer 2021'
            ],
            skills: ['React.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Redux', 'Git'],
            certifications: ['React Developer Certification']
          }
        };
        
        // Add match score to candidate
        const candidateIndex = sampleCandidates.findIndex(c => c.id === candidateId);
        if (candidateIndex !== -1) {
          sampleCandidates[candidateIndex] = {
            ...sampleCandidates[candidateIndex],
            matchScore: Math.floor(Math.random() * 30) + 70 // Random score between 70-99
          };
        }
      }
    }, 3000);
    
    toast({
      title: "Resume Uploaded",
      description: "The resume is being processed by our AI agents."
    });
    
    return newResume;
  },

  deleteResume: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = sampleResumes.findIndex(r => r.id === id);
    if (index !== -1) {
      sampleResumes.splice(index, 1);
      
      toast({
        title: "Resume Deleted",
        description: "The resume has been removed from the system."
      });
    }
  }
};

export const emailService = {
  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...sampleEmailTemplates];
  },

  getEmailTemplateById: async (id: string): Promise<EmailTemplate | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return sampleEmailTemplates.find(template => template.id === id);
  },

  createEmailTemplate: async (template: Omit<EmailTemplate, 'id' | 'createdAt'>): Promise<EmailTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newTemplate: EmailTemplate = {
      id: `${sampleEmailTemplates.length + 1}`,
      ...template,
      createdAt: new Date().toISOString()
    };
    sampleEmailTemplates.push(newTemplate);
    
    toast({
      title: "Email Template Created",
      description: "Your new email template has been saved."
    });
    
    return newTemplate;
  },

  updateEmailTemplate: async (id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = sampleEmailTemplates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Email template not found');
    }
    sampleEmailTemplates[index] = { ...sampleEmailTemplates[index], ...template };
    
    toast({
      title: "Email Template Updated",
      description: "Your email template has been updated."
    });
    
    return sampleEmailTemplates[index];
  },

  deleteEmailTemplate: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = sampleEmailTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
      sampleEmailTemplates.splice(index, 1);
      
      toast({
        title: "Email Template Deleted",
        description: "The email template has been removed."
      });
    }
  },

  sendEmail: async (
    candidateId: string, 
    templateId: string, 
    variables: Record<string, string>
  ): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const candidate = sampleCandidates.find(c => c.id === candidateId);
    const template = sampleEmailTemplates.find(t => t.id === templateId);
    
    if (!candidate || !template) {
      throw new Error('Candidate or template not found');
    }
    
    // Update candidate status
    const index = sampleCandidates.findIndex(c => c.id === candidateId);
    if (index !== -1) {
      sampleCandidates[index] = { ...sampleCandidates[index], status: 'contacted' };
    }
    
    toast({
      title: "Email Sent",
      description: `An email has been sent to ${candidate.name}.`
    });
    
    return true;
  }
};

// Helper function to match candidates with job descriptions
export const matchingService = {
  matchCandidateWithJob: async (
    candidateId: string,
    jobId: string
  ): Promise<{ matchScore: number; matchDetails: Record<string, number> }> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const candidate = sampleCandidates.find(c => c.id === candidateId);
    const job = sampleJobs.find(j => j.id === jobId);
    const resume = sampleResumes.find(r => r.id === candidate?.resumeId);
    
    if (!candidate || !job || !resume || !resume.parsed || !job.summary) {
      throw new Error('Candidate, job, or resume not found or not processed');
    }
    
    // Simulate matching algorithm
    const skillsMatch = calculateSkillsMatch(resume.parsed.skills, job.summary.skills);
    const experienceMatch = calculateExperienceMatch(resume.parsed.workExperience, job.summary.experience);
    const responsibilitiesMatch = calculateResponsibilitiesMatch(
      resume.parsed.workExperience,
      job.summary.responsibilities
    );
    
    const overallScore = Math.floor((skillsMatch + experienceMatch + responsibilitiesMatch) / 3);
    
    // Update candidate match score
    const index = sampleCandidates.findIndex(c => c.id === candidateId);
    if (index !== -1) {
      sampleCandidates[index] = { 
        ...sampleCandidates[index], 
        matchScore: overallScore,
        status: overallScore >= 80 ? 'shortlisted' : 'new'
      };
    }
    
    return {
      matchScore: overallScore,
      matchDetails: {
        skills: skillsMatch,
        experience: experienceMatch,
        responsibilities: responsibilitiesMatch
      }
    };
  }
};

// Helper functions for matching
function calculateSkillsMatch(candidateSkills: string[], jobSkills: string[]): number {
  let matches = 0;
  for (const skill of jobSkills) {
    if (candidateSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
      matches++;
    }
  }
  return Math.min(Math.floor((matches / jobSkills.length) * 100), 100);
}

function calculateExperienceMatch(
  candidateExperience: string[],
  requiredExperience: string[]
): number {
  // This is a simplified simulation
  const experienceText = candidateExperience.join(' ').toLowerCase();
  let matches = 0;
  
  for (const exp of requiredExperience) {
    if (experienceText.includes(exp.toLowerCase())) {
      matches++;
    }
  }
  
  return Math.min(Math.floor((matches / requiredExperience.length) * 100), 100);
}

function calculateResponsibilitiesMatch(
  candidateExperience: string[],
  jobResponsibilities: string[]
): number {
  // This is a simplified simulation
  const experienceText = candidateExperience.join(' ').toLowerCase();
  let matches = 0;
  
  for (const resp of jobResponsibilities) {
    const keywords = resp.toLowerCase().split(' ');
    let keywordMatches = 0;
    
    for (const keyword of keywords) {
      if (keyword.length > 3 && experienceText.includes(keyword)) {
        keywordMatches++;
      }
    }
    
    if (keywordMatches / keywords.length > 0.5) {
      matches++;
    }
  }
  
  return Math.min(Math.floor((matches / jobResponsibilities.length) * 100), 100);
}
