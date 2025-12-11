// We declare the global variable provided by the CDN script in index.html
declare const mammoth: any;

export const parseFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result;
      
      if (file.name.endsWith('.docx')) {
        if (typeof mammoth === 'undefined') {
          reject(new Error("Mammoth library not loaded"));
          return;
        }

        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(new Error("Failed to parse DOCX file"));
        }
      } else {
        // Fallback for .txt files
        const text = new TextDecoder().decode(arrayBuffer as ArrayBuffer);
        resolve(text);
      }
    };

    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsArrayBuffer(file);
  });
};