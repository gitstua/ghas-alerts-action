# GHAS Alerts Action

This GitHub Action retrieves the GHAS (GitHub Advanced Security) alerts that have been closed prior to a specific pull request (PR).

## Usage

To use this action, you need to provide the PR number and the repository name as inputs. The action will then fetch and output the closed GHAS alerts.

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

- `closed-alerts`: A JSON array of the closed GHAS alerts.

## Development of this custom Action
1. Create a `.env` file in the root of the project with the following content:
```sh
GH_TOKEN=
```
Set the token to a PAT token with permissions to read alerts and write to pull requests.

2. Install the dependencies:
```sh
node install
```

3. Tun a test against a repo with the following command format:
```sh
node src/index.js 18 "gitstua-labs/08-bank-demo"
```

## License

This project is licensed under the [MIT License](LICENSE).
```

Please note that you need to replace `your-username` in the workflow file with your actual GitHub username or organization name.
