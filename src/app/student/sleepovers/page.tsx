'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, RefreshCw } from 'lucide-react';
import { SleepoverRequestForm } from '@/components/forms/SleepoverRequestForm';
import { useAuth } from '@/context/AuthContext';
import { getSleepoverRequests, type SleepoverRequest } from '@/lib/firestore';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function SleepoversPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SleepoverRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      const allRequests = await getSleepoverRequests();
      const userRequests = allRequests.filter(req => req.userId === user.uid);
      setRequests(userRequests);
    } catch (error) {
      console.error('Error fetching sleepover requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleSuccess = () => {
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sleepover Requests</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchRequests}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className='flex flex-col md:flex-row w-full  gap-5'>
        <Card className='w-full md:w-[50%]'>
          <CardHeader className='flex flex-row items-center'>
            <Moon className='h-6 w-6'/>
            <div className='flex flex-col'>
              <CardTitle className='text-2xl font-bold'>Request a sleepover</CardTitle>
              <p className='text-sm text-gray-500'>Track the status of your sleepover requests</p>
            </div>
          </CardHeader>
          <CardContent>
            <SleepoverRequestForm
              userId={user?.uid || ''}
              onSuccess={handleSuccess}
              
            />
          </CardContent>
        </Card>
        <Card className='w-full md:w-[50%]'>
          <CardHeader className='flex flex-row items-center'>
            <Moon className='h-6 w-6'/>
            <div className='flex flex-col'>
            <CardTitle className='text-2xl font-bold'>Your Sleepover Requests</CardTitle>
            <p className='text-sm text-gray-500'>Track the status of your sleepover requests</p>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="text-muted-foreground">No sleepover requests found.</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{request.guestName}</p>
                      <p className="text-sm text-muted-foreground">{request.guestPhone}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'rejected' ? 'destructive' :
                          request.status === 'cancelled' ? 'outline' :
                          request.status === 'completed' ? 'default' :
                          'destructive'
                        }>
                          {request.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(request.startDate, 'MMM d')} - {format(request.endDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(request.createdAt, 'MMM d, yyyy')}
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