
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { jobService, JobDescription } from '@/services/api';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, FileText, Check, Loader2 } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const JobDescriptions = () => {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching job descriptions',
        description: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = () => {
    setSelectedJob(null);
    setTitle('');
    setCompany('');
    setLocation('');
    setDescription('');
    setIsDialogOpen(true);
  };

  const handleEditJob = (job: JobDescription) => {
    setSelectedJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location);
    setDescription(job.description);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (job: JobDescription) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;

    try {
      setIsSubmitting(true);
      await jobService.deleteJob(selectedJob.id);
      setJobs(jobs.filter(job => job.id !== selectedJob.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting job description',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !location || !description) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedJob) {
        // Update existing job
        const updatedJob = await jobService.updateJob(selectedJob.id, {
          title,
          company,
          location,
          description
        });
        setJobs(jobs.map(job => (job.id === selectedJob.id ? updatedJob : job)));
      } else {
        // Create new job
        const newJob = await jobService.createJob({
          title,
          company,
          location,
          description
        });
        setJobs([newJob, ...jobs]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting job:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving job description',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderJobList = (jobsList: JobDescription[]) => {
    if (jobsList.length === 0) {
      return (
        <div className="text-center py-10">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No job descriptions found</h3>
          <p className="mt-2 text-muted-foreground">
            Add a new job description to get started.
          </p>
          <Button onClick={handleAddJob} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Job Description
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobsList.map(job => (
          <Card key={job.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <Badge
                  variant={job.status === 'processed' ? 'default' : 'outline'}
                  className="ml-2"
                >
                  {job.status === 'processed' ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Processed
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
              <CardDescription className="flex flex-col gap-1 mt-1">
                <span>{job.company}</span>
                <span>{job.location}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-sm text-muted-foreground line-clamp-3">
                {job.description}
              </div>
              
              {job.summary && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-2">Key Requirements:</h4>
                  <div className="flex flex-wrap gap-1">
                    {job.summary.skills.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.summary.skills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.summary.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                Added {new Date(job.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEditJob(job)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteConfirm(job)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Job Descriptions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Job Descriptions</h2>
          <Button onClick={handleAddJob}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Job Description
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Manage job descriptions that will be used for candidate matching.
        </p>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="processed">Processed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              renderJobList(jobs)
            )}
          </TabsContent>

          <TabsContent value="processed">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              renderJobList(jobs.filter(job => job.status === 'processed'))
            )}
          </TabsContent>

          <TabsContent value="pending">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              renderJobList(jobs.filter(job => job.status === 'pending'))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Job Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedJob ? 'Edit Job Description' : 'Add Job Description'}</DialogTitle>
            <DialogDescription>
              {selectedJob
                ? 'Update the job description details below.'
                : 'Enter the details of the new job description.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. TechCorp"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, New York, NY"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter the full job description with responsibilities and requirements..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedJob ? 'Update Job' : 'Add Job'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Job Description</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
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
              onClick={handleDelete}
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
};

export default JobDescriptions;
