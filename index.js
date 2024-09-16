const {
  fetchClosedGHASAlerts,
  fetchClosedGHASAlertsForPR,
  getPreviousPRMergeDate,
  addCommentToPR
} = require('./utils');

const core = require('@actions/core');

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


    // get list of alerts dismissed on main (uses previous date to filter)
    const closedAlertsMAIN = await fetchClosedGHASAlerts(repoName, previousPRCloseDate, ghToken);
    console.log('Closed GHAS Alerts on MAIN:', closedAlertsMAIN);

    //get list of alerts dismissed on this PR (uses PR number to filter)
    const closedAlertsPR = await fetchClosedGHASAlertsForPR(prNumber, repoName, ghToken);
    console.log('Closed GHAS Alerts in PR:', closedAlertsPR);


     // Combine all the above into one list closedAlerts
    const closedAlerts = (closedAlertsMAIN || []).concat(closedAlertsPR || []);

    // read CAUTION_MESSAGE from env variable and default to a generic message if not set
    let caution_message = process.env.CAUTION_MESSAGE || 'BY APPROVING THIS PR YOU ARE ACKNOWLEDGING THAT YOU ARE APPROVING THE ANY SECURITY ALERTS BEING DISMISSED INCLUDING:';

    // for the closed alerts build a string with url, dismissed_at, dismissed_by.login, dismissed_reason, and dismissed_comment
    let comment = '> [!CAUTION]\n';
    comment += `> ${caution_message}\n\n`;
    comment += '## BYPASSED Alerts\n\n';
    for (let i = 0; i < closedAlerts.length; i++) {
      const alert = closedAlerts[i];
      comment += `* [${alert.html_url}](${alert.html_url})\n`;
      comment += `  * **Found In:** ${alert.found_in}\n`;
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

let prNumber = process.env.PR_NUMBER;
let repoName = process.env.REPO_NAME;

// If the environment variables are not set, then try to get them from the inputs
if (!prNumber || !repoName) {
  try{
    prNumber = core.getInput('prNumber');
    repoName = core.getInput('repoName');
 }
 catch (error) {
   console.error('Error:', error.message);
   process.exit(1);
 } 
}

const ghToken = process.env.GH_TOKEN;

// if ghToken is null, then try to get it from GITHUB_TOKEN environment variable



console.log(`Pull Request Number: ${prNumber}`);
console.log(`Repository Name: ${repoName}`);

// if ghToken is not provided the throw error
if (!ghToken) {
  throw new Error("Parameter 'ghToken' is required to be set as an environment variable named GH_TOKEN");
}

run(prNumber, repoName, ghToken);