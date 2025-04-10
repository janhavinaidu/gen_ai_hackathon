
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Company info state
  const [companyName, setCompanyName] = useState('Your Company');
  const [companyEmail, setCompanyEmail] = useState('recruiting@yourcompany.com');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  // AI settings state
  const [matchThreshold, setMatchThreshold] = useState(80);
  const [autoShortlist, setAutoShortlist] = useState(true);
  const [autoSendEmails, setAutoSendEmails] = useState(false);

  // Email settings state
  const [smtpServer, setSmtpServer] = useState('smtp.yourcompany.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('recruiting@yourcompany.com');
  const [smtpPassword, setSmtpPassword] = useState('');

  const handleCompanyInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Company Information Updated',
        description: 'Your company information has been saved.'
      });
    }, 1000);
  };

  const handleAISettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'AI Settings Updated',
        description: 'Your AI settings have been saved.'
      });
    }, 1000);
  };

  const handleEmailSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Email Settings Updated',
        description: 'Your email settings have been saved.'
      });
    }, 1000);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCompanyLogo(e.target.files[0]);
    }
  };

  return (
    <Layout title="Settings">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your application settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="company">
          <TabsList>
            <TabsTrigger value="company">Company Information</TabsTrigger>
            <TabsTrigger value="ai">AI Configuration</TabsTrigger>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company" className="mt-6">
            <Card>
              <form onSubmit={handleCompanyInfoSubmit}>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your company details used in the application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyLogo">Company Logo</Label>
                    <Input
                      id="companyLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended size: 200x200 pixels. Max size: 2MB
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai" className="mt-6">
            <Card>
              <form onSubmit={handleAISettingsSubmit}>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>
                    Configure the AI matching and automation settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="matchThreshold">
                      Match Threshold for Shortlisting (%)
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="matchThreshold"
                        type="number"
                        min="50"
                        max="100"
                        value={matchThreshold}
                        onChange={(e) => setMatchThreshold(Number(e.target.value))}
                        className="w-20"
                      />
                      <div className="flex-1">
                        <div className="h-2 relative bg-secondary rounded-full">
                          <div
                            className="absolute inset-y-0 left-0 bg-primary rounded-full"
                            style={{ width: `${matchThreshold}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm w-8">{matchThreshold}%</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Candidates with a match score above this threshold will be eligible for shortlisting.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoShortlist">Automatic Shortlisting</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically shortlist candidates above the threshold.
                      </p>
                    </div>
                    <Switch
                      id="autoShortlist"
                      checked={autoShortlist}
                      onCheckedChange={setAutoShortlist}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoSendEmails">Automatic Email Sending</Label>
                      <p className="text-xs text-muted-foreground">
                        Send interview invitations automatically to shortlisted candidates.
                      </p>
                    </div>
                    <Switch
                      id="autoSendEmails"
                      checked={autoSendEmails}
                      onCheckedChange={setAutoSendEmails}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="email" className="mt-6">
            <Card>
              <form onSubmit={handleEmailSettingsSubmit}>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>
                    Configure your email server settings for sending emails to candidates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input
                      id="smtpServer"
                      value={smtpServer}
                      onChange={(e) => setSmtpServer(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      value={smtpUsername}
                      onChange={(e) => setSmtpUsername(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      toast({
                        title: 'Test Email Sent',
                        description: 'A test email has been sent to your address.'
                      });
                    }}
                  >
                    Send Test Email
                  </Button>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
