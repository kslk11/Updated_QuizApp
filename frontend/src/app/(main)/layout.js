// import { SidebarProvider } from "../../components/SidebarContext";
// import Header from "../../components/Header";
// import Footer from "../../components/Footer";
// import Sidebar from "../../components/Sidebar";
// import MainContent from "../../components/MainContent";

// export default function MainLayout({ children }) {
//   return (
//     <SidebarProvider>
//       <div className="flex min-h-screen bg-slate-50">
//         {/* Fixed sidebar */}
//         <div className="fixed top-0 left-0 h-screen z-40">
//           <Sidebar />
//         </div>
//         {/* Content shifts based on sidebar width */}
//         <MainContent>
//           <Header />
//           <main className="flex-1 p-6">{children}</main>
//           <Footer />
//         </MainContent>
//       </div>
//     </SidebarProvider>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "../../components/SidebarContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import MainContent from "../../components/MainContent";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MainLayout({ children }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/auth/login");
    } else {
      setIsAuth(true);
    }
  }, []);

  // Prevent flicker
  if (!isAuth) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50">
        <div className="fixed top-0 left-0 h-screen z-40">
          <Sidebar />
        </div>

        <MainContent>
          <Header />
          <main className="flex-1 p-6">{children}</main>
          <Footer />
        </MainContent>

         <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </div>
    </SidebarProvider>
  );
}
