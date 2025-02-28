'use client'

import { useEffect, useRef } from 'react';
// Remove the direct p5 import
// import p5 from 'p5';

const P5Wrapper = ({ currentFiles }: { currentFiles: any[]}) => {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import p5
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      const sketch = new p5((p: any) => {
        console.log("current files: ", currentFiles)
        // set initial random file
        let currentRandomFile = currentFiles.length > 0 ? currentFiles[p.floor(p.random(0, currentFiles.length))] : null
        let currentFileName = getRandomFileName();
        let backgroundImg: any;
        let bgWidth, bgHeight;
        let theConfirm, thePrompt;
        let numOfFilesLeft = currentFiles.length;

        function getRandomFileName() {
          const currentRandomFileName = currentRandomFile?.Key ?? ""

          return currentRandomFileName
        }

        function getNumberOfFilesLeft() {
          return currentFiles.length;
        }

        function getRandomFileFact() {
          return "really cool";
        }

        async function triggerDownload(fileName: string) {
          try {
            const response = await fetch(`/api/s3?key=${encodeURIComponent(fileName)}`)
            console.log("response :: ", response)
            const blob = await response.blob();
            
            console.log("blob :: ", blob)

            const url = window.URL.createObjectURL(blob);

            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.log("Error downloading file: ", error)
          }
        }

        async function storeContact(contact: string, fileName: string) {
          try {
            console.log("here's the contact : ", contact)
            console.log(" file : ", fileName)
            const response = await fetch('/api/dynamo', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ contact, fileName }),
            });
            
            if (!response.ok) {
              throw new Error('Failed to store contact information');
            }
          } catch (error) {
            console.error('Error storing contact:', error);
          }
        }

        async function deleteFile(fileName: string) {
          try {
            const response = await fetch(`/api/s3/delete?key=${encodeURIComponent(fileName)}`, {
              method: 'DELETE',
            });
            
            if (!response.ok) {
              throw new Error('Failed to delete file');
            }
            
            console.log('File deleted successfully');
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        }

        p.preload = () => {
          backgroundImg = p.loadImage('/desktop-background.png')
        }

        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
          let imgAspect = backgroundImg.width / backgroundImg.height;
    
          // Calculate the new width and height to maintain the aspect ratio
          if (p.windowWidth / p.windowHeight > imgAspect) {
            bgHeight = p.windowHeight;
            bgWidth = bgHeight * imgAspect;
          } else {
            bgWidth = p.windowWidth;
            bgHeight = bgWidth / imgAspect;
          }
          
          // Display the background image without stretching
          p.image(backgroundImg, 0, 0, bgWidth, bgHeight);

          setTimeout(async () => {
            alert("I want my computer to forget like I do.");
            alert("I feel the weight of all my the files, held, but no longer in use.");
            alert("I have so many files. " + numOfFilesLeft + " files in total.");
            alert("I want to be able to forget them, to delete them, but what if I need them later?");
            
            theConfirm = confirm("Could you hold onto " + currentFileName + " for me?");
            console.log("CONFIRMING: ", theConfirm);
            
            if (theConfirm) {
              await triggerDownload(currentFileName);
            }
            
            alert("Thank you. I feel relieved. I can now delete " + currentFileName + " off of my drive.");
            
            thePrompt = prompt("Just in case I need it back later, how can I get in touch?");
            console.log(thePrompt);

            if (thePrompt) {
              await storeContact(thePrompt, currentFileName);
            }
          }, 500);
        };

        p.draw = () => {
          // p.background(230);
        };

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

      }, sketchRef.current!);

      return () => {
        sketch.remove();
      };
    });
  }, [currentFiles]);

  return <div ref={sketchRef}></div>;
};

export default P5Wrapper;