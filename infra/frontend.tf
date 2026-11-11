data "aws_caller_identity" "current" {}

module "frontend_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "5.17.0"

  bucket = "${var.service_name}-frontend"

  attach_policy = true
  policy        = data.aws_iam_policy_document.frontend_bucket.json
}

module "cloudfront" {
  source  = "terraform-aws-modules/cloudfront/aws"
  version = "6.7.1"

  comment             = "${var.service_name} frontend"
  default_root_object = "index.html"
  price_class         = "PriceClass_200"

  origin = {
    frontend = {
      domain_name               = module.frontend_bucket.s3_bucket_bucket_regional_domain_name
      origin_access_control_key = "s3"
    }
  }

  # Static export uses trailingSlash, so "/blog/post/" must be served from
  # "/blog/post/index.html" in the bucket.
  cloudfront_functions = {
    index-rewrite = {
      name    = "${var.service_name}-index-rewrite"
      publish = true
      code    = <<-EOT
        function handler(event) {
          var request = event.request;
          var uri = request.uri;
          if (uri.endsWith("/")) {
            request.uri = uri + "index.html";
          } else if (!uri.split("/").pop().includes(".")) {
            request.uri = uri + "/index.html";
          }
          return request;
        }
      EOT
    }
  }

  default_cache_behavior = {
    target_origin_id       = "frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_name      = "Managed-CachingOptimized"

    function_association = {
      viewer-request = {
        function_key = "index-rewrite"
      }
    }
  }

  viewer_certificate = {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1"
  }
}

data "aws_iam_policy_document" "frontend_bucket" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.frontend_bucket.s3_bucket_arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [module.cloudfront.cloudfront_distribution_arn]
    }
  }
}
