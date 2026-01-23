# 🚀 PakLoad AWS Deployment with Terraform

Complete infrastructure deployment for PakLoad on AWS with Auto Scaling, Load Balancer, and security best practices.

## 📋 Architecture

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                        VPC                               │
                    │  ┌─────────────────────────────────────────────────────┐│
                    │  │              Public Subnets (2 AZs)                  ││
Internet ──────────►│  │  ┌─────────────────────────────────────────────┐    ││
                    │  │  │     Application Load Balancer (ALB)         │    ││
                    │  │  │              Port 80/443                     │    ││
                    │  │  └─────────────────────────────────────────────┘    ││
                    │  │                      │                               ││
                    │  │              ┌───────┴───────┐                       ││
                    │  │              │  NAT Gateway  │                       ││
                    │  └──────────────┼───────────────┼───────────────────────┘│
                    │                 │               │                        │
                    │  ┌──────────────┼───────────────┼───────────────────────┐│
                    │  │              │ Private Subnets (2 AZs)               ││
                    │  │              ▼               ▼                       ││
                    │  │  ┌─────────────────────────────────────────────┐    ││
                    │  │  │         Auto Scaling Group                   │    ││
                    │  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐      │    ││
                    │  │  │  │  EC2    │  │  EC2    │  │  EC2    │      │    ││
                    │  │  │  │ t3.micro│  │ t3.micro│  │ t3.micro│      │    ││
                    │  │  │  └─────────┘  └─────────┘  └─────────┘      │    ││
                    │  │  └─────────────────────────────────────────────┘    ││
                    │  └──────────────────────────────────────────────────────┘│
                    └─────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                              ┌───────────────────────────────┐
                              │   Existing PostgreSQL DB      │
                              │      13.63.16.242:5432        │
                              └───────────────────────────────┘
```

## 📦 Resources Created

| Resource | Description | Free Tier |
|----------|-------------|-----------|
| VPC | Virtual Private Cloud | ✅ Free |
| Subnets | 2 Public + 2 Private | ✅ Free |
| Internet Gateway | Internet access | ✅ Free |
| NAT Gateway | Private subnet internet | ⚠️ ~$32/month |
| ALB | Application Load Balancer | ⚠️ ~$16/month |
| EC2 (t3.micro) | App servers | ✅ 750 hrs/month free |
| Auto Scaling | 1-3 instances | ✅ Free |
| CloudWatch | Monitoring & Alarms | ✅ Basic free |

**Note:** NAT Gateway and ALB are not free tier. For a truly free setup, see the "Free Tier Only" section below.

## 🚀 Quick Start

### Prerequisites

1. **AWS CLI** configured with credentials
   ```bash
   aws configure
   ```

2. **Terraform** installed (v1.0+)
   ```bash
   terraform --version
   ```

3. **EC2 Key Pair** created in AWS Console
   - Go to EC2 > Key Pairs > Create Key Pair
   - Download the .pem file

### Deployment Steps

```bash
# 1. Navigate to terraform directory
cd terraform/aws-deploy

# 2. Copy and edit variables
cp terraform.tfvars.example terraform.tfvars

# 3. Edit terraform.tfvars with your values
# - Set your IP address (get from https://whatismyip.com)
# - Set your EC2 key pair name
# - Set your database password

# 4. Initialize Terraform
terraform init

# 5. Preview changes
terraform plan

# 6. Deploy infrastructure
terraform apply

# 7. Wait for deployment (3-5 minutes)
# The ALB DNS name will be shown in outputs
```

### Access Your Application

After deployment, Terraform will output:
```
alb_url = "http://pakload-alb-123456789.eu-north-1.elb.amazonaws.com"
```

Visit this URL to access your application!

## 📝 Configuration

### terraform.tfvars

```hcl
# AWS Configuration
aws_region   = "eu-north-1"
project_name = "pakload"

# Your IP for SSH access
my_ip = "YOUR_IP/32"

# EC2 Key Pair
key_name = "your-key-pair"

# Auto Scaling
asg_min     = 1
asg_max     = 3
asg_desired = 1

# Database (existing)
db_host     = "13.63.16.242"
db_port     = "5432"
db_name     = "pakload"
db_user     = "pakload"
db_password = "YOUR_PASSWORD"

# Application
jwt_secret = "your-secret-key"
node_env   = "production"
```

## 🔒 Security Features

- ✅ Private subnets for app servers
- ✅ Security groups with least privilege
- ✅ NAT Gateway for outbound traffic
- ✅ IMDSv2 required on EC2
- ✅ Encrypted EBS volumes
- ✅ IAM roles with minimal permissions
- ✅ CloudWatch logging

## 📊 Auto Scaling

The Auto Scaling Group automatically adjusts capacity:

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU > 70% | 2 periods | Scale Up (+1) |
| CPU < 30% | 2 periods | Scale Down (-1) |

## 💰 Free Tier Only Option

To stay within free tier, modify `main.tf`:

1. Remove NAT Gateway (use public subnets for EC2)
2. Remove ALB (access EC2 directly)

```hcl
# In main.tf, comment out:
# - aws_nat_gateway.main
# - aws_lb.main
# - aws_lb_target_group.app
# - aws_lb_listener.http

# Change EC2 to use public subnets:
vpc_zone_identifier = aws_subnet.public[*].id
```

## 🔧 Useful Commands

```bash
# View current state
terraform show

# Destroy infrastructure
terraform destroy

# Update infrastructure
terraform apply

# View outputs
terraform output

# SSH to instance (if in public subnet)
ssh -i your-key.pem ec2-user@<instance-ip>
```

## 🐛 Troubleshooting

### Instances not becoming healthy

1. Check user data logs:
   ```bash
   ssh ec2-user@<ip>
   cat /var/log/user-data.log
   ```

2. Check application status:
   ```bash
   systemctl status pakload
   systemctl status nginx
   ```

### Database connection issues

1. Ensure security group allows traffic from VPC CIDR
2. Check database credentials in `.env`
3. Test connection:
   ```bash
   psql -h 13.63.16.242 -U pakload -d pakload
   ```

### ALB health checks failing

1. Verify app is running on port 5000
2. Check `/api/stats` endpoint returns 200
3. Review target group health in AWS Console

## 📁 File Structure

```
terraform/aws-deploy/
├── main.tf                 # Main infrastructure
├── variables.tf            # Variable definitions
├── outputs.tf              # Output values
├── terraform.tfvars.example # Example variables
├── app_user_data.sh        # EC2 bootstrap script
└── README.md               # This file
```

## 🔄 CI/CD Integration

For automated deployments, add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Terraform Apply
  run: |
    cd terraform/aws-deploy
    terraform init
    terraform apply -auto-approve
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}
```

## 📞 Support

For issues with this Terraform configuration, check:
1. AWS CloudWatch Logs
2. EC2 instance logs
3. Terraform state file

---

**Happy Deploying! 🚀**
