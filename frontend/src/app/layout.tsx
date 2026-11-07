import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/layout/Navbar";
import { Toast } from "@/components/layout/Toast";
import AuthModal from "@/components/auth/AuthModal";
import UserDashboard from "@/components/auth/UserDashboard";
import AdminDashboard from "@/components/auth/AdminDashboard";

export const metadata: Metadata = {
  title: "Unit Calculator | એકમ કેલ્ક્યુલેટર",
  description:
    "Convert between metric, imperial, Gujarati traditional units, financial calculations, PDF tools, code compiler, color viewer, and QR connect.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AppProvider>
          <Navbar />
          <div className="relative min-h-[calc(100vh-140px)]">{children}</div>
          <Toast />
          <AuthModal />
          <UserDashboard />
          <AdminDashboard />
        </AppProvider>
      </body>
    </html>
  );
}