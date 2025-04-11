import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, FileText, Users, Check, Mail, AlertCircle } from 'lucide-react';
import { candidateService, jobService, resumeService } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'new' | 'contacted' | 'shortlisted' | 'rejected';
  matchScore?: number;
  createdAt: string;
}

interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'open' | 'closed' | 'processing';
  createdAt: string;
}

interface Resume {
  id: string;
}

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
        const [jobsResponse, candidatesResponse, resumesResponse] = await Promise.all([
          jobService.getJobs(),
          candidateService.getCandidates(),
          resumeService.getResumes()
        ]);
        
        const jobs = Array.isArray(jobsResponse) ? jobsResponse : [];
        const candidates = Array.isArray(candidatesResponse) ? candidatesResponse : [];
        const resumes = Array.isArray(resumesResponse) ? resumesResponse : [];
        
        setJobsCount(jobs.length);
        setCandidatesCount(candidates.length);
        setResumesCount(resumes.length);
        setShortlistedCount(candidates.filter(c => c.status === 'shortlisted').length);
        setContactedCount(candidates.filter(c => c.status === 'contacted').length);
        
        const sortedCandidates = [...candidates].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentCandidates(sortedCandidates.slice(0, 5));
        
        const sortedJobs = [...jobs].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentJobs(sortedJobs.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setJobsCount(0);
        setCandidatesCount(0);
        setResumesCount(0);
        setShortlistedCount(0);
        setContactedCount(0);
        setRecentCandidates([]);
        setRecentJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const matchDistributionData = [
    { range: '90-100%', count: recentCandidates.filter(c => c.matchScore && c.matchScore >= 90).length },
    { range: '80-89%', count: recentCandidates.filter(c => c.matchScore && c.matchScore >= 80 && c.matchScore < 90).length },
    { range: '70-79%', count: recentCandidates.filter(c => c.matchScore && c.matchScore >= 70 && c.matchScore < 80).length },
    { range: '60-69%', count: recentCandidates.filter(c => c.matchScore && c.matchScore >= 60 && c.matchScore < 70).length },
    { range: '< 60%', count: recentCandidates.filter(c => c.matchScore && c.matchScore < 60).length }
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'shortlisted':
        return <Badge className="bg-green-500">Shortlisted</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-500">Contacted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Job Descriptions" 
            value={jobsCount} 
            icon={<Briefcase className="h-4 w-4" />}
            description={`${shortlistedCount} shortlisted`}
          />
          <StatsCard 
            title="Candidates" 
            value={candidatesCount} 
            icon={<Users className="h-4 w-4" />}
            description={`${contactedCount} contacted`}
          />
          <StatsCard 
            title="Resumes" 
            value={resumesCount} 
            icon={<FileText className="h-4 w-4" />}
            description={`${Math.round((resumesCount / candidatesCount) * 100)}% coverage`}
          />
          <StatsCard 
            title="Contact Rate" 
            value={`${candidatesCount > 0 ? Math.round((contactedCount / candidatesCount) * 100) : 0}%`} 
            icon={<Mail className="h-4 w-4" />}
            description={`${contactedCount} candidates`}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Match Distribution Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Match Distribution</CardTitle>
              <CardDescription>Candidate match scores</CardDescription>
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

          <RecentActivityCard recentCandidates={recentCandidates} recentJobs={recentJobs} />
        </div>

        {/* Recent Candidates/Jobs Tabs */}
        <Tabs defaultValue="candidates">
          <TabsList>
            <TabsTrigger value="candidates">Recent Candidates</TabsTrigger>
            <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="candidates">
            <RecentTable 
              data={recentCandidates}
              columns={[
                { header: 'Name', accessor: 'name', span: 3 },
                { header: 'Email', accessor: 'email', span: 4 },
                { 
                  header: 'Match Score', 
                  span: 2,
                  render: (candidate) => (
                    candidate.matchScore ? (
                      <div className="flex items-center gap-2">
                        <span>{candidate.matchScore}%</span>
                        <Progress value={candidate.matchScore} className="h-2 w-16" />
                      </div>
                    ) : 'Not evaluated'
                  )
                },
                { 
                  header: 'Status', 
                  span: 2,
                  render: (candidate) => <StatusBadge status={candidate.status} />
                },
                { 
                  header: 'Added', 
                  span: 1,
                  render: (candidate) => new Date(candidate.createdAt).toLocaleDateString()
                }
              ]}
            />
          </TabsContent>
          
          <TabsContent value="jobs">
            <RecentTable 
              data={recentJobs}
              columns={[
                { header: 'Title', accessor: 'title', span: 4 },
                { header: 'Company', accessor: 'company', span: 3 },
                { header: 'Location', accessor: 'location', span: 2 },
                { 
                  header: 'Status', 
                  span: 2,
                  render: (job) => (
                    <Badge variant={job.status === 'open' ? 'default' : 'outline'}>
                      {job.status}
                    </Badge>
                  )
                },
                { 
                  header: 'Posted', 
                  span: 1,
                  render: (job) => new Date(job.createdAt).toLocaleDateString()
                }
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Helper Components
const StatsCard = ({ title, value, icon, description }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const RecentActivityCard = ({ 
  recentCandidates, 
  recentJobs 
}: { 
  recentCandidates: Candidate[]; 
  recentJobs: JobDescription[];
}) => {
  const firstCandidate = recentCandidates[0] || { name: 'No candidates yet' };
  const firstJob = recentJobs[0] || { title: 'No jobs yet', company: '' };

  const activities = [
    {
      icon: <Check className="h-5 w-5 text-green-500" />,
      title: `${firstCandidate.name} shortlisted`,
      description: `For ${firstJob.title} at ${firstJob.company}`,
      time: '2h ago'
    },
  ];

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                {activity.icon}
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RecentTable = ({ data, columns }: { 
  data: any[];
  columns: {
    header: string;
    span: number;
    accessor?: string;
    render?: (item: any) => React.ReactNode;
  }[];
}) => (
  <div className="rounded-md border">
    <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted">
      {columns.map((col, i) => (
        <div key={i} className={`col-span-${col.span}`}>{col.header}</div>
      ))}
    </div>
    <div className="divide-y">
      {data.map((item) => (
        <div key={item.id} className="grid grid-cols-12 p-4 items-center">
          {columns.map((col, i) => (
            <div key={i} className={`col-span-${col.span}`}>
              {col.render ? col.render(item) : item[col.accessor!]}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Dashboard;