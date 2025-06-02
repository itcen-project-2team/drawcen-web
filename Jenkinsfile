pipeline {
  agent any

  environment {
    ECR_REGISTRY = '010686621060.dkr.ecr.ap-northeast-2.amazonaws.com'
    ECR_REPOSITORY = '2team/front-ecr'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    SERVER_IP = "${env.WEB_IP}"
    AWS_REGION = 'ap-northeast-2'
  }

  stages {
    stage('Clone') {
      steps {
        git url: 'https://github.com/itcen-project-2team/drawcen-web', branch: 'develop'
      }
    }

    stage('Generate .env.production') {
      steps {
        writeFile file: '.env.production', text: """
VITE_BACKEND_URL=http://${env.SERVER_IP}:8080
VITE_WS_BASE_URL=/ws/canvas
"""
      }
    }

    stage('Login to ECR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'AWS_ECR_CREDENTIAL', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
          sh '''
            aws --region $AWS_REGION ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          '''
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh "docker build -t $ECR_REPOSITORY:$IMAGE_TAG ."
      }
    }

    stage('Push to ECR') {
      steps {
        sh "docker push $ECR_REPOSITORY:$IMAGE_TAG"
      }
    }

    stage('Deploy to Web Server') {
      steps {
        sshagent(credentials: ['webserver-ssh-key']) {
          sh """
            ssh -o StrictHostKeyChecking=no ubuntu@$SERVER_IP '
              docker pull $ECR_REPOSITORY:$IMAGE_TAG &&
              docker stop nginx-web || true &&
              docker rm nginx-web || true &&
              docker run -d --name nginx-web -p 80:80 $ECR_REPOSITORY:$IMAGE_TAG
            '
          """
        }
      }
    }
  }
}
