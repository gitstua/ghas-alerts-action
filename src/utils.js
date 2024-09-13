// (async () => {
  
  // Function to fetch closed GHAS alerts
  // optionally pass fromDate to filter alerts by date
 async function fetchClosedGHASAlerts(prNumber, repoName, fromDate, ghToken) {
  const { Octokit } = await import("@octokit/rest");
    const [owner, repo] = repoName.split('/');
    const octokit = new Octokit({ auth: ghToken });

    try {
      const { data: alerts } = await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
        owner,
        repo,
        state: 'closed'
      });

      // Filter alerts by pull request number and closed date if necessary
      const filteredAlerts = alerts.filter(alert => {
        const alertClosedDate = new Date(alert.closed_at);
        const fromDateObj = new Date(fromDate);
        return alert.number === prNumber && alertClosedDate >= fromDateObj;
      });

      return filteredAlerts;
    } catch (error) {
      console.error(`Error fetching closed GHAS alerts: ${error}`);
      throw error;
    }
  }

  async function getPreviousPRCloseDate(prNumber, repoName, ghToken) {
    const { Octokit } = await import("@octokit/rest");
    const [owner, repo] = repoName.split('/');
    const octokit = new Octokit({ auth: ghToken });

    // give a PR number find the previous PR close date if it exists, return 2008-01-01 if it doesn't
    try {
      const { data: previousPRs } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner,
        repo,
        state: 'closed'
      });

      const previousPR = previousPRs.find(pr => pr.number === prNumber);
      if (previousPR) {
        return previousPR.closed_at;
      } else {
        return '2008-01-01';
      }
    } catch (error) {
      console.error(`Error fetching previous PR close date: ${error}`);
      throw error;
    }

  }

  async function addCommentToPR(prNumber, repoName, comment, ghToken) {
    const { Octokit } = await import("@octokit/rest");
    const [owner, repo] = repoName.split('/');
    const octokit = new Octokit({ auth: ghToken });

    try {
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
    getPreviousPRCloseDate,
    addCommentToPR
  };

// })();
