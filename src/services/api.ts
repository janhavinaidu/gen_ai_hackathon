import { toast } from "react-hot-toast";

// Use relative paths for API calls since Vite will proxy them
const BASE_URL = ''; // Empty because we're using relative paths

// ------------------- Types -------------------
export interface JobDescription {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  skills: string[];
  createdAt: string;
  status: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  status?: string;
  matchScore?: number;
  phone: string;          // Required (non-optional)
  resumeId: string;
}

export interface Resume {
  id: string;
  candidateId: string;
  fileUrl: string;
  status: 'pending' | 'processed' | 'failed';
  processedAt?: string;
}

// ------------------- jobService -------------------
export const jobService = {
  getJobs: async (): Promise<JobDescription[]> => {
    const res = await fetch('/jobs/');
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return await res.json();
  },

  getJobById: async (id: string): Promise<JobDescription> => {
    const res = await fetch(`/jobs/${id}`);
    if (!res.ok) throw new Error('Job not found');
    return await res.json();
  },

  createJob: async (
    job: Omit<JobDescription, 'id' | 'createdAt' | 'status'>
  ): Promise<JobDescription> => {
    const res = await fetch('/jobs/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      toast.error(errorData.message || "Something went wrong");
      throw new Error(errorData.message || 'Failed to create job');
    }

    return await res.json();
  },

  updateJob: async (id: string, job: Partial<JobDescription>): Promise<JobDescription> => {
    const res = await fetch(`/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      toast.error(errorData.message || "Failed to update job");
      throw new Error(errorData.message || 'Failed to update job');
    }
    return await res.json();
  },

  deleteJob: async (id: string): Promise<void> => {
    const res = await fetch(`/jobs/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      toast.error(errorData.message || "Failed to delete job");
      throw new Error(errorData.message || 'Failed to delete job');
    }
  }
};

// ------------------- candidateService -------------------
export const candidateService = {
  getCandidates: async (): Promise<Candidate[]> => {
    const res = await fetch('/candidates/');
    if (!res.ok) throw new Error('Failed to fetch candidates');
  
    const data = await res.json();
  
    // If the API wraps candidates in an object
    return data.candidates ?? []; // default to empty array if undefined
  },
  

  getCandidate: async (id: string): Promise<Candidate> => {
    const res = await fetch(`/candidates/${id}`);
    if (!res.ok) throw new Error('Candidate not found');
    return await res.json();
  },

  createCandidate: async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
    console.log("📦 Sending to API:", candidate); // 🔍 Log before the fetch
  
    const res = await fetch('/candidates/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate)
    });
  
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      toast.error(errorData.message || "Failed to create candidate");
      throw new Error(errorData.message || 'Failed to create candidate');
    }
  
    return await res.json();
  },
  updateCandidate: async (id: string, candidate: Partial<Candidate>): Promise<Candidate> => {
    const res = await fetch(`/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      toast.error(errorData.message || "Failed to update candidate");
      throw new Error(errorData.message || 'Failed to update candidate');
    }
    return await res.json();
  },

  deleteCandidate: async (id: string): Promise<void> => {
    const res = await fetch(`/candidates/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      toast.error(errorData.message || "Failed to delete candidate");
      throw new Error(errorData.message || 'Failed to delete candidate');
    }
  },

  shortlistCandidate: async (id: string): Promise<Candidate> => {
    const res = await fetch(`/candidates/${id}/shortlist`, {
      method: 'PATCH'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      toast.error(errorData.message || "Failed to shortlist candidate");
      throw new Error(errorData.message || 'Failed to shortlist candidate');
    }
    return await res.json();
  }
};
export const resumeService = {
  getResumes: async (): Promise<Resume[]> => {
    try {
      const res = await fetch('/resumes/');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch resumes');
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  },

  uploadResume: async (file: File, candidateId: string): Promise<Resume> => {
    try {
      // Validate file before upload
      if (!file) throw new Error('No file provided');
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF and Word documents are allowed');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('candidateId', candidateId);

      const res = await fetch('/resumes/', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `Upload failed with status ${res.status}`);
      }

      return await res.json();
      
    } catch (error) {
      console.error('Error in resumeService.uploadResume:', error);
      throw error;
    }
  },

  getResume: async (id: string): Promise<Resume> => {
    try {
      const res = await fetch(`/resumes/${id}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Resume not found');
      }
      return await res.json();
    } catch (error) {
      console.error(`Error fetching resume ${id}:`, error);
      throw error;
    }
  }
};
// ------------------- matchingService -------------------
export const matchingService = {
  matchCandidateToJob: async (candidateId: string, jobId: string): Promise<any> => {
    const res = await fetch(`/match/${candidateId}/${jobId}`);
    if (!res.ok) throw new Error('Failed to match candidate');
    return await res.json();
  },

  matchCandidateWithJob: async (candidateId: string, jobId: string): Promise<any> => {
    return matchingService.matchCandidateToJob(candidateId, jobId);
  }
};

// ------------------- emailService -------------------
export const emailService = {
  sendEmail: async (emailData: any): Promise<any> => {
    const res = await fetch('/send-email/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });

    if (!res.ok) throw new Error('Failed to send email');
    return await res.json();
  },

  getEmailTemplates: async (): Promise<any[]> => {
    const res = await fetch('/email-templates/');
    if (!res.ok) throw new Error('Failed to fetch email templates');
    return await res.json();
  }
};