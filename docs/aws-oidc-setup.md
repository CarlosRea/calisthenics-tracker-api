# AWS GitHub OIDC Deployment Role Setup

This guide explains how to configure AWS to permit GitHub Actions to deploy without long-lived access keys using OpenID Connect (OIDC).

## 1. Create Identity Provider in AWS IAM

1. In the AWS Management Console, open **IAM** > **Identity providers**.
2. Click **Add provider**:
   - **Provider type:** OpenID Connect
   - **Provider URL:** `https://token.actions.githubusercontent.com`
   - **Audience:** `sts.amazonaws.com`

---

## 2. IAM Role Trust Policy

Create an IAM Role (e.g., `GitHubActionsDeploymentRole`) with the following Trust Relationship:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<YOUR_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:CarlosRea/calisthenics-tracker-api:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

---

## 3. GitHub Repository Secrets & Variables

In your GitHub repository (**Settings** > **Secrets and variables** > **Actions**):

### Secrets
* `AWS_OIDC_ROLE_ARN`: `arn:aws:iam::<YOUR_ACCOUNT_ID>:role/GitHubActionsDeploymentRole`

### Variables
* `AWS_REGION`: `us-east-1` (or your preferred region)
* `APP_URL`: `https://your-production-domain.com` (leave unset to default to local health validation)
