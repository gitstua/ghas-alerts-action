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

      - name: Get Closed GHAS Alerts
        id: ghas-alerts
        uses: your-username/ghas-alerts-action@v1
        with:
          pr-number: ${{ github.event.pull_request.number }}
          repo-name: ${{ github.repository }}
          gh-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Display Closed GHAS Alerts
        run: echo "Closed GHAS Alerts: ${{ steps.ghas-alerts.outputs.closed-alerts }}"
```

## Inputs

- `pr-number`: The number of the pull request.
- `repo-name`: The name of the repository.
- `gh-token`: (Optional) The GitHub token used for authentication. If not provided, the default `GITHUB_TOKEN` secret will be used.

## Outputs

- `closed-alerts`: A JSON array of the closed GHAS alerts.

## License

This project is licensed under the [MIT License](LICENSE).
```

Please note that you need to replace `your-username` in the workflow file with your actual GitHub username or organization name.
