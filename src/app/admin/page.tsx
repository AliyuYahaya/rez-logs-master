'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  UserData, 
  getPendingApplications, 
  processRequest,
  getComplaints,
  getSleepoverRequests,
  getMaintenanceRequests,
  Complaint,
  SleepoverRequest,
  MaintenanceRequest
} from '../../lib/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle, Calendar, Wrench, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { LatestRequests } from '@/components/admin/LatestRequests';
import { Analytics } from "@/components/admin/Analytics"

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingApplications, setPendingApplications] = useState<UserData[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [sleepoverRequests, setSleepoverRequests] = useState<SleepoverRequest[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applications, complaintsData, sleepoverData, maintenanceData] = await Promise.all([
          getPendingApplications(),
          getComplaints(),
          getSleepoverRequests(),
          getMaintenanceRequests()
        ]);
        
        setPendingApplications(applications);
        setComplaints(complaintsData);
        setSleepoverRequests(sleepoverData);
        setMaintenanceRequests(maintenanceData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProcessApplication = async (
    userId: string,
    status: 'accepted' | 'denied',
    message: string
  ) => {
    try {
      await processRequest(userId, status, message, user?.uid || '');
      setPendingApplications(prev => prev.filter(app => app.id !== userId));
    } catch (err) {
      setError('Failed to process application');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const applicationsPending = pendingApplications.length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const pendingSleepovers = sleepoverRequests.filter(r => r.status === 'pending').length;
  const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
        <p className="text-white">Manage applications, complaints, and requests.</p>
      </div>

      <Analytics />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Applications
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsPending}</div>
            <p className="text-xs text-muted-foreground">
              New student applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Complaints
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingComplaints}</div>
            <p className="text-xs text-muted-foreground">
              {complaints.length} total complaints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Sleepovers
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSleepovers}</div>
            <p className="text-xs text-muted-foreground">
              {sleepoverRequests.length} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Maintenance Tasks
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              {maintenanceRequests.length} total tasks
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Latest Requests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Latest Requests</h2>
        <LatestRequests
          pendingApplications={pendingApplications}
          complaints={complaints}
          sleepoverRequests={sleepoverRequests}
          maintenanceRequests={maintenanceRequests}
        />
      </div>

      {/* Latest Content Tabs */}
      <Tabs defaultValue="sleepover" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sleepover">Sleepover Requests</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="sleepover" className="space-y-4">
          {/* <SleepoverManagement /> */}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          {/* <AnnouncementManagement /> */}
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          {/* <ComplaintManagement /> */}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {/* <UserManagement /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}