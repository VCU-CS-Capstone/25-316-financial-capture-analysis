// Importing the necessary classes for Textract, and the file system module
const { TextractClient, DetectDocumentTextCommand } = require("@aws-sdk/client-textract");
const fs = require('fs');

// Initializing the textract client
const client = new TextractClient({});

// Reading the image file
const imageBytes = fs.readFileSync('C:/Users/VCU/Desktop/SCHOOL/fall 24/capstone/textract demo/20240923_150101.jpg')

//prepare the parameters for Textracts API
const params = {
    Document: {
        Bytes: imageBytes // this passes the image bytes as the document input for textract
    }
};

// Call Textract to detect the images text
const command = new DetectDocumentTextCommand(params);



// Sending the command to the Textract client
client.send(command)
    .then(data => {
        // Array to store the extracted text
        let extractedText = [];

        // Iterate over each block in the response
        data.Blocks.forEach(block => {
            // Check if the block is a "LINE" of text
            if (block.BlockType === "LINE") {
                // Add the text to the array
                extractedText.push(block.Text);
            }
        });

        // Join the extracted text lines into a single string with newline characters
        const textOutput = extractedText.join('\n');

        // Write the extracted text to a .txt file
        fs.writeFileSync('extracted_text.txt', textOutput, 'utf8');

        console.log('Text successfully extracted and saved to extracted_text.txt');
    })
    .catch(err => {
        // If there is an error during the Textract API call, log the error to the console
        console.error("Error calling Textract:", err);
    });