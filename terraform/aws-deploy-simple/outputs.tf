# ============================================================================
# PakLoad - Simple Deployment Outputs
# ============================================================================

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "EC2 Instance Public IP (Elastic IP)"
  value       = aws_eip.app.public_ip
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_eip.app.public_ip}"
}

output "api_url" {
  description = "API URL"
  value       = "http://${aws_eip.app.public_ip}/api"
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh -i your-key.pem ec2-user@${aws_eip.app.public_ip}"
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.app.id
}

output "your_detected_ip" {
  description = "Your detected public IP (used for SSH access)"
  value       = chomp(data.http.my_ip.response_body)
}

output "deployment_info" {
  description = "Deployment summary"
  value = <<-EOT
    
    ============================================
    PakLoad Deployment Complete!
    ============================================
    
    Application URL: http://${aws_eip.app.public_ip}
    API URL: http://${aws_eip.app.public_ip}/api
    
    SSH: ssh -i your-key.pem ec2-user@${aws_eip.app.public_ip}
    
    Database: ${var.db_host}:${var.db_port}/${var.db_name}
    
    Note: Wait 3-5 minutes for the app to fully start.
    
    ============================================
  EOT
}
