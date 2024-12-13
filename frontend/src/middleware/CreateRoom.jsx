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
        const { data } = await axios.get(`https://rtct.onrender.com/api/create/${roomId}`);

        if (data.status) {
          toast({
            title: "Room already exists",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          navigate("/main");
        } else {
            window.history.replaceState(null, "", `/room/${roomId}`);   //changed the current url and then at last render the children(so, in /room/${roomId} , 
          //we'll have Room.jsx(and no navigation ,so , api for /room:roomId wont be hit,just url of this page is changed and children is rendered (even after refresh url wont chnage)
      } catch(error) {
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

