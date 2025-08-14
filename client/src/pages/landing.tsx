import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-bluetooth text-primary text-2xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold">OfflineChat</CardTitle>
          <CardDescription>
            Connect and chat with nearby users via local network messaging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Real-time 1-to-1 messaging</li>
              <li>• Admin broadcast messages</li>
              <li>• Local network communication</li>
              <li>• Offline message storage</li>
            </ul>
          </div>
          <Button 
            className="w-full" 
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
