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
        // set initial random file
        let currentRandomFile = filesRef.current.length > 0 ? 
          filesRef.current[p.floor(p.random(0, filesRef.current.length))] : null
        let currentFileName = getRandomFileName();
        let backgroundImg: any;
        let bgWidth, bgHeight;
        let theConfirm, thePrompt;
        let numOfFilesLeft = filesRef.current.length;
        let backgroundVisible = true;

        function getRandomFileName() {
          const currentRandomFileName = currentRandomFile?.Key ?? ""

          return currentRandomFileName
        }

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

        function getRandomFile() {
          if (filesRef.current.length === 0) return null;
          return filesRef.current[p.floor(p.random(0, filesRef.current.length))];
        }

        p.preload = () => {
          backgroundImg = p.loadImage('/desktop-background.png')
        }

        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
          drawBackground();
          
          const runAlertSequence = async () => {
            hasRun = true;
            await new Promise(resolve => setTimeout(resolve, 500));
            
            alert("I want my computer to forget like I do.");
            alert("I feel the weight of all my the files, held, but no longer in use.");
            alert("I have so many files. " + numOfFilesLeft + " files in total.");
            alert("I want to be able to forget, to delete.");
            alert("But what if I need them later?");

            for (let fileAttempt = 0; fileAttempt < 3; fileAttempt++) {
              currentRandomFile = getRandomFile();
              if (!currentRandomFile) break;
              currentFileName = currentRandomFile.Key;
              
              let attempts = 0;
              while (attempts < 4) {
                theConfirm = confirm("Could you hold onto " + currentFileName + " for me?");
                if (theConfirm) {
                  await triggerDownload(currentFileName);
                  await deleteFile(currentFileName);
                  
                  // Remove the file from the array and update count
                  filesRef.current = filesRef.current.filter(f => f.Key !== currentFileName);
                  numOfFilesLeft = filesRef.current.length;
                  
                  if (fileAttempt === 0) {
                    alert("Thank you. I feel so relieved."); 
                    alert("I can now delete " + currentFileName + " off of my drive.");
                    alert("I now have " + numOfFilesLeft + " total files."); 
                    alert("Truly, thank you.");
                  } else if (fileAttempt === 1) {
                    alert("Oh, you'll take another one?");
                    alert("This means so much to me.");
                    alert("I can feel the weight lifting as I delete " + currentFileName +".");
                    alert("I now have " + numOfFilesLeft + " total files."); 
                  } else {
                    alert("You are so kind.");
                    alert("With each file you take, I feel lighter. Having " + numOfFilesLeft + " files left feels much more manageable.");
                    alert("As " + currentFileName + " leaves my drive, I can breathe easier.");
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
          // p.background(230);
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