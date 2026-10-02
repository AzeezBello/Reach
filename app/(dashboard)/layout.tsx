import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardFooter } from "@/components/dashboard-footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="flex min-h-dvh">

        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
          <DashboardSidebar />
        </aside>

        {/* Main application */}
        <div className="flex min-w-0 flex-1 flex-col">

          <DashboardHeader />

          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>

          <DashboardFooter />

        </div>
      </div>
    </div>
  );
}