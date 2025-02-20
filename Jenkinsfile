pipeline {
    agent any

    environment {
        IMAGE_PREFIX = '117.102.70.147'
        IMAGE_APP_NAME = 'dashboard-posfin'
        IMAGE_TAG = 'v1'
        PRIVATE_REGISTRY_URL = '117.102.70.147'
        PRIVATE_REGISTRY_USER = 'devofficial'
        PRIVATE_REGISTRY_PASSWORD = 'Thomas110515'
    }


    stages {
    
        stage('Login to Registry') {
            steps {
                sh "docker login -u $PRIVATE_REGISTRY_USER -p $PRIVATE_REGISTRY_PASSWORD $PRIVATE_REGISTRY_URL"
            }
        }

        stage('Docker Build and Push') {
            steps {
            sh 'DOCKER_BUILDKIT=1 docker build --rm=false -t $IMAGE_PREFIX/$IMAGE_APP_NAME:$IMAGE_TAG .'
            sh 'docker push $IMAGE_PREFIX/$IMAGE_APP_NAME:$IMAGE_TAG'
            }
        }

        stage('Deploy to Portainer') {
            steps {
                script {
                sh "curl -X POST http://117.102.70.147:9943/api/stacks/webhooks/3610fae7-80f8-4338-a18e-bf020dab79b9"
                echo "Deployed to Portainer"
                }
            }
        }

        stage('Logout From docker private registry') {
            steps {
                sh '''
                docker logout $PRIVATE_REGISTRY_URL
                '''
            }
        }
        
    }
}