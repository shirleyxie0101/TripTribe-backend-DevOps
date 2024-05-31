def COLOR_MAP = [
    'SUCCESS': 'good', 
    'FAILURE': 'danger',
]


pipeline {
    agent 'any'

    tools {
        jdk 'openjdk'
        dockerTool 'docker-latest'
        nodejs 'nodejs-20.11.0'
        maven 'maven-3.9.6'
        gradle 'gradle-8.5'
        terraform 'terraform'
    }

    environment {
        AWS_DEFAULT_REGION = 'ap-southeast-2'
        CLUSTER_NAME='UATCluster'
        PATH = "/var/lib/jenkins/node-v20.10.0-linux-x64/bin:/root/bin:$PATH"
        ECR_REPOSITORY_NAME = 'triptribe-backend'
        AWS_ACCOUNT_ID = '067912176361'
        REPOSITORY_URI = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}"
 
    }
    stages {
        stage('Check installed package') {
            steps {
                sh '''
                java --version
                git --version
                docker --version
                node -v
                npm -v
                aws --version
                mvn --version
                gradle --version
                vercel --version
                docker --version
                terraform --version
              '''
            }
        }

        stage('Checkout') {
            steps {
                // Checkout the specific GitHub repository
                 git branch: 'dev', credentialsId: '927ecf94-de07-45cf-9ff6-a3a2aea54996', url: 'https://github.com/ExploreXperts/TripTribe-Backend.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Format Code') {
            steps {
                sh 'npm run format'
            }
        }

        stage('Linting') {
            steps {
                sh 'npm run lint'
            }
        }

        // stage('Unit Tests') {
        //     steps {
        //         sh 'npm test'
        //     }
        // }

        // stage('Code Coverage') {
        //     steps {
        //         sh 'npm run test:cov'
        //     }
        //     post {
        //         always {
        //             step([$class: 'CoberturaPublisher', coberturaReportFile: '**/coverage/cobertura-coverage.xml'])
        //         }
        //     }
        // }

        stage('SonarQube Analysis') {
            environment {
                scannerHome = tool 'sonarqube'
            }
            steps {
                script {
                        withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=$JOB_NAME \
                            -Dsonar.projectName=$JOB_NAME \
                            -Dsonar.projectVersion=$BUILD_NUMBER \
                            -Dsonar.sources=src/ 
                        """
                        }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    // Just in case something goes wrong, pipeline will be killed after a timeout
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline aborted due to quality gate failure: ${qg.status}"
                        }
                    }
                }
            }
        }
        // stage('End-to-End Tests') {
        //     steps {
        //         sh 'npm run test:e2e'
        //     }
        // }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'rm -rf .env'
                    sh 'cp .env.development .env'
                    // Build Docker image
                    sh "docker build -t ${REPOSITORY_URI}:${BUILD_NUMBER} ."
                }
            }
        }

        stage('Logging into AWS ECR') {
            steps {
                withCredentials([aws(accessKeyVariable:'AWS_ACCESS_KEY_ID', credentialsId:'aws-credential', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    /* groovylint-disable-next-line LineLength */
                    sh """aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"""
                }
            }
        }

        // Uploading Docker images into AWS ECR
        stage('Pushing to ECR') {
            steps {
                script {
                        sh """
                        echo "Start pushing image to ECR: ${REPOSITORY_URI}:${BUILD_NUMBER}"
                        docker push  ${REPOSITORY_URI}:${BUILD_NUMBER}
                        """
                }
            }
        }

        stage('Cleaning up docker') {
            steps {
                script {
                    sh "docker rmi ${REPOSITORY_URI}:${BUILD_NUMBER}"
                }
            }
        }
        
        
         stage ('Deploy') {
            environment {
              APP_NAME='triptribe-backend'
              PREFIX_NAME='staging'
            }
            
            steps {
                script {
                    echo 'deploying Backend APP to EKS...'
                    sh "aws eks update-kubeconfig --region ${AWS_DEFAULT_REGION} --name ${CLUSTER_NAME}"
                    sh 'chmod +x apply_k8s.sh'
                    sh './apply_k8s.sh'
                }
            }
        }
        

        
        
    }

    post {
        success {
                emailext subject: 'Build Successfully',
                body: 'The Jenkins build succeed. Please check the build logs for more information. $DEFAULT_CONTENT',
                recipientProviders: [
                    [$class: 'CulpritsRecipientProvider'],
                    [$class: 'DevelopersRecipientProvider'],
                    [$class: 'RequesterRecipientProvider']
                ],
                to: 'jlix723@gmail.com'
        }

        failure {
                emailext subject: 'Build Failed',
                body: 'The Jenkins build failed. Please check the build logs for more information. $DEFAULT_CONTENT',
                recipientProviders: [
                    [$class: 'CulpritsRecipientProvider'],
                    [$class: 'DevelopersRecipientProvider'],
                    [$class: 'RequesterRecipientProvider']
                ],
                to: 'jlix723@gmail.com'
        }
        
        always {
            echo 'Slack Notifications.'
            slackSend channel: '#jenkinscicd',
                color: COLOR_MAP[currentBuild.currentResult],
                message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER} \n More info at: ${env.BUILD_URL}"
        }
    }



    
}
