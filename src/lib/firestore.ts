import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  runTransaction,
  onSnapshot,
  limit as fbLimit,
} from "firebase/firestore";
import { db } from "./firebase";
import { ClientRequest, Professional, RequestStatus, ProfessionalStatus, Booking, BookingStatus, ServiceItem, ScheduleSlot, CancellationPolicy } from "./types";

const requireDb = () => {
  if (!db) throw new Error("Firebase n'est pas configuré. Remplissez les variables d'environnement.");
  return db;
};

// ──────────────────────────────────────────────
// Requests
// ──────────────────────────────────────────────

export const createRequest = async (data: Omit<ClientRequest, "id" | "createdAt" | "status">) => {
  const ref = await addDoc(collection(requireDb(), "requests"), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getRequests = async (): Promise<ClientRequest[]> => {
  const snap = await getDocs(
    query(collection(requireDb(), "requests"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClientRequest));
};

export const getRequestsByEmail = async (email: string): Promise<ClientRequest[]> => {
  const snap = await getDocs(
    query(collection(requireDb(), "requests"), where("email", "==", email), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClientRequest));
};

export const updateRequestStatus = async (id: string, status: RequestStatus) =>
  updateDoc(doc(requireDb(), "requests", id), { status });

export const assignProfessional = async (requestId: string, professionalId: string) =>
  updateDoc(doc(requireDb(), "requests", requestId), {
    assignedProfessionalId: professionalId,
    status: "matched",
  });

// ──────────────────────────────────────────────
// Professionals
// ──────────────────────────────────────────────

export const createProfessional = async (
  data: Omit<Professional, "id" | "createdAt" | "status" | "subscriptionStatus" | "trustLevel">
) => {
  const ref = await addDoc(collection(requireDb(), "professionals"), {
    ...data,
    status: "pending",
    subscriptionStatus: "free",
    trustLevel: "unverified",
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getProfessionals = async (): Promise<Professional[]> => {
  const snap = await getDocs(
    query(collection(requireDb(), "professionals"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Professional));
};

export const getProfessionalByEmail = async (email: string): Promise<Professional | null> => {
  const snap = await getDocs(
    query(collection(requireDb(), "professionals"), where("email", "==", email))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Professional;
};

export const getProfessionalById = async (id: string): Promise<Professional | null> => {
  const snap = await getDoc(doc(requireDb(), "professionals", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Professional;
};

export const updateProfessionalStatus = async (id: string, status: ProfessionalStatus) =>
  updateDoc(doc(requireDb(), "professionals", id), { status });

export type CoverageType = "insurance" | "mutuelle" | "retirement";

export const updateProfessionalServices = async (id: string, services: ServiceItem[]) =>
  updateDoc(doc(requireDb(), "professionals", id), { services });

export const updateProfessionalSchedule = async (id: string, schedule: ScheduleSlot[]) =>
  updateDoc(doc(requireDb(), "professionals", id), { schedule });

export const updateProfessionalAvailability = async (id: string, periods: import("@/lib/types").AvailabilityPeriod[]) =>
  updateDoc(doc(requireDb(), "professionals", id), { availabilityPeriods: periods });

export const updateProfessionalInsurance = async (
  id: string,
  hasInsurance: boolean,
  insuranceCompany?: string,
) => updateDoc(doc(requireDb(), "professionals", id), { hasInsurance, insuranceCompany: insuranceCompany ?? "" });

export const updateCancellationPolicy = async (id: string, policy: CancellationPolicy) =>
  updateDoc(doc(requireDb(), "professionals", id), { cancellationPolicy: policy });

export const markOfferSent = async (id: string, type: CoverageType) => {
  const field =
    type === "insurance" ? "insuranceOfferSent"
    : type === "mutuelle" ? "mutuelleOfferSent"
    : "retirementOfferSent";
  return updateDoc(doc(requireDb(), "professionals", id), { [field]: true });
};

// ──────────────────────────────────────────────
// Invoices
// ──────────────────────────────────────────────

import { Invoice, InvoiceStatus, Review, AppNotification } from "./types";

export const createInvoice = async (data: Omit<Invoice, "id" | "createdAt">) => {
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(requireDb(), "invoices"), {
    ...clean,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getInvoices = async (): Promise<Invoice[]> => {
  const snap = await getDocs(
    query(collection(requireDb(), "invoices"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice));
};

export const getInvoicesByPro = async (professionalId: string): Promise<Invoice[]> => {
  const snap = await getDocs(
    query(collection(requireDb(), "invoices"), where("professionalId", "==", professionalId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice));
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus) =>
  updateDoc(doc(requireDb(), "invoices", id), { status });

export const generateInvoiceNumber = async (): Promise<string> => {
  const db = requireDb();
  const year = new Date().getFullYear();
  const counterRef = doc(db, "counters", `invoices_${year}`);

  const newCount = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const next = snap.exists() ? (snap.data().count as number) + 1 : 1;
    tx.set(counterRef, { count: next }, { merge: true });
    return next;
  });

  return `GETAXE-${year}-${String(newCount).padStart(3, "0")}`;
};

export const formatDate = (ts: Timestamp | Date | undefined): string => {
  if (!ts) return "—";
  const date = ts instanceof Timestamp ? ts.toDate() : ts;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ──────────────────────────────────────────────
// Reviews
// ──────────────────────────────────────────────

export async function createReview(
  review: Omit<Review, "id" | "approved" | "createdAt">
): Promise<string> {
  const db = requireDb();
  const ref = await addDoc(collection(db, "reviews"), {
    ...review,
    approved: false,
    createdAt: new Date(),
  });
  return ref.id;
}

export async function getReviewsByPro(proId: string): Promise<Review[]> {
  const db = requireDb();
  const q = query(
    collection(db, "reviews"),
    where("proId", "==", proId),
    where("approved", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

export async function getPendingReviews(): Promise<Review[]> {
  const db = requireDb();
  const q = query(collection(db, "reviews"), where("approved", "==", false));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

export async function approveReview(reviewId: string): Promise<void> {
  const db = requireDb();
  const reviewRef = doc(db, "reviews", reviewId);
  const reviewSnap = await getDoc(reviewRef);
  await updateDoc(reviewRef, { approved: true });

  if (reviewSnap.exists()) {
    const proId = reviewSnap.data().proId as string;
    const q = query(
      collection(db, "reviews"),
      where("proId", "==", proId),
      where("approved", "==", true)
    );
    const snap = await getDocs(q);
    const ratings = snap.docs.map((d) => (d.data().rating as number));
    const averageRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
        : 0;
    await updateDoc(doc(db, "professionals", proId), {
      averageRating,
      reviewCount: ratings.length,
    });
  }
}

// ──────────────────────────────────────────────
// Bookings (Stripe Connect)
// ──────────────────────────────────────────────

export async function createBooking(
  data: Omit<Booking, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(requireDb(), "bookings"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const snap = await getDoc(doc(requireDb(), "bookings", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Booking;
}

export async function getBookingBySessionId(sessionId: string): Promise<Booking | null> {
  const snap = await getDocs(
    query(collection(requireDb(), "bookings"), where("stripeSessionId", "==", sessionId))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Booking;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  extraFields?: Partial<Booking>
): Promise<void> {
  await updateDoc(doc(requireDb(), "bookings", id), {
    status,
    ...extraFields,
  });
}

export async function getBookingsByPro(proId: string): Promise<Booking[]> {
  const snap = await getDocs(
    query(
      collection(requireDb(), "bookings"),
      where("proId", "==", proId),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
}

export async function getBookingsByClient(clientEmail: string): Promise<Booking[]> {
  const snap = await getDocs(
    query(
      collection(requireDb(), "bookings"),
      where("clientEmail", "==", clientEmail),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
}

// ──────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────

export async function createNotification(data: Omit<AppNotification, "id" | "createdAt">): Promise<void> {
  await addDoc(collection(requireDb(), "notifications"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getNotificationsByUser(userId: string): Promise<AppNotification[]> {
  const snap = await getDocs(
    query(
      collection(requireDb(), "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(requireDb(), "notifications", id), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const snap = await getDocs(
    query(collection(requireDb(), "notifications"), where("userId", "==", userId), where("read", "==", false))
  );
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}

// ──────────────────────────────────────────────
// Messagerie
// ──────────────────────────────────────────────

import { Conversation, ChatMessage } from "./types";

export async function getOrCreateConversation(
  proId: string,
  proEmail: string,
  proName: string,
  clientEmail: string,
  clientName: string
): Promise<string> {
  const db = requireDb();
  const q = query(
    collection(db, "conversations"),
    where("proEmail", "==", proEmail),
    where("clientEmail", "==", clientEmail)
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  const ref = await addDoc(collection(db, "conversations"), {
    proId, proEmail, proName, clientEmail, clientName,
    unreadPro: 0, unreadClient: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getConversationsByPro(proEmail: string): Promise<Conversation[]> {
  const snap = await getDocs(
    query(collection(requireDb(), "conversations"), where("proEmail", "==", proEmail), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
}

export async function getConversationsByClient(clientEmail: string): Promise<Conversation[]> {
  const snap = await getDocs(
    query(collection(requireDb(), "conversations"), where("clientEmail", "==", clientEmail), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
}

export async function sendMessage(conversationId: string, from: string, content: string, role: "pro" | "client"): Promise<void> {
  const db = requireDb();
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    conversationId, from, content, read: false,
    createdAt: serverTimestamp(),
  });
  const unreadField = role === "pro" ? "unreadClient" : "unreadPro";
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: content.slice(0, 100),
    lastMessageAt: serverTimestamp(),
    [unreadField]: (await getDoc(doc(db, "conversations", conversationId))).data()?.[unreadField] + 1 || 1,
  });
}

export function subscribeToMessages(
  conversationId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  const db = requireDb();
  return onSnapshot(
    query(collection(db, "conversations", conversationId, "messages"), orderBy("createdAt", "asc"), fbLimit(100)),
    (snap) => {
      onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage)));
    }
  );
}

export async function markConversationRead(conversationId: string, role: "pro" | "client"): Promise<void> {
  const field = role === "pro" ? "unreadPro" : "unreadClient";
  await updateDoc(doc(requireDb(), "conversations", conversationId), { [field]: 0 });
}
