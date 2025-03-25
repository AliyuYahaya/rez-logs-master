import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  arrayUnion,
  Timestamp,
  addDoc,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';
const ADMINS_COLLECTION = 'admins';

export interface AdminData {
  id: string;
  userId: string;
  email: string;
  type: 'superadmin' | 'admin-finance' | 'admin-maintenance' | 'admin-security' | 'admin-complaints' | 'admin-guest-management';
  role: 'admin' | 'superadmin';
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  permissions?: string[];
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  surname: string;
  full_name: string;
  phone?: string;
  role: 'student' | 'newbie';
  createdAt: Date;
  updatedAt: Date;
  applicationStatus?: 'accepted' | 'denied' | 'pending';
  place_of_study: string;
  room_number: string;
  tenant_code: string;
  requestDetails?: {
    accommodationType: string;
    location: string;
    dateSubmitted: Date;
  };
  communicationLog?: {
    message: string;
    sentBy: 'admin' | 'superadmin' | 'student';
    timestamp: Date;
  }[];
}

export interface Complaint {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'maintenance' | 'security' | 'noise' | 'cleanliness' | 'other';
  location?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
}

export interface SleepoverRequest {
  id: string;
  userId: string;
  guestName: string;
  guestPhone: string;
  roomNumber: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
}

export interface MaintenanceRequest {
  id: string;
  userId: string;
  title: string;
  category: 'bedroom' | 'bathroom' | 'kitchen' | 'furniture' | 'other';
  description: string;
  roomNumber: string;
  timeSlot: string;
  preferredDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
}

export interface GuestRegistration {
  id: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  visitDate: string;
  visitTime: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'maintenance' | 'complaint' | 'sleepover' | 'guest' | 'message';
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FirestoreUser {
  id: string;
  name: string;
  surname: string;
  tenant_code: string;
  room_number: string;
  email: string;
  phone?: string;
  role: 'student' | 'admin';
}

interface FirestorePayment {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  type: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const createUser = async (userData: Omit<UserData, 'createdAt' | 'updatedAt' | 'communicationLog'>) => {
  const userRef = doc(db, USERS_COLLECTION, userData.id);
  const now = new Date();
  
  await setDoc(userRef, {
    ...userData,
    createdAt: now,
    updatedAt: now,
    communicationLog: []
  });
};

export const getUserById = async (userId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: userSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      communicationLog: data.communicationLog?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate() || new Date()
      })) || []
    } as UserData;
  }
  return null;
};

export const getAllUsers = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  const usersSnap = await getDocs(usersRef);
  return usersSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      communicationLog: data.communicationLog?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate() || new Date()
      })) || []
    } as UserData;
  });
};

export const getPendingApplications = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  const pendingQuery = query(
    usersRef, 
    where('applicationStatus', '==', 'pending')
  );
  const newbieQuery = query(
    usersRef,
    where('role', '==', 'newbie')
  );

  const [pendingSnap, newbieSnap] = await Promise.all([
    getDocs(pendingQuery),
    getDocs(newbieQuery)
  ]);

  const pendingUsers = pendingSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      communicationLog: data.communicationLog?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate() || new Date()
      })) || []
    } as UserData;
  });

  const newbieUsers = newbieSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      communicationLog: data.communicationLog?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate() || new Date()
      })) || []
    } as UserData;
  });

  // Combine both arrays and remove duplicates based on id
  const allPending = [...pendingUsers, ...newbieUsers];
  const uniquePending = allPending.filter((user, index, self) =>
    index === self.findIndex((u) => u.id === user.id)
  );

  return uniquePending;
};

export const processRequest = async (
  userId: string,
  status: 'accepted' | 'denied',
  message: string,
  adminId: string
) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const now = new Date();

  await updateDoc(userRef, {
    applicationStatus: status,
    updatedAt: now,
    communicationLog: arrayUnion({
      message,
      sentBy: 'admin',
      timestamp: now
    })
  });
};

export const addCommunication = async (
  userId: string,
  message: string,
  sentBy: 'admin' | 'student'
) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const now = new Date();

  await updateDoc(userRef, {
    communicationLog: arrayUnion({
      message,
      sentBy,
      timestamp: Timestamp.fromDate(now)
    })
  });
};

export const updateUser = async (userId: string, updates: Partial<UserData>) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, updates);
};

export const deleteUser = async (userId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(userRef);
};

