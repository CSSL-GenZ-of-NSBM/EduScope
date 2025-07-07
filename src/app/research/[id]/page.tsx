"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Calendar,
  User,
  BookOpen,
  Tags,
  Building,
  GraduationCap,
  FileText,
  Share2,
  Heart,
  Flag
} from "lucide-react";
import { ResearchPaper } from "@/types";
import { formatFileSize } from "@/lib/file-upload/validation";

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const paperId = params.id as string;

  useEffect(() => {
    if (paperId) {
      fetchPaper();
    }
  }, [paperId]);

  // Track view when user spends time on the page
  useEffect(() => {
    if (!paper || !session?.user || hasTrackedView) return;

    const trackView = async () => {
      if (hasTrackedView) return; // Double check to prevent race conditions
      
      try {
        setHasTrackedView(true); // Set immediately to prevent multiple calls
        await fetch(`/api/research/${paperId}?trackView=true`);
      } catch (error) {
        console.error('Failed to track view:', error);
        setHasTrackedView(false); // Reset on error so it can retry
      }
    };

    // Track view after 2 seconds of being on the page
    const viewTimer = setTimeout(trackView, 2000);

    return () => {
      clearTimeout(viewTimer);
    };
  }, [paper, session, paperId, hasTrackedView]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/research/${paperId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Research paper not found");
        } else {
          setError("Failed to load research paper");
        }
        return;
      }

      const data = await response.json();
      setPaper(data.data);
    } catch (error) {
      console.error("Error fetching research paper:", error);
      setError("Failed to load research paper");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!paper) return;

    try {
      setDownloading(true);
      const response = await fetch(`/api/files/${paper.fileId}`);
      
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = paper.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Update download count
      await fetch(`/api/research/${paperId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'download' }),
      })

      // Update local state
      setPaper(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="academic-container">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-6">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error || "Research Paper Not Found"}
              </h2>
              <p className="text-gray-600 mb-6">
                The research paper you're looking for might have been removed or doesn't exist.
              </p>
              <Button asChild>
                <Link href="/research">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Research
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="academic-container">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/research">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Research
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-3">{paper.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">{paper.field}</Badge>
                      {paper.faculty && <Badge variant="outline">{paper.faculty}</Badge>}
                      <Badge variant="outline">{paper.year}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>By: {paper.authors.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{paper.downloadCount} downloads</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {/* Abstract */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Abstract</h3>
                    <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
                  </div>

                  {/* Keywords */}
                  {paper.keywords && paper.keywords.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {paper.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {paper.tags && paper.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {paper.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <Tags className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {paper.supervisor && (
                      <div>
                        <h4 className="font-semibold mb-1">Supervisor</h4>
                        <p className="text-gray-600">{paper.supervisor}</p>
                      </div>
                    )}
                    {paper.department && (
                      <div>
                        <h4 className="font-semibold mb-1">Department</h4>
                        <p className="text-gray-600">{paper.department}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Download Paper</CardTitle>
                <CardDescription>
                  Access the full research document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>File Size:</span>
                    <span className="font-medium">{formatFileSize(paper.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Format:</span>
                    <span className="font-medium">{paper.mimeType.split('/')[1].toUpperCase()}</span>
                  </div>
                  <Button 
                    onClick={handleDownload} 
                    disabled={downloading}
                    className="w-full"
                  >
                    {downloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Views</span>
                    </div>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Downloads</span>
                    </div>
                    <span className="font-medium">{paper.downloadCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Likes</span>
                    </div>
                    <span className="font-medium">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Paper
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                    <Flag className="h-4 w-4 mr-2" />
                    Report Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
