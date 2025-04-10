
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { resumeService, candidateService, Resume, Candidate } from '@/services/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  UserCircle,
  Plus,
  Upload,
  Trash2,
  Download,
  MoreHorizontal,
  Loader2,
  CheckCircle,
  Clock,
  Search,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Resumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resumesData, candidatesData] = await Promise.all([
        resumeService.getResumes(),
        candidateService.getCandidates()
      ]);
      setResumes(resumesData);
      setCandidates(candidatesData);
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

  const handleUploadResume = () => {
    setResumeFile(null);
    setSelectedCandidate(candidates.length > 0 ? candidates[0].id : '');
    setIsUploadDialogOpen(true);
  };

  const handleViewResume = (resume: Resume) => {
    setSelectedResume(resume);
    setIsViewDialogOpen(true);
  };

  const handleDeleteResume = (resume: Resume) => {
    setSelectedResume(resume);
    setIsDeleteDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const submitUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !resumeFile) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a candidate and a resume file.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const newResume = await resumeService.uploadResume(resumeFile, selectedCandidate);
      setResumes([newResume, ...resumes]);
      
      // Update the candidate's resumeId
      const updatedCandidate = await candidateService.updateCandidate(selectedCandidate, {
        resumeId: newResume.id
      });
      
      // Update the candidates list
      setCandidates(candidates.map(c => 
        c.id === selectedCandidate ? updatedCandidate : c
      ));
      
      setIsUploadDialogOpen(false);
      
      toast({
        title: 'Resume Uploaded',
        description: 'The resume is being processed by our AI.'
      });
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

  const confirmDeleteResume = async () => {
    if (!selectedResume) return;

    try {
      setIsSubmitting(true);
      await resumeService.deleteResume(selectedResume.id);
      setResumes(resumes.filter(r => r.id !== selectedResume.id));
      
      // Update the candidate's resumeId if this was their resume
      const relatedCandidate = candidates.find(c => c.resumeId === selectedResume.id);
      if (relatedCandidate) {
        await candidateService.updateCandidate(relatedCandidate.id, {
          resumeId: ''
        });
        setCandidates(candidates.map(c => 
          c.id === relatedCandidate.id ? { ...c, resumeId: '' } : c
        ));
      }
      
      setIsDeleteDialogOpen(false);
      
      toast({
        title: 'Resume Deleted',
        description: 'The resume has been removed from the system.'
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting resume',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCandidateForResume = (resumeId: string) => {
    return candidates.find(c => c.resumeId === resumeId);
  };

  const renderResumeStatus = (status: string) => {
    if (status === 'pending') {
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

  const filterResumesByStatus = (status: string | null) => {
    if (!status) return resumes;
    return resumes.filter(r => r.status === status);
  };

  return (
    <Layout title="Resumes">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Resumes</h2>
            <p className="text-muted-foreground mt-1">
              Manage candidate resumes and view parsed data.
            </p>
          </div>
          <Button onClick={handleUploadResume}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumes.filter(r => r.status === 'processed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumes.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resumes..."
              className="pl-8"
            />
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Resumes</TabsTrigger>
            <TabsTrigger value="processed">Processed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {renderResumesTable(resumes)}
          </TabsContent>
          
          <TabsContent value="processed" className="mt-6">
            {renderResumesTable(filterResumesByStatus('processed'))}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            {renderResumesTable(filterResumesByStatus('pending'))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Resume Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Upload a resume for a candidate.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitUploadResume}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="candidate">Select Candidate</Label>
                <select
                  id="candidate"
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select a candidate</option>
                  {candidates.map(candidate => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resumeFile">Resume File</Label>
                <Input
                  id="resumeFile"
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
                onClick={() => setIsUploadDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !resumeFile || !selectedCandidate}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Resume
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Resume Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Resume Details</DialogTitle>
            <DialogDescription>
              View parsed resume information for {getCandidateForResume(selectedResume?.id || '')?.name || 'Candidate'}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedResume?.status === 'processed' && selectedResume.parsed ? (
            <div className="mt-4 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedResume.parsed.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Education</h3>
                <ul className="space-y-2">
                  {selectedResume.parsed.education.map((edu, index) => (
                    <li key={index} className="text-sm">
                      • {edu}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <ul className="space-y-2">
                  {selectedResume.parsed.workExperience.map((exp, index) => (
                    <li key={index} className="text-sm">
                      • {exp}
                    </li>
                  ))}
                </ul>
              </div>
              
              {selectedResume.parsed.certifications && selectedResume.parsed.certifications.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Certifications</h3>
                  <ul className="space-y-2">
                    {selectedResume.parsed.certifications.map((cert, index) => (
                      <li key={index} className="text-sm">
                        • {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">
                Resume parsing in progress. Please check back later.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              disabled={!selectedResume}
              onClick={() => {
                toast({
                  title: 'Download Started',
                  description: 'The resume is being downloaded.'
                });
                setIsViewDialogOpen(false);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resume? This action cannot be undone.
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
              onClick={confirmDeleteResume}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );

  function renderResumesTable(resumesList: Resume[]) {
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (resumesList.length === 0) {
      return (
        <div className="text-center py-10">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No resumes found</h3>
          <p className="mt-2 text-muted-foreground">
            Upload a new resume to get started.
          </p>
          <Button onClick={handleUploadResume} className="mt-4">
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resumesList.map((resume) => {
              const candidate = getCandidateForResume(resume.id);
              return (
                <TableRow key={resume.id}>
                  <TableCell className="font-medium">{resume.fileName}</TableCell>
                  <TableCell>
                    {candidate ? (
                      <div className="flex items-center">
                        <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        {candidate.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>{renderResumeStatus(resume.status)}</TableCell>
                  <TableCell>{new Date(resume.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewResume(resume)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          toast({
                            title: 'Download Started',
                            description: 'The resume is being downloaded.'
                          });
                        }}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteResume(resume)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default Resumes;
