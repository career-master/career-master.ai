import type { NextConfig } from "next";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// Copy PDF.js worker file to public directory
const copyPdfWorker = () => {
  try {
    const workerSource = join(process.cwd(), "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
    const workerDest = join(process.cwd(), "public", "pdfjs", "pdf.worker.min.mjs");
    
    if (existsSync(workerSource)) {
      mkdirSync(join(process.cwd(), "public", "pdfjs"), { recursive: true });
      copyFileSync(workerSource, workerDest);
      console.log("✓ PDF.js worker file copied to public directory");
    }
  } catch (error) {
    console.warn("Could not copy PDF.js worker file:", error);
  }
};

// Copy worker file during build
copyPdfWorker();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
