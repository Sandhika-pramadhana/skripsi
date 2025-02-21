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
        sh 'docker build -f Dockerfile -t $IMAGE_PREFIX/$IMAGE_APP_NAME:$IMAGE_TAG .'
      }
    }
    stage('Push to docker private registry') {
      steps {
        sh '''
          docker login --username=$PRIVATE_REGISTRY_USER --password=$PRIVATE_REGISTRY_PASSWORD $PRIVATE_REGISTRY_URL
          docker tag $IMAGE_PREFIX/$IMAGE_APP_NAME:$IMAGE_TAG $IMAGE_PREFIX/$IMAGE_APP_NAME
          docker push $IMAGE_PREFIX/$IMAGE_APP_NAME
          docker logout $PRIVATE_REGISTRY_URL
        '''
      }
    }
    stage('Deploy to Server') {
      steps {
        script {
          sh 'apt-get update && apt-get install -y sshpass'
          
          def result = sh(script: """
            sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS '
            echo $SERVER_SSH_PASSWORD | sudo -S docker ps -q -f name=$IMAGE_APP_NAME'
          """, returnStdout: true).trim()

          if (result) {
              echo "Container $IMAGE_APP_NAME exists. Stopping the existing container..."
              sh """
                sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS '
                echo $SERVER_SSH_PASSWORD | sudo -S docker stop $IMAGE_APP_NAME'
              """
          }

          // Pull the latest image
          sh """
            sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS '
            echo $SERVER_SSH_PASSWORD | sudo -S docker login --username=$PRIVATE_REGISTRY_USER --password=$PRIVATE_REGISTRY_PASSWORD $PRIVATE_REGISTRY_URL'
          """
          sh """
            sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS '
            echo $SERVER_SSH_PASSWORD | sudo -S docker pull $IMAGE_PREFIX/$IMAGE_APP_NAME:$IMAGE_TAG'
          """

          // Run the container without network and volumes
          sh """
            sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS '
            echo $SERVER_SSH_PASSWORD | sudo -S docker run -p 3000:3000 -d --rm --name $IMAGE_APP_NAME $IMAGE_PREFIX/$IMAGE_APP_NAME:$IMAGE_TAG'
          """

          // Logout from Docker registry
          sh """
            sshpass -p $SERVER_SSH_PASSWORD ssh -o StrictHostKeyChecking=no -p $SERVER_SSH_PORT $SERVER_SSH_USER@$SERVER_ADDRESS '
            echo $SERVER_SSH_PASSWORD | sudo -S docker logout $PRIVATE_REGISTRY_URL'
          """

          sh "exit"
        }
      }
    }
  }
}
