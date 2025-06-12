import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Users } from "lucide-react";
import AdminDashboard from "@/pages/admin-dashboard";
import UserInterface from "@/pages/user-interface";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/user/:id" component={UserInterface} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Home() {
  const [currentView, setCurrentView] = useState<"admin" | "user">("admin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* View Toggle Navigation */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="container mx-auto">
          <div className="flex justify-center gap-2 bg-muted rounded-lg p-1 max-w-md mx-auto">
            <Button
              variant={currentView === "admin" ? "default" : "ghost"}
              onClick={() => setCurrentView("admin")}
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
            <Button
              variant={currentView === "user" ? "default" : "ghost"}
              onClick={() => setCurrentView("user")}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              User Interface
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[calc(100vh-80px)]">
        {currentView === "admin" ? <AdminDashboard /> : <UserDemoInterface />}
      </div>
    </div>
  );
}

function UserDemoInterface() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">User Interface Demo</h2>
        <p className="text-muted-foreground mb-6">
          To access the user interface, visit a URL like: <code>/user/[uuid]</code>
        </p>
        <p className="text-sm text-muted-foreground">
          Create users in the admin dashboard, then use their UUID to access their user interface.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
