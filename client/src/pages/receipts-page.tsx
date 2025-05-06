import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";
import { ReceiptCapture } from "@/components/receipts/receipt-capture";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Calendar, DollarSign, Tag, Share2, Plus, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ReceiptData {
  id: number;
  userId: number;
  imageUrl: string;
  date: string;
  description: string | null;
  amount: number;
  currency: string;
  restaurantId: number | null;
  restaurantName: string | null;
  invitationId: number | null;
  tags: string[] | null;
  sharedWithUserIds: number[] | null;
  isShared: boolean;
  splitDetails: {
    userId: number;
    amount: number;
    isPaid: boolean;
    paymentMethod: string | null;
    paymentDate: string | null;
  }[] | null;
  ocrText: string | null;
  createdAt: string;
}

export default function ReceiptsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddReceipt, setShowAddReceipt] = useState(false);
  
  const {
    data: receipts = [],
    isLoading,
    isError,
    error,
  } = useQuery<ReceiptData[]>({
    queryKey: ["/api/receipts"],
    queryFn: getQueryFn(),
    enabled: !!user,
  });
  
  const {
    data: sharedReceipts = [],
    isLoading: isLoadingShared,
  } = useQuery<ReceiptData[]>({
    queryKey: ["/api/receipts/shared"],
    queryFn: getQueryFn(),
    enabled: !!user,
  });
  
  const handleAddNewReceiptClick = () => {
    setShowAddReceipt(true);
  };
  
  const handleReceiptAdded = () => {
    setShowAddReceipt(false);
    toast({
      title: "Receipt Added",
      description: "Your receipt has been saved successfully.",
    });
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Please log in to view your receipts</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Receipts</h1>
        {!showAddReceipt && (
          <Button onClick={handleAddNewReceiptClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Receipt
          </Button>
        )}
      </div>
      
      {showAddReceipt ? (
        <div className="mb-8">
          <ReceiptCapture onSuccess={handleReceiptAdded} />
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAddReceipt(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="my-receipts">
          <TabsList className="mb-6">
            <TabsTrigger value="my-receipts">My Receipts</TabsTrigger>
            <TabsTrigger value="shared-receipts">Shared With Me</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-receipts">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : isError ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-destructive">
                    Error loading receipts: {error?.message || "Unknown error"}
                  </div>
                </CardContent>
              </Card>
            ) : receipts.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No receipts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start capturing receipts from your dining experiences
                    </p>
                    <Button onClick={handleAddNewReceiptClick}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receipts.map((receipt) => (
                  <ReceiptCard key={receipt.id} receipt={receipt} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="shared-receipts">
            {isLoadingShared ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : sharedReceipts.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No shared receipts</h3>
                    <p className="text-muted-foreground">
                      When someone shares a receipt with you, it will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedReceipts.map((receipt) => (
                  <ReceiptCard key={receipt.id} receipt={receipt} isShared />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface ReceiptCardProps {
  receipt: ReceiptData;
  isShared?: boolean;
}

function ReceiptCard({ receipt, isShared = false }: ReceiptCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 bg-muted">
        <img 
          src={receipt.imageUrl} 
          alt={receipt.description || "Receipt"} 
          className="w-full h-full object-cover"
        />
        {isShared && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center">
            <Share2 className="h-3 w-3 mr-1" />
            Shared
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {receipt.description || "Receipt"}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {receipt.date 
              ? format(new Date(receipt.date), "MMM d, yyyy")
              : format(new Date(receipt.createdAt), "MMM d, yyyy")
            }
          </div>
          {receipt.restaurantName && (
            <div className="mt-1">
              <Receipt className="h-3 w-3 mr-1 inline" />
              {receipt.restaurantName}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between">
          <div className="text-lg font-bold flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            {receipt.amount} {receipt.currency}
          </div>
        </div>
        
        {receipt.tags && receipt.tags.length > 0 && (
          <div className="mt-2 flex items-start">
            <Tag className="h-3 w-3 mr-1 mt-1" />
            <div className="flex flex-wrap gap-1">
              {receipt.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}