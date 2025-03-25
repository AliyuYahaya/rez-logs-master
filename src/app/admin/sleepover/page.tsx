'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllSleepoverRequests, updateSleepoverStatus } from '@/lib/firestore';
import { RequestActions } from '@/components/admin/RequestActions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function SleepoverPage() {
  const [sleepoverRequests, setSleepoverRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSleepoverRequests();
  }, []);

  const fetchSleepoverRequests = async () => {
    try {
      setLoading(true);
      const requests = await getAllSleepoverRequests();
      setSleepoverRequests(requests);
    } catch (error) {
      console.error('Error fetching sleepover requests:', error);
      toast.error('Failed to fetch sleepover requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, adminResponse?: string) => {
    try {
      await updateSleepoverStatus(id, status as any, adminResponse);
      await fetchSleepoverRequests();
    } catch (error) {
      console.error('Error updating sleepover status:', error);
      toast.error('Failed to update sleepover status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'in_progress':
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
          <CardTitle>Sleepover Requests</CardTitle>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchSleepoverRequests}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {sleepoverRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">Sleepover Request</h3>
                        <p className="text-sm text-muted-foreground">
                          Guest: {request.guestName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Period: {format(request.startDate, 'PPP')} - {format(request.endDate, 'PPP')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted on {format(request.createdAt, 'PPP')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <RequestActions
                          type="sleepover"
                          data={request}
                          onStatusUpdate={handleStatusUpdate}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="pending">
              {sleepoverRequests
                .filter((request) => request.status === 'pending')
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">Sleepover Request</h3>
                          <p className="text-sm text-muted-foreground">
                            Guest: {request.guestName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Period: {format(request.startDate, 'PPP')} - {format(request.endDate, 'PPP')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {format(request.createdAt, 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <RequestActions
                            type="sleepover"
                            data={request}
                            onStatusUpdate={handleStatusUpdate}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
            <TabsContent value={"in_progress"}>
              {sleepoverRequests
                .filter((request) => request.status === 'in_progress')
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">Sleepover Request</h3>
                          <p className="text-sm text-muted-foreground">
                            Guest: {request.guestName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Period: {format(request.startDate, 'PPP')} - {format(request.endDate, 'PPP')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {format(request.createdAt, 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <RequestActions
                            type="sleepover"
                            data={request}
                            onStatusUpdate={handleStatusUpdate}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
            <TabsContent value="rejected">
              {sleepoverRequests
                .filter((request) => request.status === 'rejected')
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">Sleepover Request</h3>
                          <p className="text-sm text-muted-foreground">
                            Guest: {request.guestName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Period: {format(request.startDate, 'PPP')} - {format(request.endDate, 'PPP')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {format(request.createdAt, 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <RequestActions
                            type="sleepover"
                            data={request}
                            onStatusUpdate={handleStatusUpdate}
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