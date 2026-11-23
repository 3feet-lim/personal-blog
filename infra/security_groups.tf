data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

module "alb_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "6.0.0"

  name            = "${var.service_name}-alb"
  use_name_prefix = false
  description     = "ALB reachable only from CloudFront"
  vpc_id          = module.vpc.vpc_id

  ingress_rules = {
    http-from-cloudfront = {
      from_port      = 80
      to_port        = 80
      prefix_list_id = data.aws_ec2_managed_prefix_list.cloudfront.id
    }
  }

  egress_rules = {
    to-api = {
      from_port                    = 8000
      to_port                      = 8000
      referenced_security_group_id = module.api_sg.id
    }
  }
}

module "api_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "6.0.0"

  name            = "${var.service_name}-api"
  use_name_prefix = false
  description     = "API tasks reachable only from the ALB"
  vpc_id          = module.vpc.vpc_id

  ingress_rules = {
    api-from-alb = {
      from_port                    = 8000
      to_port                      = 8000
      referenced_security_group_id = module.alb_sg.id
    }
  }

  # Tasks pull images from ECR and reach DSQL, S3 and Google OAuth directly.
  egress_rules = {
    all = {
      ip_protocol = "-1"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }
}
