docker stop mi
docker rm mi
docker rmi mi
docker build -t mi .
docker run -itd --name mi mi