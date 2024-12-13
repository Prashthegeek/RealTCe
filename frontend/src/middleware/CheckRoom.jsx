//this component will check if entered Room exists or not.
//it also checks if user authenticated to enter room or not (as directly from url a person can try to enter)

//if user not authenticated , send him to login page 
//if authenticated. then send the request to the server to check if this room exists
//if room exists (response true / ok from server) , then render children(Room.jsx)
//else send the toast.

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { useToast, Spinner } from "@chakra-ui/react";

const CheckRoom = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const { roomId } = useParams();
  const toast = useToast();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setIsValid(false);
      return;
    }

    if (!roomId) {
      toast({ title: "Room ID is required", status: "error", duration: 3000, isClosable: true });
      setIsValid(false);
      return;
    }

    const verifyRoom = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/checkRoom/${roomId}`);
        setIsValid(data.status);

        if (!data.status) {
          toast({ title: "Room doesn't exist", status: "error", duration: 3000, isClosable: true });
        }
      } catch {
        toast({ title: "Something went wrong!", status: "error", duration: 3000, isClosable: true });
        setIsValid(false);
      }
    };

    verifyRoom();
  }, [roomId, toast]);

  if (isValid === false) return <Navigate to={!localStorage.getItem("user") ? "/login" : "/main"} />;

  if (isValid === null)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spinner size="xl" />
      </div>
    );

  return children;
};

export default CheckRoom;
