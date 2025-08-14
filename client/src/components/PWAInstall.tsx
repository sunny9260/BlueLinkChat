import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, RefreshCw } from "lucide-react";
import { pwaManager } from "@/lib/pwa";
import { useToast } from "@/hooks/use-toast";

export function PWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initial state
    setCanInstall(pwaManager.canInstall());
    setIsInstalled(pwaManager.getIsInstalled());
    setUpdateAvailable(pwaManager.getUpdateAvailable());

    // Show install banner if can install and not dismissed
    if (pwaManager.canInstall() && !localStorage.getItem('pwa-install-dismissed')) {
      setShowInstallBanner(true);
    }

    // Event listeners for PWA events
    const handleInstallAvailable = () => {
      setCanInstall(true);
      if (!localStorage.getItem('pwa-install-dismissed')) {
        setShowInstallBanner(true);
      }
    };

    const handleInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
      setShowInstallBanner(false);
      toast({
        title: "App Installed!",
        description: "OfflineChat has been added to your home screen.",
      });
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
      setShowUpdateBanner(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, [toast]);

  const handleInstall = async () => {
    const installed = await pwaManager.install();
    if (!installed) {
      toast({
        title: "Installation Failed",
        description: "Could not install the app. Try again later.",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    await pwaManager.update();
    toast({
      title: "Updating App...",
      description: "The app will restart with the latest version.",
    });
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const dismissUpdate = () => {
    setShowUpdateBanner(false);
  };

  return (
    <>
      {/* Install Banner */}
      {showInstallBanner && canInstall && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 shadow-lg">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3 flex-1">
              <Download className="h-5 w-5" />
              <div>
                <p className="font-medium">Install OfflineChat</p>
                <p className="text-sm text-blue-100">Add to your home screen for easy access</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleInstall}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissInstall}
                className="text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Banner */}
      {showUpdateBanner && updateAvailable && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-3 z-50 shadow-lg">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3 flex-1">
              <RefreshCw className="h-5 w-5" />
              <div>
                <p className="font-medium">Update Available</p>
                <p className="text-sm text-green-100">A new version of OfflineChat is ready</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUpdate}
                className="bg-white text-green-600 hover:bg-green-50"
              >
                Update
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissUpdate}
                className="text-white hover:bg-green-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Install Button (for manual install) */}
      {canInstall && !showInstallBanner && (
        <Button
          onClick={handleInstall}
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-40 shadow-lg"
          data-testid="button-install-pwa"
        >
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      )}
    </>
  );
}