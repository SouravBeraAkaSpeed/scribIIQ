"use client";
import React, { useState } from "react";
import { client } from "@/lib/sanity_client";
import { Input } from "../input";
import { Label } from "../label";
import { toast } from "../ui/use-toast";
import axios from "axios";
import Loader2 from "../Loader2";

type AppointmentFormProps = {
  formType: "create" | "schedule" | "cancel";
  emailAddress: string | undefined | null;
  fullname: string | undefined | null;
  close: () => void;
};


const Appointment_html_body = (name: string, id: string, join_url: string, time: string) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zoom Meeting Invitation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .header img {
      width: 150px;
    }
    .content {
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 10px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      font-size: 12px;
      color: #888888;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      background-color: #007bff;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
    }
    .button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
   
    <div class="content">
      <h2>Zoom Meeting Invitation</h2>
      <p>Dear ${name},</p>
      <p>We are pleased to invite you to a Zoom meeting scheduled as follows:</p>
      <p><strong>Topic:</strong> New Appointment</p>
      <p><strong>Date & Time:</strong> ${time}</p>
      <p><strong>Meeting ID:</strong> ${id}</p>
      <p>To join the meeting, please click the button below:</p>
      <p>
        <a href="${join_url}" class="button">Join Meeting</a>
      </p>
      <p>If the button above does not work, you can join the meeting using the following link:</p>
      <p><a href="${join_url}">Joining Link</a></p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Toil Labs. All rights reserved.</p>
      <p>SS1286 Sector-h , Lko , Ind | Contact: <a href="mailto:contact@toil-labs.com">contact@toil-labs.com</a></p>
    </div>
  </div>
</body>
</html>`
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  formType,
  emailAddress,
  fullname,
  close
}) => {
  const [email, setEmail] = useState(emailAddress || "");
  const [name, setName] = useState(fullname || "");
  const [expectedDate, setExpectedDate] = useState("");
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [isLoading, setIsLoading] = useState(false)






  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true)



    try {

      await axios.post('http://localhost:3002/api/zoom/create-zoom-meeting', {
        hostEmail: "contact@toil-labs.com",
        attendeeEmail: email,
        startTime: expectedDate

      }).then(async (res) => {


        const response = await res.data;
        const join_url = response.meeting.join_url;
        const id = response.meeting.id;



        if (response.meeting) {
          const newAppointment = {
            _type: "appointment",
            email,
            name,
            startMeetingUrl: response.meeting.start_url,
            expectedDate: formType !== "cancel" ? expectedDate : undefined,
            reason: formType !== "cancel" ? reason : undefined,
            comments: formType !== "cancel" ? comments : undefined,
            phoneNumber: formType !== "cancel" ? phoneNumber : undefined,
            cancellationReason:
              formType === "cancel" ? cancellationReason : undefined,
            formType,
          };
          await client.create(newAppointment);




          await axios.post("http://localhost:3002/api/neura/send_mail_api", {
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            subject: `Zoom Appointment with Toil labs`,
            user: "contact@toil-labs.com",
            password: "Satutu190@@",
            from: "contact@toil-labs.com",
            to: email,
            html: Appointment_html_body(name, id, join_url, expectedDate),
            text: "Thanks for choosing Us!! Your Appointment is Fixed."
          })

          close()

          toast({
            title: "Appointment is created successfully 🎉",
            variant: "default"
          })

        }


      }).catch((reason) => {
        console.log(reason)
      });

    } catch (error) {
      console.log(error);
      toast({
        title: "Unknown error occurred!!",
        variant: "destructive"
      })
    }
  };

  if (isLoading) {
    return (
      <div className="
      flex flex-col w-full items-center justify-center min-h-[35%] py-10">

        <div className="flex my-10 ">
          <Loader2 />
        </div>

        <div className="text-md  text-gray-500 font-bold flex">
          Creating Appointment...
        </div>

      </div>

    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded text-black p-3  h-full"
    >
      {formType !== "cancel" && (
        <>
          <div className="mb-4 mt-2">
            <Label className="my-2 text-black font-bold">Full Name</Label>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div className="flex space-x-2 w-full ">

            <div className="my-4 w-1/2">
              <Label className="my-2 text-black font-bold">Email</Label>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div className="my-4 w-1/2">
              <Label className="my-2 text-black font-bold">Date</Label>
              <Input
                type="datetime-local"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                required
                className="w-full rounded text-white bg-black border px-3 py-2"
              />
              <span className="text-xs text-gray-500">Expected Appointment Date</span>
            </div>
          </div>
          <div className="my-4">
            <Label className="my-2 text-black font-bold">Reason for Appointment</Label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Ex: For Ai model development"
              className="w-full rounded border px-3 py-2"
            />
          </div>


          <div className="my-4">
            <Label className="my-2 text-black font-bold">Phone Number</Label>
            <Input
              type="tel"
              value={phoneNumber}
              placeholder="+1 8573938373"
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div className="my-4">
            <Label className="my-2 text-black font-bold">Comments/Note/Message</Label>
            <textarea
              placeholder="Message"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full rounded bg-white border px-3 py-2"
            />
          </div>
        </>
      )}
      {formType === "cancel" && (
        <div className="my-4">
          <Label className="my-2 dark:text-black font-bold">Reason for Cancellation</Label>
          <Input
            type="text"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
      )}
      <button
        type="submit"
        className="group/btn relative border-2 bg-transparent hover:shadow-md hover:shadow-purple-500 block h-10 w-full rounded-md bg-gradient-to-br font-medium text-black "
      >
        {formType === "create"
          ? "Create Appointment"
          : formType === "schedule"
            ? "Schedule Appointment"
            : "Cancel Appointment"}
      </button>
    </form>
  );
};
