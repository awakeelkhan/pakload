# ============================================================================
# PakLoad - Simple Deployment Variables
# ============================================================================

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

variable "instance_type" {
  description = "EC2 instance type (t3.micro for free tier)"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "AWS EC2 Key Pair name for SSH access"
  type        = string
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
