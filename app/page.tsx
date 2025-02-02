'use client'
import { useState, useEffect } from "react"
import P5Wrapper from "./components/sketch"

// TODO: change this variable
const NUM_TOTAL_FILES = 100;

export default function Home() {
  const [currentFiles, setCurrentFiles] = useState<any[]>([]);

  // List all files
  const listFiles = async () => {
    const response = await fetch(`/api/s3`);  // Simplified URL
    const data = await response.json();
    setCurrentFiles(data.files)
  };

  useEffect(() => {
    listFiles();
  }, []);

  // Get a specific file
  const getFile = async (key: string) => {
    const response = await fetch(`/api/s3?key=${encodeURIComponent(key)}`);  // Simplified URL
    const data = await response.json();
    console.log(data.data);
  };

  return (
    <div className="">
      <P5Wrapper currentFiles={currentFiles} />
    </div>
  );
}
