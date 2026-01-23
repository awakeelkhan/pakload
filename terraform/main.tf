# Terraform Configuration for PakLoad PostgreSQL EC2 Instance
# Free tier eligible t3.micro instance with PostgreSQL 16

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Security Group for PostgreSQL EC2 Instance
resource "aws_security_group" "postgres_sg" {
  name        = "${var.project_name}-postgres-sg"
  description = "Security group for PostgreSQL EC2 instance"
  vpc_id      = var.vpc_id

  # SSH access from your IP only
  ingress {
    description = "SSH from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # PostgreSQL access from your IP only
  ingress {
    description = "PostgreSQL from my IP"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # PostgreSQL access from within VPC (for future app deployment)
  ingress {
    description = "PostgreSQL from VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["172.31.0.0/16"] # Your VPC CIDR
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-postgres-sg"
    Project = var.project_name
    Purpose = "PostgreSQL Database"
  }
}

# Latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance for PostgreSQL
resource "aws_instance" "postgres" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  key_name              = var.key_name
  subnet_id             = var.subnet_id != "" ? var.subnet_id : null
  vpc_security_group_ids = [aws_security_group.postgres_sg.id]

  # Enable public IP for external access
  associate_public_ip_address = true

  # Root volume configuration
  root_block_device {
    volume_size           = 30 # GB (free tier allows up to 30GB, AMI requires minimum 30GB)
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-postgres-root-volume"
    }
  }

  # User data script to install and configure PostgreSQL
  user_data = templatefile("${path.module}/user_data.sh", {
    db_password = var.db_password
  })

  # Enable detailed monitoring (free tier includes basic monitoring)
  monitoring = false

  # Metadata options for security
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # Require IMDSv2
    http_put_response_hop_limit = 1
  }

  tags = {
    Name        = "${var.project_name}-postgres-db"
    Project     = var.project_name
    Purpose     = "PostgreSQL Database"
    Environment = "development"
  }

  # Wait for instance to be ready
  lifecycle {
    create_before_destroy = false
  }
}

# Elastic IP for stable public IP address
resource "aws_eip" "postgres_eip" {
  instance = aws_instance.postgres.id
  domain   = "vpc"

  tags = {
    Name    = "${var.project_name}-postgres-eip"
    Project = var.project_name
  }

  depends_on = [aws_instance.postgres]
}
