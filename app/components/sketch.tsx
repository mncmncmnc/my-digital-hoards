'use client'
import { useEffect, useRef } from 'react';
import p5 from 'p5';

const P5Wrapper = ({ currentFiles }: { currentFiles: any[]}) => {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sketch = new p5((p: p5) => {
        // set initial random file
        let buttonOK: p5.Element;
        let buttonCancel: p5.Element;
        let popupWidth = 500;
        let popupHeight = 180;
        let popupX: number, popupY: number;
        let fontSize = 16;
        let popupVisible = true;
        let buttonsVisible = true;
        let currentRandomFile = currentFiles.length > 0 ? currentFiles[p.floor(p.random(0, currentFiles.length))] : null
        let currentFileName = getRandomFileName();
        let message = "Would you like to download " + currentFileName + "? I do not remember taking it.";

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

      function wrapText(text: string, maxWidth: number) {
        let words = text.split(" ");
        let lines = [];
        let currentLine = "";

        for (let i = 0; i < words.length; i++) {
          let testLine = currentLine + words[i] + " ";
          let testWidth = p.textWidth(testLine);
          if (testWidth > maxWidth && currentLine !== "") {
            lines.push(currentLine);
            currentLine = words[i] + " ";
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        return lines;
      }

      async function triggerDownload(fileName: string) {
        try {
            const response = await fetch(`/api/s3?key=${encodeURIComponent(fileName)}`)
            const blob = await response.blob();

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

      function flashPopupAndButtons() {
        popupVisible = false;
        buttonsVisible = false;
        setTimeout(() => {
          popupVisible = true;
          buttonsVisible = true;
        }, 300);
      }

      function updatePopupPosition() {
        popupWidth = Math.min(500, p.width * 0.8);
        popupHeight = Math.min(180, p.height * 0.4);
        popupX = p.width / 2 - popupWidth / 2;
        popupY = p.height / 2 - popupHeight / 2;
        positionButtons();
      }

      function positionButtons() {
        if (buttonOK && buttonCancel) {
          buttonOK.position(popupX + popupWidth - 80, popupY + popupHeight - 40);
          buttonCancel.position(popupX + popupWidth - 150, popupY + popupHeight - 40);
        }
      }

      function okPressed() {
        flashPopupAndButtons();
        currentFileName = getRandomFileName();
        message = "Thank you. The file has been deleted off my device and is now on yours. Would you like to download file " + 
                 currentFileName + "? I do not remember taking it. I have " + getNumberOfFilesLeft() + " files left.";
        triggerDownload(currentFileName);
        // set new random file
        currentRandomFile = currentFiles.length > 0 ? currentFiles[p.floor(p.random(0, currentFiles.length))] : null
      }

      function cancelPressed() {
        flashPopupAndButtons();
        message = "Are you sure? " + currentFileName + " is " + getRandomFileFact() + ". You probably want it.";
      }

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.textAlign(p.LEFT, p.TOP);
        p.textFont('Helvetica');
        updatePopupPosition();

        buttonOK = p.createButton('OK');
        buttonOK.size(70, 30);
        buttonOK.style('background-color', '#28282800');
        buttonOK.style('color', '#2196F3');
        buttonOK.style('border', 'none');
        buttonOK.style('font-family', 'Helvetica');
        buttonOK.style('font-size', fontSize + 'px');
        buttonOK.style('font-weight', 'bold');
        buttonOK.mousePressed(okPressed);

        buttonCancel = p.createButton('Cancel');
        buttonCancel.size(70, 30);
        buttonCancel.style('background-color', '#28282800');
        buttonCancel.style('color', '#2196F3');
        buttonCancel.style('border', 'none');
        buttonCancel.style('font-family', 'Helvetica');
        buttonCancel.style('font-size', fontSize + 'px');
        buttonCancel.mousePressed(cancelPressed);

        positionButtons();
      };

      p.draw = () => {
        p.background(230);

        if (popupVisible) {
          (p.drawingContext as any).shadowColor = p.color(255, 255, 255, 150);
          (p.drawingContext as any).shadowBlur = 50;
          (p.drawingContext as any).shadowOffsetX = 0;
          (p.drawingContext as any).shadowOffsetY = 0;

          p.fill(40);
          p.rect(popupX, popupY, popupWidth, popupHeight, 10);

          (p.drawingContext as any).shadowColor = p.color(0, 0);

          p.fill(255);
          p.textSize(fontSize);
          let textX = popupX + 20;
          let textY = popupY + 40;

          let wrappedText = wrapText(message, popupWidth - 40);
          let lineHeight = fontSize * 1.5;

          wrappedText.forEach((line, i) => {
            p.text(line, textX, textY + i * lineHeight);
          });
        }

        if (buttonsVisible) {
          buttonOK.show();
          buttonCancel.show();
        } else {
          buttonOK.hide();
          buttonCancel.hide();
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        updatePopupPosition();
      };

    }, sketchRef.current!);

    return () => {
      sketch.remove();
    };
  }, [currentFiles]);

  return <div ref={sketchRef}></div>;
};

export default P5Wrapper;