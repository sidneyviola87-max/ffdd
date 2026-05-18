import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import HomePage from "@/pages/Home";
import AuthPage from "@/pages/Auth";
import ProductDetailPage from "@/pages/ProductDetail";
import PostPage from "@/pages/Post";
import ChatsPage from "@/pages/Chats";
import ChatDetailPage from "@/pages/ChatDetail";
import ProfilePage from "@/pages/Profile";
import ProfileViewPage from "@/pages/ProfileView";
import PublicProfilePage from "@/pages/PublicProfile";
import SellerShopPage from "@/pages/SellerShop";
import SearchPage from "@/pages/Search";
import NotificationsPage from "@/pages/Notifications";
import EditProfilePage from "@/pages/EditProfile";
import FollowersPage from "@/pages/Followers";
import FollowingPage from "@/pages/Following";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-border">
        <SideNav />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 relative">
        <div className="max-w-[430px] md:max-w-none mx-auto relative shadow-2xl md:shadow-none border-x border-border/50 md:border-x-0 min-h-screen">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/product/:id" component={ProductDetailPage} />
            <Route path="/post" component={PostPage} />
            <Route path="/chat" component={ChatsPage} />
            <Route path="/chat/:id" component={ChatDetailPage} />
            <Route path="/profile/view" component={ProfileViewPage} />
            <Route path="/profile/edit" component={EditProfilePage} />
            <Route path="/profile/:id" component={PublicProfilePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/seller/:id/shop" component={SellerShopPage} />
            <Route path="/search" component={SearchPage} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/followers/:id" component={FollowersPage} />
            <Route path="/following/:id" component={FollowingPage} />
            <Route component={NotFound} />
          </Switch>
          {/* Mobile bottom nav */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppLayout />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
