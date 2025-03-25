'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllComplaints, updateComplaintStatus, assignStaffToComplaint } from '@/lib/firestore';
import { RequestActions } from '@/components/admin/RequestActions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { RefreshButton } from '@/components/ui/refresh-button';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const complaintsData = await getAllComplaints();
      setComplaints(complaintsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, adminResponse?: string) => {
    try {
      await updateComplaintStatus(id, status as 'pending' | 'in_progress' | 'resolved' | 'rejected', adminResponse);
      await fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const handleAssignStaff = async (id: string, staffId: string) => {
    try {
      await assignStaffToComplaint(id, staffId);
      await fetchComplaints();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error('Failed to assign staff');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Complaints Management</CardTitle>
          <RefreshButton onClick={fetchComplaints} loading={loading} />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Complaints</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{complaint.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted by {complaint.userName} on {format(complaint.createdAt, 'PPP')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                        <RequestActions
                          type="complaint"
                          data={complaint}
                          onStatusUpdate={handleStatusUpdate}
                          onAssignStaff={handleAssignStaff}
                          staffList={staffList}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="pending">
              {complaints
                .filter((complaint) => complaint.status === 'pending')
                .map((complaint) => (
                  <Card key={complaint.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{complaint.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {complaint.userName} on {format(complaint.createdAt, 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                          <RequestActions
                            type="complaint"
                            data={complaint}
                            onStatusUpdate={handleStatusUpdate}
                            onAssignStaff={handleAssignStaff}
                            staffList={staffList}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
            <TabsContent value="in_progress">
              {complaints
                .filter((complaint) => complaint.status === 'in_progress')
                .map((complaint) => (
                  <Card key={complaint.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{complaint.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {complaint.userName} on {format(complaint.createdAt, 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                          <RequestActions
                            type="complaint"
                            data={complaint}
                            onStatusUpdate={handleStatusUpdate}
                            onAssignStaff={handleAssignStaff}
                            staffList={staffList}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
            <TabsContent value="resolved">
              {complaints
                .filter((complaint) => complaint.status === 'resolved')
                .map((complaint) => (
                  <Card key={complaint.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{complaint.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {complaint.userName} on {format(complaint.createdAt, 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                          <RequestActions
                            type="complaint"
                            data={complaint}
                            onStatusUpdate={handleStatusUpdate}
                            onAssignStaff={handleAssignStaff}
                            staffList={staffList}
                          />
                        </div>
          </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 

function modifyComplaintStatus(id: string, status: string, adminResponse: string | undefined) {
  throw new Error('Function not implemented.');
}
