module "ecr_api" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "3.2.1"

  repository_name = "${var.service_name}-api"

  repository_lifecycle_policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}
