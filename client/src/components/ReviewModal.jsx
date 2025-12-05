import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ReviewModal({ open, onOpenChange, review }) {
  if (!review) return null;

  const reviewer = review.user?.name || "Anonymous";
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reviewer}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Review posted on {date}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">{date}</div>
          {review.productName && <div className="font-medium">Review for: {review.productName}</div>}
          <div className="prose max-w-none text-muted-foreground">{review.comment}</div>
        </div>

        <div className="mt-4 text-right">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
