module "dsql" {
  source = "./modules/dsql"

  service_name = var.service_name
  environment  = "dev"
  aws_region   = var.aws_region
}
