import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to = "/" }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    // Simply navigate back in history, with fallback to specified route
    try {
      navigate(-1);
      // Give history back a moment to work; if it doesn't redirect, fall back to `to`
      setTimeout(() => {
        // Check if we're still on the same page (back didn't work)
        const currentPath = window.location.pathname;
        if (currentPath === "/user/dashboard" || currentPath === "/admin") {
          navigate(to);
        }
      }, 300);
    } catch (err) {
      // If navigate(-1) fails, go to fallback route
      navigate(to);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="gap-2 mb-4 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
