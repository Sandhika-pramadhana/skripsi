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
            echo $SERVER_SSH_PASSWORD | sudo -S docker run -p 3000:3000 -d --rm \
            -e NEXT_PUBLIC_API_URL=https://api-kurir.posfin.id/api/v1 \
            -e NEXT_PUBLIC_API_URL_SANDBOX=https://sandboxkurir.posfin.id/api/v1 \
            -e NEXT_PUBLIC_X_API_TOKEN=SuRyptU70wsIGfshdZDEEGPv1eTh0bN4FLE3C84MdtOo8AwlpkuvKzI9nfaNuavX \
            -e NEXT_PUBLIC_SECRET=c58a4b1b41d66baa51f6f31a5d2b60422a6c58b4f70d2e223d98319bbc27377f \
            -e NEXT_PUBLIC_JWT_SECRET=d336f50a782bbbb20914d20883046c462de51c28b4f6c2c27aca8e21509b04b0 \
            -e GOOGLE_CLIENT_EMAIL="spreadsheet@dashboardmonitoring-449816.iam.gserviceaccount.com" \
            -e GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwZyuyB3obRnFV\nDkvd7md9sHVtGoqsl4LVuXxSiHe1Ob1HgZA9ByjpB3hZrckJdlxsoOfAVxWiXPqQ\nIogxllB/AWWTVaR7IIqRF7sq0uCoPUaFX6T8kGJqg6szZy1kF8SFUOT5LKpOt8ym\nxvzjGirytxe7v85pYzVuC/ufRin79DDmxIpy0/pD6xZ4zmyH9BzFrXnktJAnDtpJ\n3RO5hRaal82r8I5ojWd0w1JFkH3zq9+KlsKq5fvDtnEF4BGOMJ9SdNANx4r7+tLj\nYkp7B5dus3z+M9cP1bTPjWjuiIokTostnplngwRzw3qWMcDu7X5nXTrZUYlusLtc\nQYgbY53FAgMBAAECggEAFk4oCsis6neo9fSAUwLbEtwLWm026BBNFWGbtENC67yY\nz/VfO9rvaS6DdnIl5QHn5D52VMOjiIERl8RzYd3GtkCCy7NSayqYCt+sJYPpBKz2\n1qow46oNdQ11dOL7gi1f2+xOKlRjq992y7Hb9orFBSVx+qYMChcRgaWXPrJcYFoa\nolPyPxScRMVfQ4a/Vx/t8zKhX35/z6RcJCSp/EkehKMmh92N/pbAGAJHZIUYIaGf\nkTxpW9F7APMbRfumwi0OoA+Rxsbgm8UNT3HR2N4wVzICRbZ04KsJYot034Mi4ocp\n8tfqhmTV2u22NraXFNY0W17hBquC63EVIutNbkiLcwKBgQDt79pcEKe/jTf5iVGH\nEj5FxDPBR//KDdFVqo9fxR0YRItpY4/ypxhhff2pUhEZE9R9YkLTf5sIfI2z3j2d\nTT7vkWtb02OHnO9oKZ7lnTkxOefEc7ulPgbCZ7FcIlDPRFd1Fog09vp/WHJof1fI\nz0wOznFwbj9yIXY7SAjkNYmXGwKBgQC9y3Jbjr/vhSd7yd2igShsK7vYFm5kPMrK\nW0jWrJVW2v+0iRV/eCME2/jE8NNqqOQxRlHjJRafxdsNmIcojAStEWMb1ZQ1dW50\nlJXddZb2KcRG3EKjzv/0vZ8ok3p4kyJjSO0b1otSzkYv3zB+rXWAQEyJ3Kkpi4nT\nClkOXaSMnwKBgFpeXaXX4Y5cGWVaJS/S2vnuceW37cuVAeuycu/h0pIT/osReGul\n0Rm+G2iCteG7aVoRxuXDMmO/wqYNA4PKAdxFc+wVVlj8XuVF4Ya99yneH0u61QsG\nitStQ2yF0AFYqIrc+vB62VsigZl0vCeVrAJ3oBgel1RGpzwOuOnL96z/AoGBALUS\nbWcWeN2OHs5GGBKawLL6wnr1Y5p0OVD36DUPcGbuBvj5tC3psxdGuj9CN6HRweuU\n2DkqQDxsaoG9HG29sBRhuzlp+b1K7PeCbrxbHIx76otkRpu7uIyJgFgY48Y3MZ6h\ni718YW296E5x0/V3jduu/JamlClTvElA3RgMlRmnAoGAVkEu1kS07Ixcb9rmhF1H\neH+CD37WkszqebecDK1DjRDM1eOviBc6zRd9KUXNoJw18+YWD/CZR3QEHbtc5OxQ\nKhMU29rpCtavYwxKaBQ7npQVN8pTrbx9N6aQWX+tlBK4TAM16cZGSguBFwqP3y9u\n8/ITSyBL294CjHinWx154CQ=" \
            -e GOOGLE_SHEET_ID="1zdBm8DnsTXdrYKjaXLBdEeCPJ2JiIJQUOuTHiMdlWlI" \
            -e ENCRYPTION_KEY="WtBlLiX/DbRsSsy2Qmw1iynkKpH8M7v149um7xZ6NoU=" \
            --name $IMAGE_APP_NAME \
            $IMAGE_PREFIX/$IMAGE_APP_NAME:$IMAGE_TAG'
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
