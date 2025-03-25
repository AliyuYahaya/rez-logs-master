'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import { getAllSleepoverRequests, updateSleepoverStatus } from '@/lib/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RequestActions } from '@/components/admin/RequestActions';
import { RefreshButton } from '@/components/ui/refresh-button';

export default function SleepoversPage() {
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
      toast.success('Sleepover request status updated successfully');
    } catch (error) {
      console.error('Error updating sleepover request status:', error);
      toast.error('Failed to update sleepover request status');
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
          <RefreshButton onClick={fetchSleepoverRequests} loading={loading} />
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
                          Phone: {request.guestPhone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Room: {request.roomNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Period: {format(request.startDate, 'PPP')} - {format(request.endDate, 'PPP')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {request.status}
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
                            Phone: {request.guestPhone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Room: {request.roomNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Period: {format(request.startDate, 'PPP')} - {format(request.endDate, 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">pending</Badge>
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
            <TabsContent value="approved">
              {sleepoverRequests
                .filter((request) => request.status === 'approved')
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
                            Phone: {request.guestPhone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Room: {request.roomNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Period: {format(request.startDate, 'PPP')} - {format(request.endDate, 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>approved</Badge>
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
                            Phone: {request.guestPhone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Room: {request.roomNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Period: {format(request.startDate, 'PPP')} - {format(request.endDate, 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">rejected</Badge>
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