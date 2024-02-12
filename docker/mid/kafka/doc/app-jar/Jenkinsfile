pipeline {
    agent any
    stages {
        stage('package') {
            agent {
                docker {
                    image 'maven'
                    args '-v /root/.m2:/root/.m2 --entrypoint='
                }
            }
            steps {
                script{
                    echo "WORKSPACE：${env.WORKSPACE}"
                    echo "Branch：${env.NODE_NAME}"
                    if ("${env.NODE_NAME}" == "master") {
                        sh "sh package-prod.sh"
                    }
                }
            }
        }
        stage('build') {
            agent none
            steps {
                script{
                    echo "WORKSPACE：${env.WORKSPACE}"
                    echo "Branch：${env.NODE_NAME}"
                    if ("${env.NODE_NAME}" == "master") {
                        sh "sh build-prod.sh"
                    }
                }
            }
        }
    }
}