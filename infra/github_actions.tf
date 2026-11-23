locals {
  github_repository   = "3feet-lim/personal-blog"
  ecs_api_service_arn = "arn:aws:ecs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:service/${module.ecs_cluster.name}/${local.api_name}"
}

# Deploy role for GitHub Actions. The account already has the GitHub OIDC
# provider (token.actions.githubusercontent.com), so it is reused, not created.
module "github_actions_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role"
  version = "6.8.2"

  name            = "${var.service_name}-github-actions"
  use_name_prefix = false

  enable_github_oidc = true
  # Only pushes to main in this repository can assume the role.
  oidc_subjects = ["repo:${local.github_repository}:ref:refs/heads/main"]

  create_inline_policy = true
  inline_policy_permissions = {
    EcrLogin = {
      actions   = ["ecr:GetAuthorizationToken"]
      resources = ["*"]
    }
    EcrPush = {
      actions = [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:CompleteLayerUpload",
        "ecr:GetDownloadUrlForLayer",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart",
      ]
      resources = [module.ecr_api.repository_arn]
    }
    EcsTaskDefinition = {
      # These actions do not support resource-level permissions.
      actions   = ["ecs:DescribeTaskDefinition", "ecs:RegisterTaskDefinition"]
      resources = ["*"]
    }
    EcsService = {
      actions   = ["ecs:DescribeServices", "ecs:UpdateService"]
      resources = [local.ecs_api_service_arn]
    }
    PassTaskRoles = {
      actions   = ["iam:PassRole"]
      resources = [module.ecs_api.task_exec_iam_role_arn, module.ecs_api.tasks_iam_role_arn]
      condition = [{
        test     = "StringEquals"
        variable = "iam:PassedToService"
        values   = ["ecs-tasks.amazonaws.com"]
      }]
    }
    FrontendList = {
      actions   = ["s3:ListBucket"]
      resources = [module.frontend_bucket.s3_bucket_arn]
    }
    FrontendObjects = {
      actions   = ["s3:DeleteObject", "s3:PutObject"]
      resources = ["${module.frontend_bucket.s3_bucket_arn}/*"]
    }
    CloudFrontInvalidation = {
      actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
      resources = [module.cloudfront.cloudfront_distribution_arn]
    }
  }
}

output "github_actions_role_arn" {
  value = module.github_actions_role.arn
}
