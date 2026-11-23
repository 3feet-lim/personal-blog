locals {
  origin_verify_header = "X-Origin-Verify"
}

# Shared secret that CloudFront sends to the ALB. Requests without it are
# rejected, so the ALB cannot be reached through another CloudFront.
resource "random_password" "origin_verify" {
  length  = 32
  special = false
}

module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "10.5.1"

  name    = "${var.service_name}-api"
  vpc_id  = module.vpc.vpc_id
  subnets = module.vpc.public_subnets

  enable_deletion_protection = false

  create_security_group = false
  security_groups       = [module.alb_sg.id]

  listeners = {
    http = {
      port     = 80
      protocol = "HTTP"

      fixed_response = {
        content_type = "text/plain"
        message_body = "Forbidden"
        status_code  = "403"
      }

      rules = {
        from-cloudfront = {
          priority = 1

          actions = [{
            forward = {
              target_group_key = "api"
            }
          }]

          conditions = [{
            http_header = {
              http_header_name = local.origin_verify_header
              values           = [random_password.origin_verify.result]
            }
          }]
        }
      }
    }
  }

  target_groups = {
    api = {
      name        = "${var.service_name}-api"
      protocol    = "HTTP"
      port        = 8000
      target_type = "ip"

      # ECS registers task IPs itself.
      create_attachment = false

      health_check = {
        path    = "/health"
        matcher = "200"
      }
    }
  }
}
