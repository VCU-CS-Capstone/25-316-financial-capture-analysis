import boto3
import pandas as pd
import matplotlib.pyplot as plt

#initialize dynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# query the Receipt table
receipt_table = dynamodb.Table('Receipt')

# scan table to retrieve all items
response = receipt_table.scan()
items = response['Items']

# extract 'total' values from the items
totals = [item['Total'] for item in items]

print(totals) # verifying that the totals are being properly extracted, delete this eventually

######### down here is where visualization starts ###########

# labels for the pie chart
labels = [item.get('ReceiptID', 'Unknown') for item in items]

# create the pie chart
plt.pie(totals, labels=labels, autopct='%1.1f%%', startangle=90)

# equal aspect ratio ensures that the pie chart is drawn as a circle
plt.axis('equal')

# show the pie chart
plt.show()
