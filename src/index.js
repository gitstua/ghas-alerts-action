const {
  fetchClosedGHASAlerts,
  getPreviousPRMergeDate,
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

    const previousPRCloseDate = await getPreviousPRMergeDate(prNumber, repoName, ghToken);

    console.log('Previous PR Close Date:', previousPRCloseDate);

    const closedAlerts = await fetchClosedGHASAlerts(prNumber, repoName, previousPRCloseDate, ghToken);
    console.log('Closed GHAS Alerts:', closedAlerts);

    // read CAUTION_MESSAGE from env variable and default to a generic message if not set
    let caution_message = process.env.CAUTION_MESSAGE || 'BY APPROVING THIS PR YOU ARE ACKNOWLEDGING THAT YOU ARE APPROVING THE ANY SECURITY ALERTS BEING DISMISSED INCLUDING:';

    // for the closed alerts build a string with url, dismissed_at, dismissed_by.login, dismissed_reason, and dismissed_comment
    let comment = '> [!CAUTION]\n';
    comment += `> ${caution_message}\n\n`;
    comment += '## BYPASSED Alerts\n\n';
    for (let i = 0; i < closedAlerts.length; i++) {
      const alert = closedAlerts[i];
      comment += `* [${alert.url}](${alert.url})\n`;
      comment += `  * **Dismissed At:** ${alert.dismissed_at}\n`;
      comment += `  * **Severity:** ${alert.rule.security_severity_level}\n`;
      comment += `  * **Description:** ${alert.rule.description}\n`;
      comment += `  * **Dismissed By:** ${alert.dismissed_by.login}\n`;
      comment += `  * **Dismissed Reason:** ${alert.dismissed_reason}\n`;
      comment += `  * **Dismissed Comment:** ${alert.dismissed_comment}\n`;
    }

    console.log('Comment:', comment);

    await addCommentToPR(prNumber, repoName, comment, ghToken);


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