// Admin functions
export const createAdmin = async (adminData: Omit<AdminData, 'id' | 'createdAt' | 'updatedAt'>) => {
  const adminsRef = collection(db, ADMINS_COLLECTION);
  const now = new Date();
  
  const docRef = await addDoc(adminsRef, {
    ...adminData,
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
};

export const getAdminByUserId = async (userId: string) => {
  const adminsRef = collection(db, ADMINS_COLLECTION);
  const q = query(adminsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    lastLogin: data.lastLogin?.toDate()
  } as AdminData;
};

export const getAllAdmins = async () => {
  const adminsRef = collection(db, ADMINS_COLLECTION);
  const adminsSnap = await getDocs(adminsRef);
  
  return adminsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLogin: data.lastLogin?.toDate()
    } as AdminData;
  });
};

export const updateAdmin = async (adminId: string, updates: Partial<Omit<AdminData, 'id'>>) => {
  const adminRef = doc(db, ADMINS_COLLECTION, adminId);
  const now = new Date();
  
  await updateDoc(adminRef, {
    ...updates,
    updatedAt: now
  });
};

export const deleteAdmin = async (adminId: string) => {
  const adminRef = doc(db, ADMINS_COLLECTION, adminId);
  await deleteDoc(adminRef);
};

export const updateAdminLastLogin = async (adminId: string) => {
  const adminRef = doc(db, ADMINS_COLLECTION, adminId);
  const now = new Date();
  
  await updateDoc(adminRef, {
    lastLogin: now,
    updatedAt: now
  });
};

export const createComplaint = async (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'adminResponse'>) => {
  const complaintsRef = collection(db, 'complaints');
  const now = new Date();
  
  const docRef = await addDoc(complaintsRef, {
    ...complaint,

    adminResponse: '',
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
};

export const createSleepoverRequest = async (request: Omit<SleepoverRequest, 'id' | 'createdAt' | 'updatedAt' | 'adminResponse'>) => {
  const requestsRef = collection(db, 'sleepover_requests');
  const now = new Date();
  
  const docRef = await addDoc(requestsRef, {
    ...request,
    adminResponse: '',
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
};

export const createMaintenanceRequest = async (request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'adminResponse'>) => {
  const requestsRef = collection(db, 'maintenance_requests');
  const now = new Date();
  
  const docRef = await addDoc(requestsRef, {
    ...request,

    adminResponse: '',
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
};

export const getComplaints = async () => {
  const complaintsRef = collection(db, 'complaints');
  const complaintsSnap = await getDocs(complaintsRef);
  return complaintsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }) as Complaint[];
};

export const getSleepoverRequests = async () => {
  const requestsRef = collection(db, 'sleepover_requests');
  const requestsSnap = await getDocs(requestsRef);
  return requestsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || new Date()
    };
  }) as SleepoverRequest[];
};

export const getMaintenanceRequests = async () => {
  const requestsRef = collection(db, 'maintenance_requests');
  const requestsSnap = await getDocs(requestsRef);
  return requestsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }) as MaintenanceRequest[];
};

export const modifyComplaintStatus = async (complaintId: string, status: Complaint['status'], adminResponse?: string) => {
  const complaintRef = doc(db, 'complaints', complaintId);
  await updateDoc(complaintRef, {
    status,
    adminResponse,
    updatedAt: new Date()
  });
};

export const updateSleepoverStatus = async (requestId: string, status: SleepoverRequest['status'], adminResponse?: string) => {
  const requestRef = doc(db, 'sleepover_requests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Sleepover request not found');
  }

  const request = requestSnap.data();
  const now = new Date();

  // Only include adminResponse in the update if it's provided
  const updateData: any = {
    status,
    updatedAt: now
  };

  if (adminResponse !== undefined) {
    updateData.adminResponse = adminResponse;
  }

  await updateDoc(requestRef, updateData);

  // Create notification for the user
  await createNotification({
    userId: request.userId,
    title: 'Sleepover Request Update',
    message: `Your sleepover request for ${request.guestName} has been ${status}`,
    type: 'sleepover',
    read: false
  });
};

export const updateMaintenanceRequestStatus = async (requestId: string, status: MaintenanceRequest['status'], adminResponse?: string) => {
  const requestRef = doc(db, 'maintenance_requests', requestId);
  await updateDoc(requestRef, {
    status,
    adminResponse,
    updatedAt: new Date()
  });
};

