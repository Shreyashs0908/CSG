import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin" // Ensure firebase-admin is initialized

export async function GET(request: NextRequest) {
  try {
    // Extract chapterId from the query parameters
    const chapterId = request.nextUrl.searchParams.get('chapterId');
    
    console.log("Relevant Sections API GET - Chapter ID:", chapterId);

    if (!chapterId) {
      return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
    }

    if (!adminDb) {
      console.error("Firebase admin is not initialized");
      return NextResponse.json({ error: "Database connection error" }, { status: 500 });
    }

    // Reference to the document containing the relevant sections for the chapter
    const relevantSectionsRef = adminDb.doc(`Relevant Sections/${chapterId}`);
    const relevantSectionsSnap = await relevantSectionsRef.get();

    // If relevant sections don't exist for this chapter, return a default message
    if (!relevantSectionsSnap.exists) {
      console.log("Relevant Sections API GET - Sections not found for chapter:", chapterId);
      
      // Return a default message
      return NextResponse.json({
        content: `No relevant sections found for chapter ${chapterId}. Please check back later.`
      });
    }

    const sectionsData = relevantSectionsSnap.data();
    
    // Check if we have IT_Sections_Applicable and other fields
    let formattedContent = "";
    
    // Format the content based on the available fields
    if (sectionsData) {
      // Check for IT Act sections
      if (sectionsData.IT_Sections_Applicable) {
        formattedContent += "IT Act Sections:\n";
        
        // Check if it's an array or an object with nested fields
        if (Array.isArray(sectionsData.IT_Sections_Applicable)) {
          // Handle array format
          sectionsData.IT_Sections_Applicable.forEach((section: any, index: number) => {
            if (typeof section === 'string') {
              formattedContent += `${section}\n`;
            } else if (section && typeof section === 'object') {
              // Handle object format within array
              const sectionNumber = Object.keys(section)[0];
              const description = section[sectionNumber];
              formattedContent += `"IT Act Section ${sectionNumber} - ${description}"\n`;
            }
          });
        } else if (sectionsData.IT_Sections_Applicable && typeof sectionsData.IT_Sections_Applicable === 'object') {
          // Handle object format
          Object.entries(sectionsData.IT_Sections_Applicable).forEach(([key, value]) => {
            formattedContent += `"IT Act Section ${key} - ${value}"\n`;
          });
        }
        
        formattedContent += "\n";
      }
      
      // Check for IPC sections
      if (sectionsData.IPC_Sections) {
        formattedContent += "IPC Sections:\n";
        
        // Check if it's an array or an object with nested fields
        if (Array.isArray(sectionsData.IPC_Sections)) {
          // Handle array format
          sectionsData.IPC_Sections.forEach((section: any, index: number) => {
            if (typeof section === 'string') {
              formattedContent += `${section}\n`;
            } else if (section && typeof section === 'object') {
              // Handle object format within array
              const sectionNumber = Object.keys(section)[0];
              const description = section[sectionNumber];
              formattedContent += `"IPC Section ${sectionNumber} - ${description}"\n`;
            }
          });
        } else if (sectionsData.IPC_Sections && typeof sectionsData.IPC_Sections === 'object') {
          // Handle object format
          Object.entries(sectionsData.IPC_Sections).forEach(([key, value]) => {
            formattedContent += `"IPC Section ${key} - ${value}"\n`;
          });
        }
        
        formattedContent += "\n";
      }
      
      // Check for other sections or raw content
      if (sectionsData.content) {
        formattedContent += sectionsData.content;
      }
      
      // If no structured data is found, check for raw text content
      if (formattedContent.trim() === "" && sectionsData.text) {
        formattedContent = sectionsData.text;
      }
      
      // If still no content, use a generic message with all available data
      if (formattedContent.trim() === "") {
        formattedContent = JSON.stringify(sectionsData, null, 2);
      }
    }

    return NextResponse.json({
      content: formattedContent || `No structured content found for chapter ${chapterId}.`
    });

  } catch (error) {
    console.error("Error fetching relevant sections:", error);
    return NextResponse.json({ error: "Failed to fetch relevant sections" }, { status: 500 });
  }
}