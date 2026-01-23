# Terraform Variables for PakLoad PostgreSQL EC2 Instance

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-north-1"
}

variable "vpc_id" {
  description = "VPC ID where EC2 will be deployed"
  type        = string
  default     = "vpc-03b308cb0f7b1bb02"
}

variable "subnet_id" {
  description = "Subnet ID for EC2 instance (leave empty to use default)"
  type        = string
  default     = "" # Will use default subnet in VPC
}

variable "my_ip" {
  description = "Your IP address for SSH and PostgreSQL access (CIDR format)"
  type        = string
  # You will provide this when running terraform apply
  # Example: "203.0.113.0/32"
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
  # You will provide this when running terraform apply
}

variable "key_name" {
  description = "AWS EC2 Key Pair name for SSH access"
  type        = string
  # You will provide this when running terraform apply
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro" # Free tier eligible
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "pakload"
}