export const createGuestRegistration = async (registration: Omit<GuestRegistration, 'id' | 'createdAt' | 'updatedAt' | 'adminResponse'>) => {
  const registrationsRef = collection(db, 'guest_registrations');
  const now = new Date();
  
  const docRef = await addDoc(registrationsRef, {
    ...registration,

    adminResponse: '',
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
};

export const getGuestRegistrations = async (userId: string) => {
  const registrationsRef = collection(db, 'guest_registrations');
  const registrationsQuery = query(registrationsRef, where('userId', '==', userId));
  const registrationsSnap = await getDocs(registrationsQuery);
  return registrationsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }) as GuestRegistration[];
};

export const updateRequestStatus = async (requestId: string, status: string) => {
  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, {
    status
  });
};

export const assignStaffToRequest = async (requestId: string, staffId: string) => {
  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, {
    staffId
  });
};

export async function getAllComplaints() {
  const complaintsRef = collection(db, 'complaints');
  const q = query(complaintsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
}

export const updateComplaintStatus = async (id: string, status: 'pending' | 'in_progress' | 'resolved' | 'rejected', adminResponse?: string) => {
  const complaintRef = doc(db, 'complaints', id);
  const complaintSnap = await getDoc(complaintRef);
  
  if (!complaintSnap.exists()) {
    throw new Error('Complaint not found');
  }

  const complaint = complaintSnap.data();
  const now = new Date();

  // Only include adminResponse in the update if it's provided
  const updateData: any = {
    status,
    updatedAt: now
  };

  if (adminResponse !== undefined) {
    updateData.adminResponse = adminResponse;
  }

  await updateDoc(complaintRef, updateData);

  // Create notification for the user
  await createNotification({
    userId: complaint.userId,
    title: 'Complaint Update',
    message: `Your complaint "${complaint.title}" has been ${status}`,
    type: 'complaint',
    read: false
  });
};

export async function assignStaffToComplaint(complaintId: string, staffId: string) {
  const complaintRef = doc(db, 'complaints', complaintId);
  await updateDoc(complaintRef, {
    assignedStaffId: staffId,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllMaintenanceRequests() {
  const maintenanceRef = collection(db, 'maintenance_requests');
  const q = query(maintenanceRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
}

export const updateMaintenanceStatus = async (id: string, status: 'pending' | 'in_progress' | 'completed' | 'rejected', adminResponse?: string) => {
  const maintenanceRef = doc(db, 'maintenance_requests', id);
  const maintenanceSnap = await getDoc(maintenanceRef);
  
  if (!maintenanceSnap.exists()) {
    throw new Error('Maintenance request not found');
  }

  const maintenance = maintenanceSnap.data();
  const now = new Date();

  // Only include adminResponse in the update if it's provided
  const updateData: any = {
    status,
    updatedAt: now
  };

  if (adminResponse !== undefined) {
    updateData.adminResponse = adminResponse;
  }

  await updateDoc(maintenanceRef, updateData);

  // Create notification for the user
  await createNotification({
    userId: maintenance.userId,
    title: 'Maintenance Request Update',
    message: `Your maintenance request "${maintenance.title}" has been ${status}`,
    type: 'maintenance',
    read: false
  });
};

export async function assignStaffToMaintenance(maintenanceId: string, staffId: string) {
  const maintenanceRef = doc(db, 'maintenance', maintenanceId);
  await updateDoc(maintenanceRef, {
    assignedStaffId: staffId,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllSleepoverRequests() {
  const sleepoverRef = collection(db, 'sleepover_requests');
  const q = query(sleepoverRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    startDate: doc.data().startDate?.toDate() || new Date(),
    endDate: doc.data().endDate?.toDate() || new Date(),
  }));
}

export async function getAllGuestRequests() {
  const guestRef = collection(db, 'guest_registrations');
  const q = query(guestRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
}

export const updateGuestStatus = async (id: string, status: 'pending' | 'approved' | 'rejected', adminResponse?: string) => {
  const guestRef = doc(db, 'guest', id);
  const guestSnap = await getDoc(guestRef);
  
  if (!guestSnap.exists()) {
    throw new Error('Guest request not found');
  }

  const guest = guestSnap.data();
  const now = new Date();

  await updateDoc(guestRef, {
    status,
    adminResponse,
    updatedAt: now
  });

  // Create notification for the user
  await createNotification({
    userId: guest.userId,
    title: 'Guest Registration Update',
    message: `Guest registration for ${guest.guestName} has been ${status}`,
    type: 'guest',
    read: false
  });
};

//student api calls
export async function getAnnouncements() {
  const announcementsRef = collection(db, 'announcements');
  const q = query(announcementsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title,
    content: doc.data().content,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
}

export async function getMyComplaints(userId:string){
  const complaintsRef = collection(db, 'complaints');
  const q = query(complaintsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
  
}

export async function getMySleepoverRequests(userId:string){
  const sleepoverRef = collection(db, 'sleepover');
  const q = query(sleepoverRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    startDate: doc.data().startDate?.toDate() || new Date(),
    endDate: doc.data().endDate?.toDate() || new Date(),
  }));
}

export async function getMyGuestRequests(userId:string){
  const guestRef = collection(db, 'guest');
  const q = query(guestRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
}

export async function getMyMaintenanceRequests(userId:string){
  const maintenanceRef = collection(db, 'maintenance_requests');
  const q = query(maintenanceRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
}

export async function getRequestDetails(requestId: string) {
  // Implement the logic to fetch request details by ID
  // This is a placeholder implementation
  return {
    id: requestId,
    title: 'Sample Request',
    userName: 'John Doe',
    roomNumber: '101',
    description: 'Sample description',
    priority: 'High',
    status: 'pending',
  };
}

export async function setCheckoutCode(code: number) {
  const checkoutRef = doc(collection(db, 'checkout'));
  const now = new Date();
  await setDoc(checkoutRef, {
    code,
    createdAt: now,
  });
}

export async function getCheckoutCode() {
  const checkoutRef = collection(db, 'checkout');
  const querySnapshot = await getDocs(checkoutRef);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      code: doc.data().code.toString(), // Ensure the code is a string
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    };
  }
  return null;
}

export async function updateCheckoutCode(newCode: number) {
  const checkoutRef = collection(db, 'checkout');
  const querySnapshot = await getDocs(checkoutRef);
  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      code: newCode,
      updatedAt: serverTimestamp(),
    });
  }
}

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
  const notificationsRef = collection(db, 'notifications');
  const now = new Date();
  
  const docRef = await addDoc(notificationsRef, {
    ...notification,
    createdAt: now,
    updatedAt: now
  });
  
  return { id: docRef.id, ...notification, createdAt: now, updatedAt: now } as Notification;
};

export const getUserNotifications = async (userId: string) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }) as Notification[];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    read: true,
    updatedAt: new Date()
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      read: true,
      updatedAt: new Date()
    });
  });
  
  await batch.commit();
};

