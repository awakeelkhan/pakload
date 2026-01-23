# 🔧 Terraform Configuration for Your Setup

## ✅ Your IP Address Detected

**Your Public IP:** `154.192.215.122`

---

## 📝 Create terraform.tfvars File

**Create this file:** `terraform/terraform.tfvars`

**Copy and paste this content:**

```hcl
# Your public IP address in CIDR format
my_ip = "154.192.215.122/32"

# PostgreSQL database password (change this to a strong password!)
db_password = "PakLoad2024!SecureDB#"

# AWS EC2 Key Pair name (change to your key pair name)
key_name = "pakload-key"

# Optional: Override defaults if needed
# aws_region = "eu-north-1"
# instance_type = "t3.micro"
# vpc_id = "vpc-03b308cb0f7b1bb02"
# subnet_id = "subnet-05d537777105b33ecc"
```

---

## 🔐 Important: Change the Password!

Replace `PakLoad2024!SecureDB#` with your own strong password:
- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Don't use common words

---

## 🔑 EC2 Key Pair Setup

If you haven't created an EC2 key pair yet:

1. **Go to AWS Console:** https://console.aws.amazon.com/ec2/
2. **Region:** eu-north-1 (Stockholm)
3. **Left sidebar:** Key Pairs
4. **Click:** "Create key pair"
5. **Name:** `pakload-key`
6. **Type:** RSA
7. **Format:** .pem
8. **Click:** "Create key pair"
9. **Save** the downloaded `.pem` file to `~/.ssh/pakload-key.pem`

If you already have a key pair, use its name in the `key_name` variable.

---

## 🚀 Deploy Steps

After creating `terraform/terraform.tfvars`:

```bash
cd terraform

# Initialize Terraform
terraform init

# Review what will be created
terraform plan

# Deploy (type 'yes' when prompted)
terraform apply
```

---

## 📋 Quick Commands

```powershell
# Navigate to terraform directory
cd c:\Users\7201\Desktop\Research and tools\personnel\pakload\terraform

# Create the tfvars file (copy content from above)
notepad terraform.tfvars

# Initialize and deploy
terraform init
terraform plan
terraform apply
```

---

## ⚠️ Security Note

The `terraform.tfvars` file contains sensitive information and is automatically ignored by git (listed in `.gitignore`). Never commit this file to version control!

---

**Once you create the file with your configuration, run `terraform apply` to deploy!**
