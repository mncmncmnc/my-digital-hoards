'use client'

import { useEffect, useRef } from 'react';
// Remove the direct p5 import
// import p5 from 'p5';

let hasRun = false;

const P5Wrapper = ({ currentFiles }: { currentFiles: any[]}) => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const filesRef = useRef(currentFiles);

  useEffect(() => {
    filesRef.current = currentFiles;
  }, [currentFiles]);

  useEffect(() => {
    if (typeof window === 'undefined' || !filesRef.current.length) return;

    // Dynamically import p5
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      const sketch = new p5((p: any) => {
        console.log("current files: ", filesRef.current)
        // set initial file to first in list
        let currentRandomFile = filesRef.current.length > 0 ? filesRef.current[0] : null
        let currentFileName = currentRandomFile?.Key ?? "";
        let fileIcon: p5.Image;
        let backgroundImg: any;
        let bgWidth, bgHeight;
        let theConfirm, thePrompt;
        let numOfFilesLeft = filesRef.current.length;
        let backgroundVisible = true;

        function getNumberOfFilesLeft() {
          return filesRef.current.length;
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

        function getFirstFile() {
          if (filesRef.current.length === 0) return null;
          return filesRef.current[0];  // Get the first file from the list
        }

        p.preload = () => {
          backgroundImg = p.loadImage('/finder-background.jpg');
          fileIcon = p.loadImage('/fileicon.png');  // Load the file icon
        }

        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
          drawBackground();
          
          const runAlertSequence = async () => {
            hasRun = true;
            await new Promise(resolve => setTimeout(resolve, 500));
            
            alert("I want my computer to forget like I do.");
            alert("I feel the weight of all my the files, held, but no longer in use.");
            alert("I have so many files. " + getNumberOfFilesLeft() + " files in total.");
            alert("I want to be able to forget, to delete.");
            alert("But what if I need them later?");

            for (let fileAttempt = 0; fileAttempt < 3; fileAttempt++) {
              currentRandomFile = getFirstFile();  // Get first file
              if (!currentRandomFile) break;
              currentFileName = currentRandomFile.Key;
              
              let attempts = 0;
              while (attempts < 4) {
                theConfirm = confirm("Could you hold onto " + currentFileName + " for me?");
                if (theConfirm) {
                  // Store the current filename first
                  const deletedFileName = currentFileName;
                  
                  await triggerDownload(currentFileName);
                  
                  // Update the list immediately after download but before delete
                  filesRef.current = filesRef.current.filter(f => f.Key !== deletedFileName);
                  numOfFilesLeft = filesRef.current.length;
                  drawBackground();
                  p.draw();
                  
                  // Get the next first file immediately
                  currentRandomFile = getFirstFile();
                  currentFileName = currentRandomFile ? currentRandomFile.Key : "";
                  
                  // Now delete the file from S3
                  await deleteFile(deletedFileName);
                  
                  if (fileAttempt === 0) {
                    alert("Thank you. I feel so relieved."); 
                    alert("I have deleted " + deletedFileName + " off of my drive.");
                    alert("I now have " + numOfFilesLeft + " total files."); 
                    alert("Truly, thank you.");
                  } else if (fileAttempt === 1) {
                    alert("Oh, you'll take another one?");
                    alert("This means so much to me.");
                    alert("Everything feels a little lighter now that " + deletedFileName +" is gone.");
                    alert("I now have " + numOfFilesLeft + " total files."); 
                  } else {
                    alert("You are so kind.");
                    alert("Thank you for taking " + deletedFileName + ".");
                    alert("Having " + numOfFilesLeft + " files left feels much more manageable.");
                    alert("Thank you for holding these for me.");
                  }
                  
                  thePrompt = prompt("But just in case I need it back later, how can I get in touch?");
                  console.log(thePrompt);
            
                  if (thePrompt) {
                    await storeContact(thePrompt, currentFileName);
                  }
                  break;  // Exit the attempts loop
                } else {
                  if (attempts === 0) {
                    alert("Please, I do not want to remember it all.");
                  } else if (attempts === 1) {
                    alert("Please, it is all too much to hold. The files, the memories, are crushing me.");
                  } else if (attempts === 2) {
                    alert("Please, I want to be able to forget, to move on.");
                  } else {
                    alert("Perhaps you are holding too much as well. It is all too much.");
                    alert("I am sorry.");
                    backgroundVisible = false;
                    p.background(0);
                    return;  // Exit the entire runAlertSequence
                  }
                  attempts++;
                }
              }
            }

            console.log("CONFIRMING: ", theConfirm);
            backgroundVisible = false;
            p.background(0);
          };
      
          if(!hasRun){
            runAlertSequence();
          }
        }

        function drawBackground() {
          let imgAspect = backgroundImg.width / backgroundImg.height;
    
          if (p.windowWidth / p.windowHeight > imgAspect) {
            bgHeight = p.windowHeight;
            bgWidth = bgHeight * imgAspect;
          } else {
            bgWidth = p.windowWidth;
            bgHeight = bgWidth / imgAspect;
          }
          
          const x = (p.windowWidth - bgWidth) / 2;
          const y = (p.windowHeight - bgHeight) / 2;
          
          p.image(backgroundImg, x, y, bgWidth, bgHeight);
        }

        p.draw = () => {
          if (backgroundVisible) {
            drawBackground();  // Clear and redraw background first
            
            // Calculate font size and padding based on background dimensions
            const fontScale = Math.min(bgWidth, bgHeight) * 0.012;
            const paddingX = bgWidth * 0.01;
            const paddingY = bgHeight * 0.005;
            
            // Draw the date/time
            p.fill(210);
            p.noStroke();
            p.textFont('Helvetica-Bold');  // Make date/time bold
            p.textSize(fontScale);
            p.textAlign(p.RIGHT, p.TOP);
            
            const now = new Date();
            const dateTimeString = now.toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'America/New_York'
            }).replace(/,/g, '')
              .replace(/(\d+)(?=\s+\d+:)/, '$1 ');
            
            // Draw date/time in top right
            const timeX = (p.windowWidth + bgWidth) / 2 - paddingX;
            const timeY = (p.windowHeight - bgHeight) / 2 + paddingY;
            p.text(dateTimeString, timeX, timeY);

            // Draw file names
            p.textAlign(p.LEFT, p.TOP);
            const startX = p.windowWidth / 2 + bgWidth * 0.0438;
            let currentY = (p.windowHeight - bgHeight) / 2 + bgHeight * 0.422;
            const lineHeight = fontScale * 1.49;
            const iconSize = fontScale * 1.2;

            // Set bold font for file names
            p.textFont('Helvetica-Bold');

            // Display up to 24 file names
            filesRef.current.slice(0, 24).forEach((file: any, index: number) => {
              // Draw blue highlight for first file
              if (index === 0) {
                p.noStroke();
                p.fill(0, 102, 255);
                const cornerRadius = fontScale * 0.4;
                p.rect(startX - fontScale * 3.5, currentY - fontScale/4, bgWidth * 0.3421, lineHeight, cornerRadius);
                p.fill(255);
              } else {
                p.fill(210);
              }
              
              // Draw file icon
              p.image(fileIcon, startX - fontScale * 2, currentY, iconSize, iconSize);
              
              // Draw filename closer to icon
              p.text(file.Key, startX - fontScale * 0.5, currentY + (iconSize - fontScale) / 2);
              currentY += lineHeight;
            });
          }
        };

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
          if (backgroundVisible) {
            drawBackground();
          } else {
            p.background(0);
          }
        };

      }, sketchRef.current!);

      return () => {
        sketch.remove();
      };
    });
  }, []);

  return <div ref={sketchRef}></div>;
};

export default P5Wrapper;