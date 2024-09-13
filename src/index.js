const { 
  fetchClosedGHASAlerts,
  getPreviousPRCloseDate,
  addCommentToPR
 } = require('./utils');


async function run(prNumber, repoName, ghToken) {
  try {
    if (!prNumber) {
      throw new Error("Parameter 'prNumber' is required");
    }
    if (!repoName) {
        throw new Error("Parameter 'repoName' is required");
    }
    if (!ghToken) {
        throw new Error("Parameter 'ghToken' is required");
    }

    const previousPRCloseDate = getPreviousPRCloseDate(prNumber, repoName, ghToken);

    console.log('Previous PR Close Date:', previousPRCloseDate);



    const closedAlerts = await fetchClosedGHASAlerts(prNumber, repoName, ghToken);
    console.log('Closed GHAS Alerts:', closedAlerts);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get inputs from the workflow
// const prNumber = process.env.PR_NUMBER;
// const repoName = process.env.REPO_NAME;

// Load environment variables from .env file (for Development)
require('dotenv').config();

// Access command-line arguments
const args = process.argv.slice(2); // Skip the first two default arguments

// Extract parameters
const prNumber = args[0];
const repoName = args[1];
const ghToken = process.env.GH_TOKEN;

console.log(`Pull Request Number: ${prNumber}`);
console.log(`Repository Name: ${repoName}`);

// if ghToken is not provided the throw error
if (!ghToken) {
  throw new Error("Parameter 'ghToken' is required to be set as an environment variable named GH_TOKEN");
}

run(prNumber, repoName, ghToken);