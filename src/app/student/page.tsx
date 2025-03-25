'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Shield, CreditCard, Moon, UserPlus, Wrench, TriangleAlert, Mail } from 'lucide-react';
import { getMyComplaints, getMyGuestRequests, getMySleepoverRequests, getMyMaintenanceRequests, getAnnouncements } from '@/lib/firestore';

export default function DashboardPage() {
  const { userData } = useAuth();
  const [myComplaintsCount, setMyComplaintsCount] = useState(0);
  const [isComplaintsZero, setIsComplaintsZero] = useState(false);
  const [myGuestRequestsCount, setMyGuestRequestsCount] = useState(0);
  const [isGuestRequestsZero, setIsGuestRequestsZero] = useState(false);
  const [mySleepoverRequestsCount, setMySleepoverRequestsCount] = useState(0);
  const [isSleepoverRequestsZero, setIsSleepoverRequestsZero] = useState(false);
  const [myMaintenanceRequestsCount, setMyMaintenanceRequestsCount] = useState(0);
  const [isMaintenanceRequestsZero, setIsMaintenanceRequestsZero] = useState(false);
  const [announcements, setAnnouncements] = useState<{ createdAt: any; id: string; title: string; content: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      if (userData.id) {
        getMyComplaints(userData.id).then(complaints => {
          setMyComplaintsCount(complaints.length);
        });
        getMyGuestRequests(userData.id).then(guestRequests => {
          setMyGuestRequestsCount(guestRequests.length);
        });
        getMySleepoverRequests(userData.id).then(sleepoverRequests => {
          setMySleepoverRequestsCount(sleepoverRequests.length);
        });
        getMyMaintenanceRequests(userData.id).then(maintenanceRequests => {
          setMyMaintenanceRequestsCount(maintenanceRequests.length);
        });
      }

      getAnnouncements().then(announcements => {
        setAnnouncements(announcements);
        setIsLoading(false);
      });
    }

    if (myComplaintsCount === 0) {
      setIsComplaintsZero(true);
    }

    if (myGuestRequestsCount === 0) {
      setIsGuestRequestsZero(true);
    }

    if (mySleepoverRequestsCount === 0) {
      setIsSleepoverRequestsZero(true);
    }

    if (myMaintenanceRequestsCount === 0) {
      setIsMaintenanceRequestsZero(true);
    }
  }, [userData]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Welcome back, {userData.full_name}</CardTitle>
              <CardDescription>
                Room {userData.room_number} | Tenant Code: {userData.tenant_code}
              </CardDescription>
            </div>
            <Badge variant={userData.role === 'admin' ? "default" : "secondary"}>
              {userData.role === 'admin' ? 'Admin' : 'Student'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-l text-black font-medium">
              Active Guests
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground " color="#007027" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myGuestRequestsCount}</div>
            {isGuestRequestsZero ? (
              <p className="text-xs text-muted-foreground">
                No active guests
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {myComplaintsCount} in progress
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-l text-black  font-medium">
              Pending Sleepovers
            </CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" color='#520070' />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mySleepoverRequestsCount}</div>
            {isSleepoverRequestsZero ? (
              <p className="text-xs text-muted-foreground">
                No sleepover requests pending 
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {myGuestRequestsCount} sleepover requests pending approval
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-l text-black  font-medium">
              Maintenance Requests
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" color='#FFA500' />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myMaintenanceRequestsCount}</div>
            {isMaintenanceRequestsZero ? (
              <p className="text-xs text-muted-foreground">
                No maintenance requests
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {myMaintenanceRequestsCount} in progress
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-l text-black  font-medium">
              Complaints
            </CardTitle>
            <TriangleAlert className="h-4 w-4 text-muted-foreground" color='#FF0000' />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myComplaintsCount}</div>
            {isComplaintsZero ? (
              <p className="text-xs text-muted-foreground">
                No complaints
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {myComplaintsCount} in progress
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Announcement and Contact information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="max-h-96 overflow-y-auto">
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>Announcements</CardTitle>
            <p className='font-sm text-gray-500'>Latest updates from Management</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-black pl-4 mb-2">
                  <h3 className="font-medium">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {announcement.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>Contact Information</CardTitle>
            <p className='font-sm text-gray-500'>Important contacts for your student living experience</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className='flex items-center gap-4'>
                <div className='flex items-center bg-gray-200 p-2 rounded-full'>
                  <Building className="h-6 w-6 text-muted-foreground" color='black'/>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Buidling Management</h3>
                  <p className="text-sm text-muted-foreground">   
                    Email:
                    <a href="mailto:obs@mydomainliving.co.za" className="text-primary"> obs@mydomainliving.co.za</a>
                  </p>
                </div>
                
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center bg-gray-200 p-2 rounded-full'>
                  <Shield className="h-6 w-6 text-muted-foreground" color='black'/>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Security and Reception</h3>
                  <p className="text-sm text-muted-foreground">   
                    Email:
                    <a href="mailto:obs@mydomainliving.co.za" className="text-primary"> 087 897 9085</a>
                  </p>
                </div>
                
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center bg-gray-200 p-2 rounded-full'>
                  <CreditCard className="h-6 w-6 text-muted-foreground" color='black'/>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Finance</h3>
                  <p className="text-sm text-muted-foreground">   
                    Email:                    
                    <a href="mailto:carmen@swish.co.za" className="text-primary"> carmen@swish.co.za</a>
                  </p>
                </div>
                
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}