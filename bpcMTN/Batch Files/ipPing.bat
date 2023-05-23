:: Loop from 161 to 173, incrementing by 1, and do a ping command to the specific IP address and save the output to a text file
for /L %%i in (161,1,173) do ping 10.37.120.%%i >> filename.txt