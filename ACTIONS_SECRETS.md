# GitHub Actions secrets checklist

Use this as a reference for configuring repository or environment secrets required by the workflows.

## Required for container build/publish and Portainer redeploy (`.github/workflows/docker-publish.yml`)
- `GHCR_PAT` or `GITHUB_TOKEN` (implicit) – GitHub registry auth (the workflow uses `${{ secrets.GITHUB_TOKEN }}` by default).
- `PORTAINER_URL` – Base URL of the Portainer instance (e.g., `https://portainer.example.com`).
- `PORTAINER_STACK_ID` – Stack ID to redeploy.
- `PORTAINER_ENDPOINT_ID` – Endpoint ID in Portainer for the target environment.
- `PORTAINER_API_KEY` – API key with permission to update the stack.
- `POSTGRES_USER` – Database username injected into the stack.
- `POSTGRES_PASSWORD` – Database password injected into the stack.
- `POSTGRES_DB` – Database name injected into the stack.
- `DATABASE_URL` – Full DB connection string passed to the app.
- `JWT_SECRET` – JWT signing secret for the API.
- `PGADMIN_DEFAULT_EMAIL` – pgAdmin admin email.
- `PGADMIN_DEFAULT_PASSWORD` – pgAdmin admin password.
- `GRAFANA_ADMIN_USER` – Grafana admin username.
- `GRAFANA_ADMIN_PASSWORD` – Grafana admin password.

## Optional/implicit
- `PROMETHEUS_PORT` – Override if Prometheus port 9091 is taken (can be env or secret).
- Any additional environment overrides referenced in `docker-compose.yml` if you change the stack.

Notes:
- Do not commit real secret values; store them in GitHub repo/encrypted secrets or environment secrets.
- Ensure the Portainer API key scope allows stack updates for the specified stack/endpoint.
