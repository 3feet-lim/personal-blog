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
