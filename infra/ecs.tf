locals {
  site_url    = "https://${module.cloudfront.cloudfront_distribution_domain_name}"
  api_name    = "${var.service_name}-api"
  api_db_user = "blog_app"

  # Created by hand with `aws ssm put-parameter` so the value never passes
  # through Terraform code or state.
  google_client_secret_arn = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${var.service_name}/dev/google-client-secret"
}

resource "random_password" "session_secret" {
  length  = 64
  special = false
}

# Run whichever API image was pushed to ECR most recently.
data "aws_ecr_image" "api" {
  repository_name = module.ecr_api.repository_name
  most_recent     = true
}

module "session_secret" {
  source  = "terraform-aws-modules/ssm-parameter/aws"
  version = "2.1.2"

  name        = "/${var.service_name}/dev/session-secret"
  description = "Signing key for API session cookies"
  secure_type = true
  value       = random_password.session_secret.result
}

module "ecs_cluster" {
  source  = "terraform-aws-modules/ecs/aws//modules/cluster"
  version = "7.6.3"

  name                  = var.service_name
  create_security_group = false

  cluster_capacity_providers = ["FARGATE"]
}

module "ecs_api" {
  source  = "terraform-aws-modules/ecs/aws//modules/service"
  version = "7.6.3"

  name        = local.api_name
  cluster_arn = module.ecs_cluster.arn

  cpu    = 256
  memory = 512

  # Images are built on Apple Silicon.
  runtime_platform = {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  # Only read when the service is first created; later changes are ignored by
  # the module and must be made with `aws ecs update-service`.
  desired_count      = 1
  enable_autoscaling = false

  subnet_ids            = module.vpc.public_subnets
  assign_public_ip      = true
  create_security_group = false
  security_group_ids    = [module.api_sg.id]

  load_balancer = {
    api = {
      target_group_arn = module.alb.target_groups["api"].arn
      container_name   = "api"
      container_port   = 8000
    }
  }

  task_exec_iam_role_name            = "${local.api_name}-exec"
  task_exec_iam_role_use_name_prefix = false
  task_exec_ssm_param_arns = [
    module.session_secret.ssm_parameter_arn,
    local.google_client_secret_arn,
  ]

  tasks_iam_role_name            = "${local.api_name}-task"
  tasks_iam_role_use_name_prefix = false
  tasks_iam_role_statements = [
    {
      sid       = "DsqlConnect"
      actions   = ["dsql:DbConnect"]
      resources = [module.dsql.cluster_arn]
    },
    {
      sid       = "AlbumsList"
      actions   = ["s3:ListBucket"]
      resources = [module.albums_bucket.s3_bucket_arn]
    },
    {
      sid       = "AlbumsObjects"
      actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
      resources = ["${module.albums_bucket.s3_bucket_arn}/*"]
    },
  ]

  container_definitions = {
    api = {
      image     = "${module.ecr_api.repository_url}@${data.aws_ecr_image.api.image_digest}"
      essential = true

      # Multipart uploads spool to /tmp, so the root filesystem stays writable.
      readonlyRootFilesystem = false

      portMappings = [{
        name          = "http"
        containerPort = 8000
        protocol      = "tcp"
      }]

      environment = [
        { name = "ENVIRONMENT", value = "production" },
        { name = "SITE_NAME", value = "BigJade's Notes" },
        { name = "FRONTEND_URL", value = local.site_url },
        { name = "CORS_ORIGINS", value = local.site_url },
        { name = "DSQL_ENDPOINT", value = module.dsql.endpoint },
        { name = "DSQL_REGION", value = var.aws_region },
        { name = "DSQL_USER", value = local.api_db_user },
        { name = "DB_SCHEMA", value = "blog" },
        { name = "S3_BUCKET", value = module.albums_bucket.s3_bucket_id },
        { name = "S3_REGION", value = var.aws_region },
        { name = "SESSION_HTTPS_ONLY", value = "true" },
        { name = "ENABLE_DEMO_AUTH", value = "false" },
        { name = "DEFAULT_AUTH_PROVIDER", value = "google" },
        { name = "GOOGLE_REDIRECT_URI", value = "${local.site_url}/api/auth/callback/google" },
        { name = "GOOGLE_CLIENT_ID", value = var.google_client_id },
        { name = "BOOTSTRAP_ADMIN_EMAILS", value = var.bootstrap_admin_emails },
      ]

      secrets = [
        { name = "SESSION_SECRET", valueFrom = module.session_secret.ssm_parameter_arn },
        { name = "GOOGLE_CLIENT_SECRET", valueFrom = local.google_client_secret_arn },
      ]
    }
  }
}
