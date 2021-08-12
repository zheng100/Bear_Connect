## Instructions to build, run, test

* Build: Dockerfile and /.dockerignore have all libraries and packages necessary to run the server in a container environment.  Use ```./build_discord.sh``` to run the build script 
* Run:
 
  -The build script will check to see if the network bearconnect exists, and if not will create one. 
  
  -**CAUTION** Build script will automatically stop any container w/ ```bearconnect_discord``` name, delete it, the delete the container image.  
  
  -The script will then build a node/mongo db server image from scratch. 
  
  -Finally, will run the container image, add it to the bearconnect network, routing port 5000 to 5003 for practical use
  
  * Test: 
    1. Send a GET request to port 5003 for a ```hello world``` response
    2. Send a POST requset to port 5003/create_channel for a 
    ```json 
    {"channel_id": 840405348996349972, "channel_invite": "https://discord.gg/C7R6jN6HdM"} 

   (example) 
