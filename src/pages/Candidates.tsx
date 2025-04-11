
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { candidateService, jobService, resumeService, Candidate, JobDescription, Resume, matchingService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PlusCircle,
  ChevronDown,
  MoreHorizontal,
  UserCircle,
  Mail,
  Trash2,
  FileText,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Candidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchResult, setMatchResult] = useState<{ matchScore: number; matchDetails: Record<string, number> } | null>(null);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const getResumeForCandidate = (candidateId: string): Resume | undefined => {
    return resumes.find(r => r.candidateId === candidateId);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesData, jobsData, resumesData] = await Promise.all([
        candidateService.getCandidates(),
        jobService.getJobs(),
        resumeService.getResumes()
      ]);
      setCandidates(candidatesData);
      setJobs(jobsData);
      setResumes(resumesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = () => {
    setSelectedCandidate(null);
    setName('');
    setEmail('');
    setPhone('');
    setResumeFile(null);
    setIsAddDialogOpen(true);
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDeleteDialogOpen(true);
  };

  const handleUploadResume = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setResumeFile(null);
    setIsResumeDialogOpen(true);
  };

  const handleMatchCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setSelectedJob(jobs.length > 0 ? jobs[0].id : '');
    setMatchResult(null);
    setIsMatchDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCandidate) return;

    try {
      setIsSubmitting(true);
      await candidateService.deleteCandidate(selectedCandidate.id);
      setCandidates(candidates.filter(c => c.id !== selectedCandidate.id));
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Candidate Deleted',
        description: 'The candidate has been removed from the system.'
      });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting candidate',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const submitMatch = async () => {
    if (!selectedCandidate || !selectedJob) return;

    try {
      setIsSubmitting(true);
      const result = await matchingService.matchCandidateToJob(selectedCandidate.id, selectedJob);
      setMatchResult(result);
      toast({
        title: 'Match Successful',
        description: `Score: ${result.matchScore.toFixed(2)}%`
      });
    } catch (error) {
      console.error('Error matching candidate:', error);
      toast({
        variant: 'destructive',
        title: 'Match Failed',
        description: 'Could not fetch match score.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const submitAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields.'
      });
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      // Create the candidate with required fields
      const newCandidate = await candidateService.createCandidate({
        name,
        email,
        phone,
        resumeId: '', // Initialize with empty string
        skills: [], // Add empty array for skills if required
        status: 'new' // Set default status
      });
      
      setCandidates([newCandidate, ...candidates]);
      setIsAddDialogOpen(false);
      
      if (resumeFile) {
        // Upload resume and update the candidate
        await uploadResumeForCandidate(resumeFile, newCandidate.id);
      }
      
      toast({
        title: 'Candidate Added',
        description: 'The candidate has been added to the system.'
      });
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast({
        variant: 'destructive',
        title: 'Error adding candidate',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !resumeFile) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a resume file.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await uploadResumeForCandidate(resumeFile, selectedCandidate.id);
      setIsResumeDialogOpen(false);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        variant: 'destructive',
        title: 'Error uploading resume',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const uploadResumeForCandidate = async (file: File, candidateId: string) => {
    try {
      const resume = await resumeService.uploadResume(file, candidateId);
      
      // Update candidate with resumeId
      const updatedCandidate = await candidateService.updateCandidate(candidateId, {
        resumeId: resume.id
      });
  
      // Update state
      setResumes(prev => [resume, ...prev]);
      setCandidates(prev => prev.map(c => 
        c.id === candidateId ? updatedCandidate : c
      ));
  
      toast({
        title: 'Resume Uploaded',
        description: 'The resume was successfully uploaded and is being processed.'
      });
  
    } catch (error) {
      console.error('Error in uploadResumeForCandidate:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload resume'
      });
      throw error; // Re-throw if needed for further handling
    }
  };

  const shortlistCandidate = async (candidate: Candidate) => {
    try {
      const updatedCandidate = await candidateService.shortlistCandidate(candidate.id);
      setCandidates(candidates.map(c => 
        c.id === candidate.id ? updatedCandidate : c
      ));
      toast({
        title: 'Candidate Shortlisted',
        description: 'The candidate has been added to the shortlist.'
      });
    } catch (error) {
      console.error('Error shortlisting candidate:', error);
      toast({
        variant: 'destructive',
        title: 'Error shortlisting candidate',
        description: 'Please try again later.'
      });
    }
  };

  const renderCandidateStatus = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return (
          <Badge className="bg-success-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Shortlisted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'contacted':
        return (
          <Badge className="bg-brand-500">
            <Mail className="h-3 w-3 mr-1" />
            Contacted
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            New
          </Badge>
        );
    }
  };

  const renderResumeStatus = (candidateId: string) => {
    const resume = getResumeForCandidate(candidateId);
    
    if (!resume) {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          No Resume
        </Badge>
      );
    }
    
    if (resume.status === 'pending') {
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-success-500 border-success-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Processed
      </Badge>
    );
  };

  const filterCandidatesByStatus = (status: string | null) => {
    if (!status) return candidates;
    return candidates.filter(c => c.status === status);
  };

  return (
    <Layout title="Candidates">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Candidates</h2>
            <p className="text-muted-foreground mt-1">
              Manage candidates and their resumes for job matching.
            </p>
          </div>
          <Button onClick={handleAddCandidate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidates.filter(c => c.status === 'shortlisted').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidates.filter(c => c.status === 'contacted').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resumes Uploaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumes.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Candidates</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="contacted">Contacted</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {renderCandidatesTable(candidates)}
          </TabsContent>
          
          <TabsContent value="shortlisted" className="mt-6">
            {renderCandidatesTable(filterCandidatesByStatus('shortlisted'))}
          </TabsContent>
          
          <TabsContent value="contacted" className="mt-6">
            {renderCandidatesTable(filterCandidatesByStatus('contacted'))}
          </TabsContent>
          
          <TabsContent value="new" className="mt-6">
            {renderCandidatesTable(filterCandidatesByStatus('new'))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Candidate Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>
              Enter the candidate's information and upload their resume.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAddCandidate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john.smith@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. (555) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resume">Resume (Optional)</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Candidate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Candidate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCandidate?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Upload Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Upload a resume for {selectedCandidate?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitResumeUpload}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="resumeUpload">Resume File</Label>
                <Input
                  id="resumeUpload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResumeDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !resumeFile}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Resume
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Match Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Match Candidate with Job</DialogTitle>
            <DialogDescription>
              Match {selectedCandidate?.name} with a job description to calculate compatibility.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitMatch}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="jobSelect">Select Job Description</Label>
                <select
                  id="jobSelect"
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} at {job.company}
                    </option>
                  ))}
                </select>
              </div>

              {matchResult && (
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Overall Match</Label>
                      <span className="font-semibold">{matchResult.matchScore}%</span>
                    </div>
                    <Progress 
                      value={matchResult.matchScore} 
                      className="h-2"
                      color={matchResult.matchScore >= 80 ? 'bg-success-500' : 'bg-brand-500'}
                    />
                    {matchResult.matchScore >= 80 ? (
                      <p className="text-xs text-success-500 mt-1">This candidate is a strong match!</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Below the shortlisting threshold (80%).</p>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <Label className="mb-2 block">Match Breakdown</Label>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Skills Match</span>
                          <span className="text-sm font-medium">{matchResult.matchDetails.skills}%</span>
                        </div>
                        <Progress value={matchResult.matchDetails.skills} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Experience Match</span>
                          <span className="text-sm font-medium">{matchResult.matchDetails.experience}%</span>
                        </div>
                        <Progress value={matchResult.matchDetails.experience} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Responsibilities Match</span>
                          <span className="text-sm font-medium">{matchResult.matchDetails.responsibilities}%</span>
                        </div>
                        <Progress value={matchResult.matchDetails.responsibilities} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-between">
              <div>
                {matchResult && matchResult.matchScore >= 80 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-success-50 text-success-600 border-success-200 hover:bg-success-100"
                    onClick={() => {
                      if (selectedCandidate) {
                        shortlistCandidate(selectedCandidate);
                        setIsMatchDialogOpen(false);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Shortlist Candidate
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMatchDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Close
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Calculate Match
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );

  function renderCandidatesTable(candidatesList: Candidate[]) {
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (candidatesList.length === 0) {
      return (
        <div className="text-center py-10">
          <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No candidates found</h3>
          <p className="mt-2 text-muted-foreground">
            Add a new candidate to get started.
          </p>
          <Button onClick={handleAddCandidate} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Resume Status</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidatesList.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{renderResumeStatus(candidate.id)}</TableCell>
                <TableCell>
                  {candidate.matchScore ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          candidate.matchScore >= 80
                            ? "text-success-600 font-medium"
                            : ""
                        }
                      >
                        {candidate.matchScore}%
                      </span>
                      <Progress 
                        value={candidate.matchScore} 
                        className="h-2 w-16"
                        color={candidate.matchScore >= 80 ? 'bg-success-500' : 'bg-brand-500'}
                      />
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not matched</span>
                  )}
                </TableCell>
                <TableCell>{renderCandidateStatus(candidate.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUploadResume(candidate)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMatchCandidate(candidate)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Match with Job
                      </DropdownMenuItem>
                      {candidate.status !== 'shortlisted' && candidate.matchScore && candidate.matchScore >= 80 && (
                        <DropdownMenuItem onClick={() => shortlistCandidate(candidate)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Shortlist
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDeleteCandidate(candidate)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default Candidates;
