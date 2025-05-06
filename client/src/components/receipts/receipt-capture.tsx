import { useState, useRef, ChangeEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Receipt, X, Plus, Save } from "lucide-react";

interface ReceiptCaptureProps {
  restaurantId?: number;
  invitationId?: number;
  onSuccess?: () => void;
}

export function ReceiptCapture({ restaurantId, invitationId, onSuccess }: ReceiptCaptureProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  const createReceiptMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/receipts", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload receipt");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch receipts query
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      
      // Show success message
      toast({
        title: "Receipt Uploaded",
        description: "Your receipt has been successfully saved.",
      });
      
      // Reset form
      setImagePreview(null);
      setSelectedFile(null);
      setDescription("");
      setAmount("");
      setTags([]);
      setNewTag("");
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Missing Image",
        description: "Please upload or take a photo of your receipt",
        variant: "destructive",
      });
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("description", description);
    formData.append("amount", amount);
    formData.append("currency", currency);
    formData.append("tags", JSON.stringify(tags));
    
    if (restaurantId) {
      formData.append("restaurantId", restaurantId.toString());
    }
    
    if (invitationId) {
      formData.append("invitationId", invitationId.toString());
    }
    
    try {
      await createReceiptMutation.mutateAsync(formData);
    } catch (error) {
      // Error is handled in the mutation's onError
    }
  };
  
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            Please log in to capture receipts
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Receipt className="mr-2" />
          Receipt Capture
        </CardTitle>
        <CardDescription>
          Take a photo of your receipt or upload an image
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {!imagePreview ? (
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-32 flex flex-col items-center justify-center"
                onClick={handleCameraClick}
              >
                <Camera className="h-8 w-8 mb-2" />
                <span>Take Photo</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-32 flex flex-col items-center justify-center"
                onClick={handleUploadClick}
              >
                <Upload className="h-8 w-8 mb-2" />
                <span>Upload Image</span>
              </Button>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Receipt preview" 
                className="w-full h-64 object-contain border rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <div 
                key={tag} 
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input 
              placeholder="Add tag..." 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddTag}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleSubmit}
          disabled={createReceiptMutation.isPending || !selectedFile}
        >
          {createReceiptMutation.isPending ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              <span>Save Receipt</span>
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}