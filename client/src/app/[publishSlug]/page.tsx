"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { apiClient } from "../../utils/api";

export default function PublishedPage() {
  const params = useParams();
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedPage = async () => {
      try {
        const slug = params.publishSlug as string;
        const response = await apiClient.getPublishedPage(slug);
        
        if (response.success && response.data) {
          // Set the HTML content directly
          setContent(response.data.htmlContent);
        } else {
          setError("Page not found");
        }
      } catch (error) {
        setError("Failed to load page");
        console.error("Error loading published page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedPage();
  }, [params.publishSlug]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>{error}</div>
      </div>
    );
  }

  // Render the HTML content directly
  // Note: This is safe because the content comes from our trusted backend
  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
}
