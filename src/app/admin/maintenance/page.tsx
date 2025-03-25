'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllMaintenanceRequests, updateMaintenanceStatus, assignStaffToMaintenance } from '@/lib/firestore';
import { RequestActions } from '@/components/admin/RequestActions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { RefreshButton } from '@/components/ui/refresh-button';

export default function MaintenancePage() {
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const requests = await getAllMaintenanceRequests();
      setMaintenanceRequests(requests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      toast.error('Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, adminResponse?: string) => {
    try {
      await updateMaintenanceStatus(id, status as any, adminResponse);
      await fetchMaintenanceRequests();
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      toast.error('Failed to update maintenance status');
    }
  };

  const handleAssignStaff = async (id: string, staffId: string) => {
    try {
      await assignStaffToMaintenance(id, staffId);
      await fetchMaintenanceRequests();
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
      case 'completed':
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
          <CardTitle>Maintenance Requests</CardTitle>
          <RefreshButton onClick={fetchMaintenanceRequests} loading={loading} />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {maintenanceRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{request.roomNumber} {request.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted by {request.userName} on {format(request.createdAt, 'PPP')}
                        </p>
                        <Badge variant="outline" className="mt-1">{request.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <RequestActions
                          type="maintenance"
                          data={request}
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
              {maintenanceRequests
                .filter((request) => request.status === 'pending')
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {request.userName} on {format(request.createdAt, 'PPP')}
                          </p>
                          <Badge variant="outline" className="mt-1">{request.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <RequestActions
                            type="maintenance"
                            data={request}
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
              {maintenanceRequests
                .filter((request) => request.status === 'in_progress')
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {request.userName} on {format(request.createdAt, 'PPP')}
                          </p>
                          <Badge variant="outline" className="mt-1">{request.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <RequestActions
                            type="maintenance"
                            data={request}
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
            <TabsContent value="completed">
              {maintenanceRequests
                .filter((request) => request.status === 'completed')
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {request.userName} on {format(request.createdAt, 'PPP')}
                          </p>
                          <Badge variant="outline" className="mt-1">{request.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <RequestActions
                            type="maintenance"
                            data={request}
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