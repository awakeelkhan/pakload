# Terraform Outputs for PostgreSQL EC2 Instance

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.postgres.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.postgres_eip.public_ip
}

output "instance_private_ip" {
  description = "Private IP address of the EC2 instance"
  value       = aws_instance.postgres.private_ip
}

output "postgres_connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://pakload:${var.db_password}@${aws_eip.postgres_eip.public_ip}:5432/pakload"
  sensitive   = true
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_eip.postgres_eip.public_ip}"
}

output "postgres_host" {
  description = "PostgreSQL host address"
  value       = aws_eip.postgres_eip.public_ip
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.postgres_sg.id
}

output "next_steps" {
  description = "Next steps after deployment"
  value       = <<-EOT
  
  ✅ PostgreSQL EC2 Instance Deployed Successfully!
  
  📋 Connection Details:
  - Host: ${aws_eip.postgres_eip.public_ip}
  - Port: 5432
  - Database: pakload
  - User: pakload
  - Password: [provided during terraform apply]
  
  🔐 SSH Access:
  ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_eip.postgres_eip.public_ip}
  
  📊 Check PostgreSQL Status:
  ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_eip.postgres_eip.public_ip} '/usr/local/bin/postgres-status.sh'
  
  🔧 Update Your Application:
  Edit server/.env:
  DB_HOST=${aws_eip.postgres_eip.public_ip}
  DB_PORT=5432
  DB_USER=pakload
  DB_PASSWORD=your_password
  DB_NAME=pakload
  
  🚀 Deploy Database Schema:
  npm run db:test
  npm run db:push
  npm run db:seed
  npm run dev
  
  💾 Backups:
  - Automatic daily backups at 2 AM UTC
  - Backups stored in /var/backups/postgresql
  - Last 7 days retained
  
  EOT
}
