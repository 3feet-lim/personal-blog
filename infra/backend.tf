terraform {
  backend "s3" {
    bucket       = "smlim-terraform-state-bucket"
    key          = "personal-blog/terraform.tfstate"
    region       = "ap-northeast-2"
    encrypt      = true
    use_lockfile = true
  }
}
