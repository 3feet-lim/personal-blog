module "albums_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "5.17.0"

  bucket = "${var.service_name}-albums"

  lifecycle_rule = [{
    id      = "intelligent-tiering"
    enabled = true
    filter  = {}

    transition = [{
      days          = 0
      storage_class = "INTELLIGENT_TIERING"
    }]
  }]
}
