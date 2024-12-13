import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import axios from "axios";

const CreateRoom = ({ children }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    const checkAuthAndRoom = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        toast({
          title: "Please Login",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
        return;
      }

      if (!roomId) {
        toast({
          title: "Room ID is missing",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        navigate("/main");
        return;
      }

      try {
        const { data } = await axios.get(`http://localhost:5000/api/create/${roomId}`);

        if (data.status) {
          toast({
            title: "Room already exists",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          navigate("/main");
        } else {
            window.history.replaceState(null, "", `/room/${roomId}`); // Change the URL without navigating(so,only url of this page wil change(it wont hit the api of /room/:roomId)) and at last we returned chilren (so,directly Room.jsx component will be opened in this component only.)
            //and since, routing navigation nhi hua hai,so,api for /room/:roomId wont get hit , refresh se bhi ye url change nhi hoga.
            //from /main route, we clicked on create Room , so we navigated to  /room/create/:roomId(so ,a new page opened and in this url ,we are at first rendering the CreateRoom component ) 
            // so, /room/create/:roomId me new page khula hai, which opens a component CreateRoom.jsx and here, when we are sure if this room doesn't exist
            //then we give permission to the user that you can create this room ,but, if we used navigate("/room/:roomId") then again the CheckRoom api would be hit and we would come out of room as this room doesn't exist,
            //so, we decided to directly open Room.jsx(ie. return children ) directly after we got notified that this room is not already created.
            //so, the problem was when we opened Room.jsx in the url /room/create/:roomId ,then when we used to refresh the page,then the same api of /room/create/:roomId was hit and since, this room currently exist,so,i was thrown out  of the room to the main page

            //so, finally ->
            // before window.history.replaceState(...) , i was in /room/create/:roomId (history stack me isse pahle /main wala url hoga)
            //after window.history.replaceState(...), the url of the current page is changed (kahi navigation nhi hua + no api hit of /room/:roomId, agar navigate("/room/${roomId}") use karte then api of /room/:roomId hit hota) 
            //so, current page ka url changed (and also isse pahle ka jo url tha(before changin wala ) wil get removed from history stack , so /main ke baad ab /room/create/${roomId} nhi hai ,balki /main ke baad /room/${roomId} hoga  )
            //and at last (neeche dekho ,we returned children ,so ,isi new url ->/room/${roomId} ,Room.jsx open ho gaya.)
            //and iss page (/room/${roomId}) me Room.jsx open hua hai, so when person goes back (browser feature) , then it will go to /main (not to /room/create/${roomId} since ,main usska history stack se remove kar chuka hu )
        }
      } catch {
        toast({
          title: "Internal Server Error",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/main");
      }
    };

    checkAuthAndRoom();
  }, [roomId, navigate, toast]);

  return children;  //so, isi url me (without any navigation) Room.jsx will be rendered and even after refreshing the url of this page won't change
};

export default CreateRoom;

