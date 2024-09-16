# GHAS Alerts Action

This GitHub Action retrieves the GHAS (GitHub Advanced Security) Code Scanning alerts.

 The action will fetch the closed GHAS alerts on the main branch and also any on the specified PR and add these as a comment on the PR. If you re-run the action, it will update the existing comment with the latest information.

This can be helpful to reenforce to a reviwer of a PR that they are also responsible for any dismissed alerts.

> [!WARNING]
> This Action is provided as an untested sample only and is not officially supported as a product of GitHub. GitHub does not provide support for this Action.

> [!CAUTION]
> USE AT OWN RISK

## Usage

To use this action, you need to provide the PR number and the repository name as inputs. 

```yaml
name: GHAS Alerts

on:
  pull_request:
    types:
      - opened

jobs:
  ghas-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Update PR with comment of GHAS alerts
        id: ghas-alerts
        uses: gitstua/ghas-alerts-action@main
        with:
          pr-number: ${{ github.event.pull_request.number }}
          repo-name: ${{ github.repository }}
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

## Inputs

- `pr-number`: The number of the pull request.
- `repo-name`: The name of the repository.
- `gh-token`: (Optional) The GitHub token used for authentication. If not provided, the default `GITHUB_TOKEN` secret will be used.

## Outputs

None - will add/update the PR comment with details of the alerts.

## Development of this custom Action
1. Create a `.env` file in the root of the project with the following content:
```sh
GH_TOKEN=
PR_NUMBER=18
REPO_NAME=gitstua/demorepo12345
```
Set the token to a PAT token with permissions to read alerts and write to pull requests.
Set the PR_NUMBER to the number of a PR in the REPO_NAME repository.

2. Install the dependencies:
```sh
node install
```

3. Tun a test against a repo with the following command format:
```sh
node index.js
```

## License

This project is licensed under the [MIT License](LICENSE).

### Requirements
1. When a pr is APPROVED we want a person to accept the risk of all alerts which have been bypassed
2. We will add a comment to the PR with all alerts closed since the last PR was closed (those on the main branch)
3. We will add a comment to the PR with all alerts closed which were found in a scan on the new branch
