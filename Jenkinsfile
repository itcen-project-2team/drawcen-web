pipeline {
    agent any
    options {
        timeout(time: 1, unit: 'HOURS')
    }

    environment {
        TIME_ZONE = 'Asia/Seoul'

        // GitHub
        GIT_TARGET_BRANCH = 'develop'
        GIT_REPOSITORY_URL = 'https://github.com/itcen-project-2team/drawcen-web.git'
        GIT_CREDENTIALS_ID = 'jenkins-credential'

        // AWS ECR
        AWS_ECR_CREDENTIAL_ID = 'AWS_ECR_CREDENTIAL'
        AWS_ECR_URI = '010686621060.dkr.ecr.ap-northeast-2.amazonaws.com'
        AWS_ECR_IMAGE_NAME = '2team/front-ecr'
        AWS_REGION = 'ap-northeast-2'

        // Deployment target
        WEB_IP = "${WEB_IP}"  // Jenkins에 등록된 환경변수, 웹서버 공인 IP
    }

    stages {
        stage('Init') {
            steps {
                deleteDir()
            }
        }

        stage('Clone Source') {
            steps {
                git branch: "${GIT_TARGET_BRANCH}",
                    credentialsId: "${GIT_CREDENTIALS_ID}",
                    url: "${GIT_REPOSITORY_URL}"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${AWS_ECR_IMAGE_NAME}:${BUILD_NUMBER} .
                """
            }
        }

        stage('Login to ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "${AWS_ECR_CREDENTIAL_ID}"]]) {
                    sh """
                    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ECR_URI}
                    """
                }
            }
        }

        stage('Push Docker Image to ECR') {
            steps {
                sh """
                docker push ${AWS_ECR_IMAGE_NAME}:${BUILD_NUMBER}
                """
            }
        }

        stage('Deploy to Web Server') {
            steps {
                sshagent(credentials: ['webserver-ssh-key']) {
                    sh """
                    scp -o StrictHostKeyChecking=no docker-compose.yml ubuntu@${WEB_IP}:~/app/
                    ssh -o StrictHostKeyChecking=no ubuntu@${WEB_IP} '
                        cd ~/app
                        docker-compose down || true
                        IMAGE_TAG=${BUILD_NUMBER} docker-compose up -d --build
                    '
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                sh "docker image prune -f --all"
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}
