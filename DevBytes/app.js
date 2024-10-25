const fs = require('fs').promises;

// Function to parse a log file 
async function parseLogFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const customerPages = {};

        const lines = data.trim().split('\n');
        // get the data from files
        for (let line of lines) {
            const [_, pageId, customerId] = line.split(',').map(str => str.trim());  // Trim whitespace

            if (!customerPages[customerId]) {
                customerPages[customerId] = new Set();
            }
            customerPages[customerId].add(pageId);
        }

        // Convert the Set of pages to an array for easier JSON storage
        const customerPagesArray = {};
        for (const customerId in customerPages) {
            customerPagesArray[customerId] = Array.from(customerPages[customerId]);
        }

        return customerPagesArray;
    } catch (error) {
        console.error(`Error parsing log file ${filePath}:`, error);
        throw error;
    }
}

// Function to store daily log data in a JSON file
async function storeLogData(day, logData) {
    const filePath = `day${day}_log.json`;
    try {
        await fs.writeFile(filePath, JSON.stringify(logData, null, 2));
        console.log(`Log data for Day ${day} stored in ${filePath}`);
    } catch (error) {
        console.error(`Error storing log data for Day ${day}:`, error);
        throw error;
    }
}

// Function to store loyal customer data in a JSON file
async function storeLoyalCustomers(loyalCustomers) {
    const filePath = 'loyal_customers.json';
    try {
        await fs.writeFile(filePath, JSON.stringify(loyalCustomers, null, 2));
        console.log(`Loyal customers stored in ${filePath}`);
    } catch (error) {
        console.error(`Error storing loyal customers:`, error);
        throw error;
    }
}

// Function to find loyal customers
async function findLoyalCustomers(logFileDay1, logFileDay2) {
    try {
        // Parse both log files
        const day1Visits = await parseLogFile(logFileDay1);
        const day2Visits = await parseLogFile(logFileDay2);

        // Store daily log data for reference
        await storeLogData(1, day1Visits);
        await storeLogData(2, day2Visits);

        const loyalCustomers = [];

        // Find customers that visited on both days and visited at least two unique pages
        for (let customerId in day1Visits) {
            if (day2Visits[customerId] && day1Visits[customerId].length >= 2 && day2Visits[customerId].length >= 2) {
                loyalCustomers.push(customerId);
            }
        }

        // Store loyal customers in a JSON file
        await storeLoyalCustomers(loyalCustomers);

        return loyalCustomers;
    } catch (error) {
        console.error('Error finding loyal customers:', error);
        throw error;
    }
}

// Example usage
(async () => {
    const logFileDay1 = 'day1_log.txt';
    const logFileDay2 = 'day2_log.txt';

    try {
        const loyalCustomers = await findLoyalCustomers(logFileDay1, logFileDay2);
        console.log('Loyal Customers:', loyalCustomers);
    } catch (error) {
        console.error('Failed to process loyal customers:', error);
    }
})();
