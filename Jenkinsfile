pipeline {
  agent any
  environment {
    IMAGE_PREFIX = '117.102.70.147'
    IMAGE_APP_NAME = 'dashboard-posfin'
    IMAGE_TAG = 'v1'
    PRIVATE_REGISTRY_URL = '117.102.70.147'
    PRIVATE_REGISTRY_USER = 'devofficial'
    PRIVATE_REGISTRY_PASSWORD = 'Thomas110515'
    SERVER_ADDRESS = '8.215.77.122'
    SERVER_SSH_PORT = '22'
    SERVER_SSH_USER = 'deden'
    SERVER_SSH_PASSWORD = 'd3d3n_p0sf1n2024'
  }
  stages {
    stage('Build image') {
      steps {
        sh 'docker build -t $IMAGE_PREFIX/$IMAGE_APP_NAME:$IMAGE_TAG .'
      }
    }
    stage('Push to docker private registry') {
      steps {
        sh '''
          echo $PRIVATE_REGISTRY_PASSWORD | docker login --username=$PRIVATE_REGISTRY_USER --password-stdin $PRIVATE_REGISTRY_URL
          docker tag $IMAGE_PREFIX/$IMAGE_APP_NAME:$IMAGE_TAG $IMAGE_PREFIX/$IMAGE_APP_NAME
          docker push $IMAGE_PREFIX/$IMAGE_APP_NAME
          docker logout $PRIVATE_REGISTRY_URL
        '''
      }
    }
    stage('deploy to server') {
      steps {
        script {
          sh 'apt-get update && apt-get install -y sshpass'

          def result = sh(script: "sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS 'echo $SERVER_SSH_PASSWORD | sudo -S docker ps -q -f status=running -f name=$IMAGE_APP_NAME'", returnStdout: true).trim()

          if (result) {
              echo "Stopping and removing existing container..."
              sh "sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS 'echo $SERVER_SSH_PASSWORD | sudo -S docker stop $IMAGE_APP_NAME && sudo -S docker rm $IMAGE_APP_NAME'"
          }

          sh "sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS 'echo $PRIVATE_REGISTRY_PASSWORD | sudo -S docker login --username=$PRIVATE_REGISTRY_USER --password=$PRIVATE_REGISTRY_PASSWORD  $PRIVATE_REGISTRY_URL'"

          sh "sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS 'echo $SERVER_SSH_PASSWORD | sudo -S docker compose pull && docker compose up -d'"

          sh "sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS 'echo $SERVER_SSH_PASSWORD | sudo -S docker logout $PRIVATE_REGISTRY_URL'"

          sh "exit"
        }
      }
    }
  }
}