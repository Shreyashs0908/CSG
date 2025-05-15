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
        content: `<p>No relevant sections found for chapter ${chapterId}. Please check back later.</p>`
      });
    }

    const sectionsData = relevantSectionsSnap.data();
    
    // Format the content based on the available fields
    let formattedContent = "";
    
    if (sectionsData) {
      // Add the name/title if available
      if (sectionsData.Name) {
        formattedContent += `<h3 class="text-lg font-semibold mb-2">${sectionsData.Name}</h3>\n`;
      }
      
      // Process IT Sections Applicable
      if (sectionsData["IT Sections Applicable"]) {
        const itSections = sectionsData["IT Sections Applicable"];
        
        // Check if it's an object with categories
        if (typeof itSections === 'object' && !Array.isArray(itSections)) {
          // Process each category
          Object.entries(itSections).forEach(([category, sections]) => {
            formattedContent += `<div class="mb-4">`;
            formattedContent += `<h4 class="text-md font-medium mb-1">${category}</h4>`;
            formattedContent += `<ul class="list-disc pl-5 space-y-1">`;
            
            // Process sections in this category
            if (Array.isArray(sections)) {
              sections.forEach((section: string) => {
                // Remove any quotes or brackets from the section text
                const cleanSection = section.replace(/["\\[\\]]/g, '');
                formattedContent += `<li>${cleanSection}</li>`;
              });
            } else if (typeof sections === 'string') {
              const cleanSection = sections.replace(/["\\[\\]]/g, '');
              formattedContent += `<li>${cleanSection}</li>`;
            }
            
            formattedContent += `</ul></div>`;
          });
        } else if (Array.isArray(itSections)) {
          // It's a simple array of sections
          formattedContent += `<div class="mb-4">`;
          formattedContent += `<h4 class="text-md font-medium mb-1">IT Sections Applicable</h4>`;
          formattedContent += `<ul class="list-disc pl-5 space-y-1">`;
          
          itSections.forEach((section: string) => {
            const cleanSection = section.replace(/["\\[\\]]/g, '');
            formattedContent += `<li>${cleanSection}</li>`;
          });
          
          formattedContent += `</ul></div>`;
        }
      }
      
      // Handle IT_Sections_Applicable (alternative naming)
      else if (sectionsData.IT_Sections_Applicable) {
        formattedContent += `<div class="mb-4">`;
        formattedContent += `<h4 class="text-md font-medium mb-1">IT Act Sections</h4>`;
        formattedContent += `<ul class="list-disc pl-5 space-y-1">`;
        
        if (Array.isArray(sectionsData.IT_Sections_Applicable)) {
          sectionsData.IT_Sections_Applicable.forEach((section: any) => {
            if (typeof section === 'string') {
              // Remove any brackets and clean up the text
              const cleanedSection = section.replace(/["\\[\\]]/g, '');
              formattedContent += `<li>${cleanedSection}</li>`;
            } else if (section && typeof section === 'object') {
              Object.entries(section).forEach(([key, value]) => {
                formattedContent += `<li>${key} - ${value}</li>`;
              });
            }
          });
        } else if (typeof sectionsData.IT_Sections_Applicable === 'object') {
          Object.entries(sectionsData.IT_Sections_Applicable).forEach(([key, value]) => {
            formattedContent += `<li class="font-medium">${key}:</li>`;
            formattedContent += `<ul class="list-disc pl-5 ml-4">`;
            
            if (Array.isArray(value)) {
              value.forEach((item: string) => {
                const cleanedItem = item.replace(/["\\[\\]]/g, '');
                formattedContent += `<li>${cleanedItem}</li>`;
              });
            } else {
              formattedContent += `<li>${value}</li>`;
            }
            
            formattedContent += `</ul>`;
          });
        }
        
        formattedContent += `</ul></div>`;
      }
      
      // Process IPC Sections if available
      if (sectionsData["IPC Sections"] || sectionsData.IPC_Sections) {
        const ipcSections = sectionsData["IPC Sections"] || sectionsData.IPC_Sections;
        
        formattedContent += `<div class="mb-4">`;
        formattedContent += `<h4 class="text-md font-medium mb-1">IPC Sections</h4>`;
        formattedContent += `<ul class="list-disc pl-5 space-y-1">`;
        
        if (Array.isArray(ipcSections)) {
          ipcSections.forEach((section: any) => {
            if (typeof section === 'string') {
              // Remove any brackets and clean up the text
              const cleanedSection = section.replace(/["\\[\\]]/g, '');
              formattedContent += `<li>${cleanedSection}</li>`;
            } else if (section && typeof section === 'object') {
              Object.entries(section).forEach(([key, value]) => {
                formattedContent += `<li>${key} - ${value}</li>`;
              });
            }
          });
        } else if (typeof ipcSections === 'object' && ipcSections !== null) {
          Object.entries(ipcSections).forEach(([key, value]) => {
            formattedContent += `<li class="font-medium">${key}:</li>`;
            formattedContent += `<ul class="list-disc pl-5 ml-4">`;
            
            if (Array.isArray(value)) {
              value.forEach((item: string) => {
                const cleanedItem = item.replace(/["\\[\\]]/g, '');
                formattedContent += `<li>${cleanedItem}</li>`;
              });
            } else {
              formattedContent += `<li>${value}</li>`;
            }
            
            formattedContent += `</ul>`;
          });
        } else if (typeof ipcSections === 'string') {
          formattedContent += `<li>${ipcSections}</li>`;
        }
        
        formattedContent += `</ul></div>`;
      }
      
      // If we have no formatted content yet, but we have raw data, use that
      if (formattedContent.trim() === "") {
        // Try to format any other fields that might be present
        Object.entries(sectionsData).forEach(([key, value]) => {
          // Skip fields we've already processed
          if (key === "Name" || key === "IT Sections Applicable" || key === "IPC Sections" || 
              key === "IT_Sections_Applicable" || key === "IPC_Sections") {
            return;
          }
          
          formattedContent += `<div class="mb-4">`;
          formattedContent += `<h4 class="text-md font-medium mb-1">${key}</h4>`;
          
          if (Array.isArray(value)) {
            formattedContent += `<ul class="list-disc pl-5 space-y-1">`;
            value.forEach((item: any) => {
              if (typeof item === 'string') {
                const cleanItem = item.replace(/["\\[\\]]/g, '');
                formattedContent += `<li>${cleanItem}</li>`;
              } else if (item && typeof item === 'object') {
                // Handle nested objects
                Object.entries(item).forEach(([subKey, subValue]) => {
                  formattedContent += `<li><strong>${subKey}:</strong> ${subValue}</li>`;
                });
              }
            });
            formattedContent += `</ul>`;
          } else if (typeof value === 'object' && value !== null) {
            formattedContent += `<ul class="list-disc pl-5 space-y-1">`;
            Object.entries(value).forEach(([subKey, subValue]) => {
              formattedContent += `<li><strong>${subKey}:</strong> ${subValue}</li>`;
            });
            formattedContent += `</ul>`;
          } else if (typeof value === 'string') {
            formattedContent += `<p>${value}</p>`;
          }
          
          formattedContent += `</div>`;
        });
      }
    }
    
    // If we still have no content, return a generic message
    if (formattedContent.trim() === "") {
      formattedContent = `<p>No structured content found for chapter ${chapterId}.</p>`;
    }

    return NextResponse.json({
      content: formattedContent
    });

  } catch (error) {
    console.error("Error fetching relevant sections:", error);
    return NextResponse.json({ error: "Failed to fetch relevant sections" }, { status: 500 });
  }
}