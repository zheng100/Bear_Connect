# Bear Connect

Members: Justin Norman, Dylan Chow, Elaine Wang, Hongyang Zheng, Nidhi Kakulawaram

## Project Description

We created a suite of servers that act like a bundle to help students to get customized study groups via SMS. Users can interact with our Twilio empowered server via SMS and input their study preference (such as class, major, grad etc.) and get recommended discord study groups via a customized matching algorithm.

## Functionality

There are several separate steps in completing the desired conversation workflow for our project, each with a different purpose.

1. Text the reserved twilio number [407-988-0296] to start the conversation. It does not matter what you send.
	a. Note: we have a Twilio trial account so unverified numbers won’t be able to have a conversation with this number
2. Twilio communicates with our Flask App that a message has been received and our Flask app sends the intended message back to Twilio to text the user.
	a. For Twilio to have access to our localhost endpoint, we had to use ngrok to create a publicly available port so Twilio could communicate with our web server. We take the link from ngrok and connect it to sms webhook on Twilio.
3. The Flask app then communicates with user information with the database
4. The Twilio server sends a POST request to the database server with user information. This adds a new user to the MongoDB users collection.
5. Next, the Twilio server sends a GET request to the database server, which returns groups that match the user the best. Best groups are determined by an algorithm that assigns a score to each group based on how well they match the user’s profile. Each score is a weighted combination of features which are assigned to be 0 or 1 based on whether meeting times match, years are similar, majors are similar, and study preferences are similar. The best groups endpoint returns 3 groups that have the highest rank for the input user.
6. If there are no best groups (which only happens when there are no current study groups for the class), then a new group is created. When a new group is created, the database server calls the discord server, which returns a discord link. This link is then added to the group document.
7. If there are best groups, the user can choose to join a group by selecting it through the Twilio interface. Another POST request is sent to the database server adding the user to the chosen group and returning the discord group link via text message.
8. Discord bot acts like an admin to organize all study groups on discord server. It creates groups, provides invite links, and has the ability to interact with DB to delete inactive groups.

Run ```./demo.sh``` in the project's root directory to start docker containers. (You will need to set up your own MongoDB, discord_bot, and Twilio's API to make it work)
