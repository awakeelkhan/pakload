# ============================================================================
# PakLoad - Terraform Variables
# ============================================================================

# AWS Configuration
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "pakload"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# EC2 Configuration
variable "instance_type" {
  description = "EC2 instance type (t2.micro for free tier)"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "AWS EC2 Key Pair name for SSH access"
  type        = string
}

variable "my_ip" {
  description = "Your IP address for SSH access (CIDR format, e.g., 1.2.3.4/32)"
  type        = string
}

# Auto Scaling Configuration
variable "asg_min" {
  description = "Minimum number of instances in ASG"
  type        = number
  default     = 1
}

variable "asg_max" {
  description = "Maximum number of instances in ASG"
  type        = number
  default     = 3
}

variable "asg_desired" {
  description = "Desired number of instances in ASG"
  type        = number
  default     = 1
}

# Database Configuration (Existing Database)
variable "db_host" {
  description = "PostgreSQL database host"
  type        = string
  default     = "13.63.16.242"
}

variable "db_port" {
  description = "PostgreSQL database port"
  type        = string
  default     = "5432"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "pakload"
}

variable "db_user" {
  description = "PostgreSQL database user"
  type        = string
  default     = "pakload"
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
}

# Application Configuration
variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
  default     = "pakload-jwt-secret-change-in-production-2024"
}

variable "node_env" {
  description = "Node.js environment"
  type        = string
  default     = "production"
}

variable "github_repo" {
  description = "GitHub repository URL for the application"
  type        = string
  default     = "https://github.com/yourusername/pakload.git"
}
