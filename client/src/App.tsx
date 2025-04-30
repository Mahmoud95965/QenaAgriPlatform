import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Articles from "@/pages/Articles";
import GraduationProjects from "@/pages/GraduationProjects";
import EBooks from "@/pages/EBooks";
import Departments from "@/pages/Departments";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/Dashboard";
import ManageContent from "@/pages/admin/ManageContent";
import ManageUsers from "@/pages/admin/ManageUsers";

function Router() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  const openLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const openSignupModal = () => {
    setSignupModalOpen(true);
  };

  const closeSignupModal = () => {
    setSignupModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />
      
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/articles" component={Articles} />
          <Route path="/projects" component={GraduationProjects} />
          <Route path="/ebooks" component={EBooks} />
          <Route path="/departments" component={Departments} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/content" component={ManageContent} />
          <Route path="/admin/users" component={ManageUsers} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Footer />
      
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={closeLoginModal} 
        onOpenSignup={openSignupModal} 
      />
      
      <SignupModal 
        isOpen={signupModalOpen} 
        onClose={closeSignupModal} 
        onOpenLogin={openLoginModal} 
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
