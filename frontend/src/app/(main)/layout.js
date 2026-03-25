import { SidebarProvider } from "../../components/SidebarContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import MainContent from "../../components/MainContent";

export default function MainLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50">
        {/* Fixed sidebar */}
        <div className="fixed top-0 left-0 h-screen z-40">
          <Sidebar />
        </div>
        {/* Content shifts based on sidebar width */}
        <MainContent>
          <Header />
          <main className="flex-1 p-6">{children}</main>
          <Footer />
        </MainContent>
      </div>
    </SidebarProvider>
  );
}