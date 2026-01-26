import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Edit, Calendar, Gift, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BookingsModal from "@/components/profile/BookingsModal";

interface Profile {
  user_id: string;
  email: string;
  name: string;
  full_name: string | null;
  is_admin: boolean;
}

interface ProfileDropdownProps {
  profile: Profile;
  onLogout: () => void;
}

const ProfileDropdown = ({ profile, onLogout }: ProfileDropdownProps) => {
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleBookings = () => {
    setShowBookingsModal(true);
  };

  const handleLoyaltyRewards = () => {
    navigate("/loyalty-rewards");
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-medium">
              {profile.full_name || profile.name || 'Profile'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{profile.full_name || profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEditProfile} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBookings} className="cursor-pointer">
            <Calendar className="mr-2 h-4 w-4" />
            Bookings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLoyaltyRewards} className="cursor-pointer">
            <Gift className="mr-2 h-4 w-4" />
            Loyalty and Rewards
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BookingsModal 
        open={showBookingsModal} 
        onOpenChange={setShowBookingsModal}
        userId={profile.user_id}
      />
    </>
  );
};

export default ProfileDropdown;
