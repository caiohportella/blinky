"use client";

import { useState } from "react";
import { Copy, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/lib/api";

import Image from "next/image";
import { toast } from "sonner";
import { getBaseUrl } from "@/hooks/get-base-url";

interface LinkItemProps {
  link: Link;
  onDelete: (id: string) => void;
}

export function LinkItem({ link, onDelete }: LinkItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const shortUrl = `${getBaseUrl}/${link.shortCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard", {
      description: "Short link copied successfully",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(link.id);
      toast.success("Link deleted", {
        description: "Your short link has been deleted",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete link",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(link.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex-shrink-0">
        {link.favicon ? (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            <Image
              src={link.favicon || "/placeholder.svg"}
              alt=""
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={handleCopy}
            className="text-base font-medium hover:underline truncate"
          >
            {shortUrl}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleCopy}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{link.originalUrl}</span>
          <span className="flex-shrink-0">{"•"}</span>
          <span className="flex-shrink-0">{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right bg-primary/10 px-3 py-1 rounded-xl">
          <div className="text-2xl font-bold text-primary">{link.clicks}</div>
          <div className="text-xs font-medium text-muted-foreground">{"clicks"}</div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              {"Copy link"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
