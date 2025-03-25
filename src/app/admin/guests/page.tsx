'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";
import { getAllGuestRequests, updateGuestStatus } from '@/lib/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RequestActions } from '@/components/admin/RequestActions';
import { RefreshButton } from '@/components/ui/refresh-button';

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  if (date.toDate) {
    // Handle Firestore Timestamp
    return format(date.toDate(), 'PPP');
  }
  // Handle regular Date object
  return format(new Date(date), 'PPP');
};

export default function GuestsPage() {
  const [guestRequests, setGuestRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuestRequests();
  }, []);

  const fetchGuestRequests = async () => {
    try {
      setLoading(true);
      const requests = await getAllGuestRequests();
      setGuestRequests(requests);
    } catch (error) {
      console.error('Error fetching guest requests:', error);
      toast.error('Failed to fetch guest requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, adminResponse?: string) => {
    try {
      await updateGuestStatus(id, status as any, adminResponse);
      await fetchGuestRequests();
      toast.success('Guest status updated successfully');
    } catch (error) {
      console.error('Error updating guest status:', error);
      toast.error('Failed to update guest status');
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
          <CardTitle>Guest Sign-In Requests</CardTitle>
          <RefreshButton onClick={fetchGuestRequests} loading={loading} />
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
              {guestRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">Guest Sign-In Request</h3>
                        <p className="text-sm text-muted-foreground">
                          Guest: {request.firstName} {request.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Phone: {request.phoneNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Room: {request.roomNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Purpose: {request.purpose}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {formatDate(request.fromDate)}
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
                          type="guest"
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
              {guestRequests
                .filter((request) => request.status === 'pending')
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">Guest Sign-In Request</h3>
                          <p className="text-sm text-muted-foreground">
                            Guest: {request.firstName} {request.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {request.phoneNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Room: {request.roomNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Purpose: {request.purpose}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Date: {formatDate(request.fromDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">pending</Badge>
                          <RequestActions
                            type="guest"
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
              {guestRequests
                .filter((request) => request.status === 'approved')
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">Guest Sign-In Request</h3>
                          <p className="text-sm text-muted-foreground">
                            Guest: {request.firstName} {request.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {request.phoneNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Room: {request.roomNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Purpose: {request.purpose}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Date: {formatDate(request.fromDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>approved</Badge>
                          <RequestActions
                            type="guest"
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
              {guestRequests
                .filter((request) => request.status === 'rejected')
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">Guest Sign-In Request</h3>
                          <p className="text-sm text-muted-foreground">
                            Guest: {request.firstName} {request.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {request.phoneNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Room: {request.roomNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Purpose: {request.purpose}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Date: {formatDate(request.fromDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">rejected</Badge>
                          <RequestActions
                            type="guest"
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