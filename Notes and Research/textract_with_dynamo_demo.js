const { TextractClient, AnalyzeExpenseCommand } = require('@aws-sdk/client-textract');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const fs = require('fs');

// Initialize AWS Textract and DynamoDB clients
const textractClient = new TextractClient({ region: 'us-east-1' });
const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });

// Function to extract receipt data using Textract's AnalyzeExpense API
async function extractReceiptData(imageBytes) {
    const params = {
        Document: {
            Bytes: imageBytes,  // Image in bytes
        }
    };

    const command = new AnalyzeExpenseCommand(params);
    const data = await textractClient.send(command);
    return data.ExpenseDocuments;  // This contains the structured data from the receipt
}

// Function to parse the structured data from AnalyzeExpense
function parseExpenseData(expenseDocuments) {
    let receiptData = {
        merchant: '',
        date: '',
        totalAmount: '',
        userID: 'user-001'  // Placeholder UserID, will in the future be updated differently
    };

    // Loop through each document
    expenseDocuments.forEach(document => {
        document.SummaryFields.forEach(field => {
            const type = field.Type.Text;
            const value = field.ValueDetection.Text;

            if (type === "MERCHANT_NAME") {
                receiptData.merchant = value;
            }
            if (type === "TOTAL") {
                receiptData.totalAmount = value.replace(/[^0-9.]/g, '');  // Clean up total amount/remove currency symbols
            }
            if (type === "INVOICE_RECEIPT_DATE" || type === "DATE") {
                receiptData.date = value;
            }
        });
    });

    return receiptData;
}

// Function to store receipt data in DynamoDB
async function storeReceiptInDynamoDB(receiptData) {
    // Create the DynamoDB PutItem parameters
    const params = {
        TableName: 'Receipts',
        Item: {
            'ReceiptID': { S: 'receipt-' + new Date().getTime().toString() },  // Generate a unique ReceiptID
            'UserID': { S: receiptData.userID },
            'Merchant': { S: receiptData.merchant },
            'Date': { S: receiptData.date },
            'TotalAmount': { N: receiptData.totalAmount }  // Ensure the total amount is numeric
        }
    };

    const command = new PutItemCommand(params);
    await dynamoClient.send(command);
    console.log('Receipt data successfully stored in DynamoDB');
}

// Main function to process a receipt
async function processReceipt(imagePath) {
    const imageBytes = fs.readFileSync(imagePath);

    const expenseData = await extractReceiptData(imageBytes);

    // Parse the structured data from Textract AnalyzeExpense API
    const parsedReceiptData = parseExpenseData(expenseData);

    // Store the parsed data into DynamoDB
    await storeReceiptInDynamoDB(parsedReceiptData);
}

// Run the process with the example image
processReceipt('C:/Users/VCU/Desktop/SCHOOL/fall 24/capstone/textract demo/20240923_150101.jpg').catch(console.error);
