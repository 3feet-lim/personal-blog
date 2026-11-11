module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "6.7.3"

  name = var.service_name
  cidr = "10.0.0.0/24"

  azs             = ["ap-northeast-2a", "ap-northeast-2c"]
  public_subnets  = ["10.0.0.0/26", "10.0.0.64/26"]
  private_subnets = ["10.0.0.128/26", "10.0.0.192/26"]

  enable_nat_gateway = false
}
