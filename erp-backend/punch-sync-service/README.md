# Punch Sync Service

## Overview
The Punch Sync Service is a Node.js application designed to fetch punch records from a punch machine API and store them in a database. It ensures that only new records are inserted, avoiding duplicates, and provides logging for monitoring the process.

## Features
- Fetches punch records from a specified API.
- Inserts new records into the `punch_data` table in the database.
- Skips duplicate entries using "ON CONFLICT DO NOTHING".
- Logs the number of records fetched, inserted, and any errors encountered.

## Project Structure
```
punch-sync-service
├── src
│   ├── app.js               # Main entry point of the application
│   ├── config
│   │   ├── config.json      # Configuration details (API URL, DB connection)
│   │   └── index.js         # Exports configuration settings
│   ├── db
│   │   └── db.js            # Reusable database connection
│   ├── api
│   │   └── fetcher.js       # Functions to fetch data from the API
│   ├── services
│   │   ├── dataInserter.js   # Inserts cleaned punch data into the database
│   │   └── syncService.js    # Orchestrates data fetching and insertion
│   ├── scheduler
│   │   └── scheduler.js      # Sets up periodic data fetching
│   └── logger
│       └── logger.js         # Logs application events and errors
├── package.json              # npm configuration file
└── README.md                 # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd punch-sync-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the API URL and database connection settings in `src/config/config.json`.

4. Run the application:
   ```
   node src/app.js
   ```

## Usage
The application will automatically fetch punch records from the API at regular intervals defined in the scheduler. Logs will be generated to track the number of records fetched and inserted.

## Logging
Logs are maintained to provide insights into the application's performance, including:
- Total punches fetched
- Total punches inserted
- Total punches skipped due to duplication
- Any errors encountered during API calls or database operations

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.