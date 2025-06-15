
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySubmit: (apiKey: string) => void;
}

export function ApiKeyDialog({ open, onOpenChange, onApiKeySubmit }: ApiKeyDialogProps) {
  const [key, setKey] = useState('');

  const handleSubmit = () => {
    if (key.trim()) {
      onApiKeySubmit(key.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter RapidAPI Key</DialogTitle>
          <DialogDescription>
            Please provide your RapidAPI key for the "unlimited-gpt-4" API. Your key will be stored in your browser's local storage and will not be shared.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="col-span-3"
              placeholder="Your RapidAPI key"
              type="password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save and Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
