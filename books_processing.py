import pandas as pd
import csv
# import numpy

# Read into dataframe
rating_fp = '/Users/ntashi/Documents/MCIT/CIT-550/Final Project/modified_books_rating.csv'
data_fp = '/Users/ntashi/Documents/MCIT/CIT-550/Final Project/modified_books_data.csv'

df1 = pd.read_csv(rating_fp)
df2 = pd.read_csv(data_fp)

# Define lambda function to convert fractions to decimals
def convert_to_decimal(x):
    try:
        return eval(x)
    except (ZeroDivisionError, SyntaxError):
        return 0.0

# Apply the function to the 'helpfulness' column
df1['helpfulness'] = df1['helpfulness'].apply(convert_to_decimal)

# Apply strict datetime format to 'publishedDate' column
df2['publishedDate'] = pd.to_datetime(df2['publishedDate'], errors='coerce')
df2['publishedDate'] = df2['publishedDate'].dt.strftime('%Y-%m-%d')

# Replace empty entries in ratingsCount with 0
df2['ratingsCount'].replace('', 0, inplace=True)
# Replace NaN values (if any) with 0
df2['ratingsCount'] = df2['ratingsCount'].replace('', 0)

# Save the DataFrame back to same csv file
df1.to_csv(rating_fp, index=False)
df2.to_csv(data_fp, index=False)


input_file = '/Users/ntashi/Documents/MCIT/CIT-550/Final Project/modified_books_data.csv'
output_file = '/Users/ntashi/Documents/MCIT/CIT-550/Final Project/books_data_output.csv'

# Open the input and output CSV files
with open(input_file, 'r', newline='') as csvfile, open(output_file, 'w', newline='') as outputcsv:
    reader = csv.DictReader(csvfile)
    fieldnames = ['title'] + ['author']  # Add a new field for author
    
    writer = csv.DictWriter(outputcsv, fieldnames=fieldnames)
    writer.writeheader()
    
    for row in reader:
        authors = row['authors'].split(', ')  # Split authors into a list
        title = row['title']  # get book title

        for author in authors:
            new_row = {key: '' for key in fieldnames}  # Create a blank row
            new_row['author'] = author  # Add author to the new row
            new_row['title'] = title   # Add title to the new row
            writer.writerow(new_row)  # Write the new row to the output file
