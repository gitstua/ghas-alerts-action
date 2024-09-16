const PRCommentMagicFooter = '<!-- AUTOMATED BY GHAS_ALERTS_PR_ACTION github.com/gitstua/ghas-alerts-actio -->';

// Function to fetch closed GHAS alerts
// optionally pass fromDate to filter alerts by date
async function fetchClosedGHASAlerts(repoName, fromDate, ghToken) {
  const { Octokit } = await import("@octokit/rest");
  const [owner, repo] = repoName.split('/');
  const octokit = new Octokit({ auth: ghToken });

  try {
      console.log(`Fetching closed GHAS alerts for MAIN in repo ${repoName} ${owner}/${repo}`);
      const { data: alertsMAIN } = await octokit.rest.codeScanning.listAlertsForRepo({
        owner,
        repo,
        state: 'closed'
      });

      console.log(fromDate);

      // Filter alerts by pull request number and closed date if necessary
      const filteredAlerts = alertsMAIN.filter(alert => {
        const alertDismissedAt = new Date(alert.dismissed_at);
        const fromDateObj = new Date(fromDate);
        return alertDismissedAt >= fromDateObj;
      });

      //print all alerts if env is set named showallalerts
      if (process.env.LOG_ALL_ALERTS) {
        console.log('All alerts:', alertsMAIN);
      }

      // add a first column to alerts named found_in which is set to MAIN
      for (let i = 0; i < filteredAlerts.length; i++) {
        filteredAlerts[i].found_in = 'MAIN';
      }

      return filteredAlerts;

  } catch (error) {

    //if the error is 404 then return empty array
    if (error.status === 404) {
      return [];
    }

    console.error(`Error fetching closed GHAS alerts: ${error}`);
    throw error;
  }
}

async function fetchClosedGHASAlertsForPR(prNumber, repoName, ghToken) {
  const { Octokit } = await import("@octokit/rest");
  const [owner, repo] = repoName.split('/');
  const octokit = new Octokit({ auth: ghToken });

  try {
    var theRef = `refs/pull/${prNumber}/merge`;
    console.log('theRef:', theRef);

      console.log(`Fetching closed GHAS alerts for PR ${prNumber} in repo ${repoName} ${owner}/${repo}`);
      const { data: alerts } = await octokit.rest.codeScanning.listAlertsForRepo({
        owner,
        repo,
        ref: theRef,
        state: 'closed'        
      });

      // add a first column to alerts named found_in which is set to the PR number
      for (let i = 0; i < alerts.length; i++) {
        alerts[i].found_in = "PR " + prNumber;
      }

      return alerts;

  } catch (error) {

    //if the error is 404 then return empty array
    if (error.status === 404) {
      return [];
    }

    console.error(`Error fetching closed GHAS alerts: ${error}`);
    throw error;
  }
}

async function getPreviousPRMergeDate(prNumber, repoName, ghToken) {
  const { Octokit } = await import("@octokit/rest");
  const [owner, repo] = repoName.split('/');
  const octokit = new Octokit({ auth: ghToken });

  // give a PR number find the latest merged PR merge date if it exists, return 2008-01-01 if it doesn't
  try {

    //if env variable is set LOG_ALL_PRS, then print all PRs
    if (process.env.LOG_ALL_PRS) {
      const { data: allPRs } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner,
        repo
      });
      console.log('All PRs:', allPRs);
    }

    // FIND the latest previous merged PR
    const { data: previousPRs } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      state: 'closed'
    });

    let latestMergedPR;
    if (previousPRs.length > 0) {
      //search for the latest merged pr in pulls
      latestMergedPR = previousPRs[0];
      for (let i = 1; i < previousPRs.length; i++) {
        if (previousPRs[i].merged_at > latestMergedPR.merged_at) {
          latestMergedPR = previousPRs[i];
        }
      }
    }

    if (latestMergedPR) {
      return latestMergedPR.closed_at;
    } else {
      return '2008-01-01'; //this would return the oldest date possible
    }

  } catch (error) {
    //if the error is 404 then return default date
    if (error.status === 404) {
      return '2008-01-01';
    }

    console.error(`Error fetching previous PR close date: ${error}`);
    throw error;
  }

}

async function addCommentToPR(prNumber, repoName, comment, ghToken) {
  const { Octokit } = await import("@octokit/rest");
  const [owner, repo] = repoName.split('/');
  const octokit = new Octokit({ auth: ghToken });

  comment += '\n\n' + PRCommentMagicFooter;
  // add current timetamp to comment (helps any debugging)
  comment += '\n\n<!-- LAST UPDATED:' + new Date().toISOString() + ' -->';

  try {
    //search for any comment already existing with magic footer
    const { data: comments } = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner,
      repo,
      issue_number: prNumber
    });

    //if comment already exists, update it
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].body.includes(PRCommentMagicFooter)) {
        await octokit.request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', {
          owner,
          repo,
          comment_id: comments[i].id,
          body: comment
        });
        return;
      }
    }

    //if comment doesn't exist, create it
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner,
      repo,
      issue_number: prNumber,
      body: comment
    });
  } catch (error) {
    console.error(`Error adding comment to PR: ${error}`);
    throw error;
  }
}

module.exports = {
  fetchClosedGHASAlerts,
  fetchClosedGHASAlertsForPR, 
  getPreviousPRMergeDate,
  addCommentToPR
};