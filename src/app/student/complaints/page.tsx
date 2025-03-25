'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from 'lucide-react';
import { ComplaintForm } from '@/components/forms/ComplaintForm';
import { useAuth } from '@/context/AuthContext';
import { getComplaints, type Complaint } from '@/lib/firestore';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PolicySection } from '@/components/PolicySection';
import { ThankYouMessage } from '@/components/ThankYouMessage';
import { toast } from 'react-hot-toast';
import { createComplaint } from '@/lib/firestore';

interface FormData {
  category: 'maintenance' | 'security' | 'noise' | 'cleanliness' | 'other';
  title: string;
  description: string;
  location: string;
}

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    category: 'maintenance',
    title: '',
    description: '',
    location: '',
  });
  const [showThankYou, setShowThankYou] = useState(false);

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const allComplaints = await getComplaints();
      const userComplaints = allComplaints.filter(complaint => complaint.userId === user.uid);
      setComplaints(userComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleSuccess = () => {
    setShowForm(false);
    fetchComplaints();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createComplaint({
        userId: user?.uid || '',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        status: 'pending'
      });
      setShowThankYou(true);
      setFormData({
        category: 'maintenance',
        title: '',
        description: '',
        location: ''
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint');
    }
  };

  return (
    <div className="container mx-auto p-4 w-full flex flex-col gap-5 md:flex-row">
      {showThankYou ? (
        <ThankYouMessage
          title="Complaint Submitted Successfully"
          message="Thank you for submitting your complaint. We will review it and get back to you soon."
          onClose={() => setShowThankYou(false)}
        />
      ) : (
        <Card className='w-full md:w-[50%]'>
          <CardHeader className='flex flex-row items-center'>
            <TriangleAlert className='h-6 w-6'/>
            <div className='flex flex-col'>
              <CardTitle className='text-2xl font-bold'>New Complaint</CardTitle>
              <p className='text-sm text-gray-500'>Submit a new complaint</p>
            </div>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Submit a Complaint</CardTitle>
                <CardDescription>Fill out the form below to submit your complaint</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as Complaint['category'] })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="noise">Noise</SelectItem>
                        <SelectItem value="cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief description of your complaint"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description of your complaint"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Where did this occur?"
                    />
                  </div>

                  <PolicySection
                    title="Complaint Policy"
                    items={[
                      'All complaints are treated with confidentiality',
                      'Response time may vary based on the severity of the issue',
                      'False or malicious complaints may result in disciplinary action',
                      'Updates on your complaint status will be provided through the dashboard'
                    ]}
                  />

                  <Button type="submit" className="w-full">
                    Submit Complaint
                  </Button>
                </form>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
      
      <div className='flex flex-col md:flex-row w-full md:w-[50%] gap-5'>
        <Card className='w-full'>
          <CardHeader className='flex flex-row items-center'>
            <TriangleAlert className='h-6 w-6'/>
            <div className='flex flex-col'>
              <CardTitle className='text-2xl font-bold'>Your Complaints</CardTitle>
              <p className='text-sm text-gray-500'>Track the status of your complaints</p>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading complaints...</p>
            ) : complaints.length === 0 ? (
              <p className="text-muted-foreground">No complaints found.</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{complaint.title}</p>
                      <p className="text-sm text-muted-foreground">{complaint.description}</p>
                      <Badge variant={
                        complaint.status === 'resolved' ? 'default' :
                        complaint.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }>
                        {complaint.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(complaint.createdAt, 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 