provider "aws" {
  region = "eu-central-1"
}

resource "aws_instance" "GithubActionsInstanz" {
  count                  = 1
  ami                    = "ami-0eddb4a4e7d846d6f"
  instance_type          = "t2.micro"
  key_name               = "terraformKey" ## euer eigener Key hier hinzufügen
  vpc_security_group_ids = [aws_security_group.ssh_access.id]
  tags = {
    Name = "Meine Github Actions Instanz 1"
  }
}

resource "aws_security_group" "ssh_access" {
  name        = "ssh_access"
  description = "Allow SSH access"

  ingress { #eingehender Datenverkehr
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "SSH Access"
  }

}

output "instance_public_ips" {
  value = aws_instance.GithubActionsInstanz.*.public_ip
}


## terraform init
## terraform plan
## terraform apply


## terraform destroy