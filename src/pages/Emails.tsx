
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { emailService, candidateService, EmailTemplate, Candidate } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlusCircle,
  Mail,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  Loader2,
  Send,
  Users,
  Calendar,
  Clock,
  MapPin,
  LayoutTemplate
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmailsPage = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Template form state
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  // Email sending form state
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewFormat, setInterviewFormat] = useState('via video call');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [recruiterName, setRecruiterName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesData, candidatesData] = await Promise.all([
        emailService.getEmailTemplates(),
        candidateService.getCandidates()
      ]);
      setTemplates(templatesData);
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

  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
    setIsTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleCopyTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(null);
    setTemplateName(`${template.name} (Copy)`);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setIsTemplateDialogOpen(true);
  };

  const handleSendEmail = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    const shortlistedCandidates = candidates.filter(c => c.status === 'shortlisted');
    setSelectedCandidateId(shortlistedCandidates.length > 0 ? shortlistedCandidates[0].id : '');
    setInterviewDate('');
    setInterviewTime('');
    setInterviewFormat('via video call');
    setPosition('');
    setCompany('Your Company');
    setRecruiterName('Your Name');
    setIsSendEmailDialogOpen(true);
  };

  const submitTemplateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || !templateSubject || !templateBody) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedTemplate) {
        // Update existing template
        const updatedTemplate = await emailService.updateEmailTemplate(selectedTemplate.id, {
          name: templateName,
          subject: templateSubject,
          body: templateBody
        });
        setTemplates(templates.map(t => (t.id === selectedTemplate.id ? updatedTemplate : t)));
      } else {
        // Create new template
        const newTemplate = await emailService.createEmailTemplate({
          name: templateName,
          subject: templateSubject,
          body: templateBody
        });
        setTemplates([newTemplate, ...templates]);
      }
      setIsTemplateDialogOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving template',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsSubmitting(true);
      await emailService.deleteEmailTemplate(selectedTemplate.id);
      setTemplates(templates.filter(t => t.id !== selectedTemplate.id));
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Template Deleted',
        description: 'The email template has been removed.'
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting template',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedCandidateId || !interviewDate || !interviewTime || !position || !company || !recruiterName) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const variables = {
        candidateName: candidates.find(c => c.id === selectedCandidateId)?.name || '',
        position,
        company,
        interviewDate,
        interviewTime,
        interviewFormat,
        recruiterName
      };
      
      await emailService.sendEmail(selectedCandidateId, selectedTemplate.id, variables);
      setIsSendEmailDialogOpen(false);
      
      // Refresh candidates to get updated status
      const candidatesData = await candidateService.getCandidates();
      setCandidates(candidatesData);
      
      toast({
        title: 'Email Sent',
        description: 'The interview invitation has been sent to the candidate.'
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        variant: 'destructive',
        title: 'Error sending email',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTemplateList = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (templates.length === 0) {
      return (
        <div className="text-center py-10">
          <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No email templates found</h3>
          <p className="mt-2 text-muted-foreground">
            Create a new template to get started.
          </p>
          <Button onClick={handleAddTemplate} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Email Template
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription className="truncate">{template.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground line-clamp-3">
                {template.body.replace(/{{.*?}}/g, '[Variable]')}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-xs text-muted-foreground">
                Created {new Date(template.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSendEmail(template)}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyTemplate(template)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderShortlistedCandidates = () => {
    const shortlisted = candidates.filter(c => c.status === 'shortlisted');
    
    if (shortlisted.length === 0) {
      return (
        <div className="text-center py-10">
          <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No shortlisted candidates</h3>
          <p className="mt-2 text-muted-foreground">
            Shortlist candidates from the Candidates page first.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {shortlisted.map((candidate) => (
          <Card key={candidate.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>{candidate.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    if (templates.length > 0) {
                      setSelectedTemplate(templates[0]);
                      setSelectedCandidateId(candidate.id);
                      setInterviewDate('');
                      setInterviewTime('');
                      setInterviewFormat('via video call');
                      setPosition('');
                      setCompany('Your Company');
                      setRecruiterName('Your Name');
                      setIsSendEmailDialogOpen(true);
                    } else {
                      toast({
                        variant: 'destructive',
                        title: 'No Templates Available',
                        description: 'Please create an email template first.'
                      });
                    }
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Interview Invite
                </Button>
              </div>
              <CardDescription className="flex flex-col gap-1">
                <span>{candidate.email}</span>
                <span>{candidate.phone}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span>Match Score:</span>
                <span className="font-medium text-success-600">{candidate.matchScore}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Emails">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Email Management</h2>
            <p className="text-muted-foreground mt-1">
              Create email templates and send interview invitations to candidates.
            </p>
          </div>
          <Button onClick={handleAddTemplate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        <Tabs defaultValue="templates">
          <TabsList>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted Candidates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="mt-6">
            {renderTemplateList()}
          </TabsContent>
          
          <TabsContent value="shortlisted" className="mt-6">
            {renderShortlistedCandidates()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Email Template' : 'Create Email Template'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? 'Make changes to your email template.'
                : 'Create a new email template for sending to candidates.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitTemplateForm}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Interview Invitation"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="templateSubject">Email Subject</Label>
                <Input
                  id="templateSubject"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="e.g. Interview Invitation for {{position}} at {{company}}"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="templateBody">Email Body</Label>
                  <div className="text-xs text-muted-foreground">
                    Available variables:
                    <span className="font-mono ml-1">
                      candidateName, position, company, interviewDate, interviewTime, interviewFormat, recruiterName
                    </span>
                  </div>
                </div>
                <Textarea
                  id="templateBody"
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Enter your email body here..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTemplateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Email Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
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
              onClick={confirmDeleteTemplate}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={isSendEmailDialogOpen} onOpenChange={setIsSendEmailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Interview Invitation</DialogTitle>
            <DialogDescription>
              Fill in the details to send an interview invitation to the candidate.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSendEmail}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="candidate">Candidate</Label>
                  <select
                    id="candidate"
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select a candidate</option>
                    {candidates
                      .filter(c => c.status === 'shortlisted' || c.status === 'new')
                      .map(candidate => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Input
                    id="template"
                    value={selectedTemplate?.name || ''}
                    disabled
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company Name</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. TechCorp"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="interviewDate">Interview Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="interviewDate"
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interviewTime">Interview Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="interviewTime"
                      type="time"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interviewFormat">Interview Format</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <select
                    id="interviewFormat"
                    value={interviewFormat}
                    onChange={(e) => setInterviewFormat(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="via video call">Video Call</option>
                    <option value="via phone call">Phone Call</option>
                    <option value="in person at our office">In Person</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recruiterName">Your Name</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="recruiterName"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSendEmailDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Interview Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EmailsPage;
