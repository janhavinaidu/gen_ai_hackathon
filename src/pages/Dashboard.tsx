
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, FileText, Users, Check, Mail, AlertCircle } from 'lucide-react';
import { candidateService, jobService, resumeService, Candidate, JobDescription, Resume } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [jobsCount, setJobsCount] = useState(0);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [resumesCount, setResumesCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [contactedCount, setContactedCount] = useState(0);
  const [recentCandidates, setRecentCandidates] = useState<Candidate[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobs, candidates, resumes] = await Promise.all([
          jobService.getJobs(),
          candidateService.getCandidates(),
          resumeService.getResumes()
        ]);
        
        setJobsCount(jobs.length);
        setCandidatesCount(candidates.length);
        setResumesCount(resumes.length);
        
        setShortlistedCount(candidates.filter(c => c.status === 'shortlisted').length);
        setContactedCount(candidates.filter(c => c.status === 'contacted').length);
        
        // Get 5 most recent candidates
        const sortedCandidates = [...candidates].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentCandidates(sortedCandidates.slice(0, 5));
        
        // Get 5 most recent jobs
        const sortedJobs = [...jobs].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentJobs(sortedJobs.slice(0, 5));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const matchDistributionData = [
    { range: '90-100%', count: 2 },
    { range: '80-89%', count: 3 },
    { range: '70-79%', count: 1 },
    { range: '60-69%', count: 0 },
    { range: '< 60%', count: 0 }
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'shortlisted':
        return <Badge className="bg-success-500">Shortlisted</Badge>;
      case 'contacted':
        return <Badge className="bg-brand-500">Contacted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Stats overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Job Descriptions</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobsCount}</div>
              <p className="text-xs text-muted-foreground">
                {jobsCount > 0 ? `${(jobsCount - 1) / jobsCount * 100}% processed` : '0% processed'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidatesCount}</div>
              <p className="text-xs text-muted-foreground">
                {shortlistedCount} shortlisted
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resumes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumesCount}</div>
              <p className="text-xs text-muted-foreground">
                {resumesCount > 0 ? `${(resumesCount - 1) / resumesCount * 100}% processed` : '0% processed'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Contact Rate</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidatesCount > 0 ? `${Math.round((contactedCount / candidatesCount) * 100)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {contactedCount} candidates contacted
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Match Distribution Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Match Distribution</CardTitle>
              <CardDescription>
                Candidate match scores distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Sarah Johnson shortlisted</p>
                    <p className="text-sm text-muted-foreground">
                      For Frontend Developer at TechCorp
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    2h ago
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
                    <Mail className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Interview invitation sent</p>
                    <p className="text-sm text-muted-foreground">
                      To John Smith for Frontend Developer
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    5h ago
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <FileText className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">New job description added</p>
                    <p className="text-sm text-muted-foreground">
                      DevOps Engineer at CloudSystems
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    8h ago
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <AlertCircle className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Candidate rejected</p>
                    <p className="text-sm text-muted-foreground">
                      Emily Chen - Match score too low (65%)
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    12h ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="candidates">
          <TabsList className="mb-4">
            <TabsTrigger value="candidates">Recent Candidates</TabsTrigger>
            <TabsTrigger value="jobs">Recent Job Descriptions</TabsTrigger>
          </TabsList>
          <TabsContent value="candidates">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted">
                <div className="col-span-3">Name</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-2">Match Score</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Added</div>
              </div>
              <div className="divide-y">
                {recentCandidates.map((candidate) => (
                  <div key={candidate.id} className="grid grid-cols-12 p-4 items-center">
                    <div className="col-span-3 font-medium">{candidate.name}</div>
                    <div className="col-span-4 text-muted-foreground">{candidate.email}</div>
                    <div className="col-span-2">
                      {candidate.matchScore ? (
                        <div className="flex items-center gap-2">
                          <span>{candidate.matchScore}%</span>
                          <Progress value={candidate.matchScore} className="h-2 w-16" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not evaluated</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={candidate.status} />
                    </div>
                    <div className="col-span-1 text-muted-foreground text-sm">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="jobs">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted">
                <div className="col-span-4">Title</div>
                <div className="col-span-3">Company</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Added</div>
              </div>
              <div className="divide-y">
                {recentJobs.map((job) => (
                  <div key={job.id} className="grid grid-cols-12 p-4 items-center">
                    <div className="col-span-4 font-medium">{job.title}</div>
                    <div className="col-span-3 text-muted-foreground">{job.company}</div>
                    <div className="col-span-2 text-muted-foreground">{job.location}</div>
                    <div className="col-span-2">
                      <Badge
                        variant={job.status === 'processed' ? 'default' : 'outline'}
                      >
                        {job.status === 'processed' ? 'Processed' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-muted-foreground text-sm">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
