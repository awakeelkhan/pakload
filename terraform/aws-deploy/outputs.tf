# ============================================================================
# PakLoad - Terraform Outputs
# ============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_url" {
  description = "Application URL"
  value       = "http://${aws_lb.main.dns_name}"
}

output "alb_security_group_id" {
  description = "ALB Security Group ID"
  value       = aws_security_group.alb.id
}

output "app_security_group_id" {
  description = "App Security Group ID"
  value       = aws_security_group.app.id
}

output "autoscaling_group_name" {
  description = "Auto Scaling Group name"
  value       = aws_autoscaling_group.app.name
}

output "launch_template_id" {
  description = "Launch Template ID"
  value       = aws_launch_template.app.id
}

output "target_group_arn" {
  description = "Target Group ARN"
  value       = aws_lb_target_group.app.arn
}

output "nat_gateway_ip" {
  description = "NAT Gateway public IP"
  value       = aws_eip.nat.public_ip
}

output "deployment_info" {
  description = "Deployment information"
  value = <<-EOT
    
    ============================================
    PakLoad Deployment Complete!
    ============================================
    
    Application URL: http://${aws_lb.main.dns_name}
    
    Database Host: ${var.db_host}
    Database Name: ${var.db_name}
    
    Auto Scaling:
      - Min: ${var.asg_min}
      - Max: ${var.asg_max}
      - Desired: ${var.asg_desired}
    
    Note: It may take 3-5 minutes for instances to become healthy.
    
    ============================================
  EOT
}