export async function getAnalyticsData(timeRange: "days" | "weeks" | "months") {
  const now = new Date();
  let startDate: Date;
  let dateFormat: string;

  // Calculate start date based on time range
  switch (timeRange) {
    case "days":
      startDate = new Date(now.setDate(now.getDate() - 14));
      dateFormat = "MMM dd";
      break;
    case "weeks":
      startDate = new Date(now.setDate(now.getDate() - 42)); // 6 weeks
      dateFormat = "MMM dd";
      break;
    case "months":
      startDate = new Date(now.setMonth(now.getMonth() - 6));
      dateFormat = "MMM yyyy";
      break;
  }

  // Fetch data from all collections
  const [complaintsSnap, maintenanceSnap, sleepoverSnap, guestSnap] = await Promise.all([
    getDocs(query(collection(db, 'complaints'), where('createdAt', '>=', startDate))),
    getDocs(query(collection(db, 'maintenance_requests'), where('createdAt', '>=', startDate))),
    getDocs(query(collection(db, 'sleepover_requests'), where('createdAt', '>=', startDate))),
    getDocs(query(collection(db, 'guest_registrations'), where('createdAt', '>=', startDate)))
  ]);

  // Create a map to store aggregated data by date
  const dataMap = new Map<string, {
    complaints: number;
    maintenance: number;
    sleepover: number;
    guests: number;
  }>();

  // Initialize all dates in the range with zero counts
  let currentDate = new Date(startDate);
  while (currentDate <= new Date()) {
    const dateKey = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
    dataMap.set(dateKey, { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Aggregate complaints data
  complaintsSnap.docs.forEach(doc => {
    const data = doc.data();
    const date = data.createdAt.toDate();
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
    const current = dataMap.get(dateKey) || { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 };
    dataMap.set(dateKey, { ...current, complaints: current.complaints + 1 });
  });

  // Aggregate maintenance data
  maintenanceSnap.docs.forEach(doc => {
    const data = doc.data();
    const date = data.createdAt.toDate();
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
    const current = dataMap.get(dateKey) || { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 };
    dataMap.set(dateKey, { ...current, maintenance: current.maintenance + 1 });
  });

  // Aggregate sleepover data
  sleepoverSnap.docs.forEach(doc => {
    const data = doc.data();
    const date = data.createdAt.toDate();
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
    const current = dataMap.get(dateKey) || { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 };
    dataMap.set(dateKey, { ...current, sleepover: current.sleepover + 1 });
  });

  // Aggregate guest data
  guestSnap.docs.forEach(doc => {
    const data = doc.data();
    const date = data.createdAt.toDate();
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
    const current = dataMap.get(dateKey) || { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 };
    dataMap.set(dateKey, { ...current, guests: current.guests + 1 });
  });

  // Convert map to array and sort by date
  return Array.from(dataMap.entries())
    .map(([date, counts]) => ({
      date,
      ...counts
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const getUserByTenantCode = async (tenantCode: string): Promise<FirestoreUser> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('tenant_code', '==', tenantCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Student not found');
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as FirestoreUser;
  } catch (error) {
    console.error('Error getting user by tenant code:', error);
    throw error;
  }
};

// Finance-related functions
export const getStudentFinanceData = async (tenantCode: string) => {
  try {
    // First get the user by tenant code
    const user = await getUserByTenantCode(tenantCode);
    if (!user) {
      throw new Error('Student not found');
    }

    // Get payment history
    const paymentsRef = collection(db, 'payments');
    const paymentsQuery = query(
      paymentsRef,
      where('userId', '==', user.id),
      orderBy('date', 'desc')
    );
    const paymentsSnap = await getDocs(paymentsQuery);
    const paymentHistory: FirestorePayment[] = paymentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as FirestorePayment[];

    // Calculate outstanding balance
    const outstandingBalance = paymentHistory.reduce((total, payment) => {
      if (payment.status === 'pending' || payment.status === 'overdue') {
        return total + payment.amount;
      }
      return total;
    }, 0);

    // Get next payment due
    const pendingPayments = paymentHistory.filter(
      payment => payment.status === 'pending'
    );
    const nextPaymentDue = pendingPayments.length > 0
      ? pendingPayments[0].date
      : new Date();

    return {
      fullName: `${user.name || ''} ${user.surname || ''}`.trim(),
      tenantCode: user.tenant_code,
      roomNumber: user.room_number,
      email: user.email,
      phone: user.phone || '',
      paymentHistory,
      outstandingBalance,
      nextPaymentDue
    };
  } catch (error) {
    console.error('Error getting student finance data:', error);
    throw error;
  }
};

export const getStudentFinanceReports = async (userId: string) => {
  try {
    const reportsRef = collection(db, 'financial_reports');
    const reportsQuery = query(
      reportsRef,
      where('userId', '==', userId),
      orderBy('reportDate', 'desc')
    );
    const reportsSnap = await getDocs(reportsQuery);

    return reportsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      reportDate: doc.data().reportDate.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting finance reports:', error);
    throw error;
  }
};

export const createFinanceReport = async (
  userId: string,
  reportData: {
    tenantCode: string;
    reportDate: Date;
    reportContent: string;
  }
) => {
  try {
    const reportsRef = collection(db, 'financial_reports');
    const newReport = {
      userId,
      tenantCode: reportData.tenantCode,
      reportDate: reportData.reportDate,
      reportData: reportData.reportContent,
      createdAt: new Date()
    };

    const docRef = await addDoc(reportsRef, newReport);
    return docRef.id;
  } catch (error) {
    console.error('Error creating finance report:', error);
    throw error;
  }
};

export const recordPayment = async (
  userId: string,
  paymentData: {
    amount: number;
    type: 'rent' | 'deposit' | 'fine' | 'other';
    description: string;
    date: Date;
    status: 'paid' | 'pending' | 'overdue';
  }
) => {
  try {
    const paymentsRef = collection(db, 'payments');
    const newPayment = {
      userId,
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(paymentsRef, newPayment);
    return docRef.id;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};