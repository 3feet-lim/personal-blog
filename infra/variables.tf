variable "aws_region" {
  type    = string
  default = "ap-northeast-2"
}

variable "project" {
  type    = string
  default = "personal-blog"
}

variable "service_name" {
  type    = string
  default = "bigjade-blog"
}

variable "tags" {
  type    = map(string)
  default = {}
}


variable "google_client_id" {
  description = "Google OAuth client ID. Not secret; the client secret lives in SSM."
  type        = string
  default     = "877039707576-5jfuk0ebdhbbeavf0ggbqs2dmnf1tted.apps.googleusercontent.com"
}

variable "bootstrap_admin_emails" {
  description = "Comma-separated emails that become admins on their first Google login. Set in terraform.tfvars."
  type        = string
}
